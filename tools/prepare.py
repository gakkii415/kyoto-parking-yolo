"""Prepare real GSI aerial imagery and YOLO11n-OBB (AGPL-3.0). No mock counts."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib,json,math,shutil,time
import numpy as np
import requests,cv2,onnx,onnxruntime as ort
from PIL import Image,ImageDraw
from ultralytics import YOLO
OUT=Path('_site'); ASSETS=OUT/'assets'; ASSETS.mkdir(parents=True,exist_ok=True)
CACHE=Path('.asset-cache'); CACHE.mkdir(exist_ok=True)
NOW=datetime.now(timezone.utc).isoformat()
SITES=[
 {'id':'katsuragawa','name':'桂川駅周辺・屋上駐車場','district':'京都市南区','lat':34.9643,'lon':135.7084,'roi':[[.049,.579],[.789,.573],[.812,.81],[.038,.816]]},
 {'id':'icc','name':'国際会館周辺・屋外駐車場','district':'京都市左京区','lat':35.0620,'lon':135.7815,'roi':[[.258,.516],[.439,.477],[.444,.551],[.278,.578]]}]
def get(url):
 for attempt in range(3):
  try:
   r=requests.get(url,timeout=35);r.raise_for_status();return r.content
  except requests.RequestException:
   if attempt==2:raise
   time.sleep(1+attempt)
def mosaic(site):
 z,size=18,768;n=2**z
 cx=(site['lon']+180)/360*n*256;cy=(1-math.asinh(math.tan(math.radians(site['lat'])))/math.pi)/2*n*256
 left,top=round(cx-size/2),round(cy-size/2)
 tiles=[(x,y) for y in range(top//256,(top+size-1)//256+1) for x in range(left//256,(left+size-1)//256+1)]
 def tile(xy):
  x,y=xy;url=f'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg';key=CACHE/f'seamlessphoto-{z}-{x}-{y}.jpg'
  if not key.exists():key.write_bytes(get(url))
  im=Image.open(key).convert('RGB');assert im.size==(256,256)
  return x,y,im,url
 canvas=Image.new('RGB',(size,size));urls=[]
 with ThreadPoolExecutor(max_workers=4) as pool:
  for x,y,im,url in pool.map(tile,tiles):canvas.paste(im,(x*256-left,y*256-top));urls.append(url)
 name=site['id']+'-seamlessphoto';canvas.save(ASSETS/f'{name}.jpg',quality=96)
 return canvas,{'id':name,'siteId':site['id'],'name':site['name'],'district':site['district'],'image':f'assets/{name}.jpg','width':size,'height':size,'latitude':site['lat'],'longitude':site['lon'],'zoom':z,'globalPixelOrigin':[left,top],'layer':'seamlessphoto','source':'国土地理院・地理院タイル（切り出し・結合）','sourceUrl':'https://maps.gsi.go.jp/development/ichiran.html','sourceTiles':urls,'acquiredAt':None,'retrievedAt':NOW,'captureLabel':'撮影日不明・配信写真','sha256':hashlib.sha256((ASSETS/f'{name}.jpg').read_bytes()).hexdigest(),'roi':site['roi']}
weights=CACHE/'yolo11n-obb.pt'
if not weights.exists():weights.write_bytes(get('https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n-obb.pt'))
model=YOLO(str(weights));model_path=CACHE/'yolo11n-obb.onnx'
if not model_path.exists():
 exported=model.export(format='onnx',imgsz=640,dynamic=False,simplify=False,opset=17,batch=1,nms=False,device='cpu')
 if Path(exported)!=model_path:shutil.copy2(exported,model_path)
onnx.checker.check_model(str(model_path));shutil.copy2(model_path,ASSETS/'yolo11n-obb.onnx')
classes={int(k):v.replace(' ','-') for k,v in model.names.items()};vehicle_ids=[i for i,n in classes.items() if n in ('small-vehicle','large-vehicle')];assert len(vehicle_ids)==2
session=ort.InferenceSession(str(model_path),providers=['CPUExecutionProvider'])
shape=session.run(None,{'images':np.zeros((1,3,640,640),dtype=np.float32)})[0].shape;assert shape==(1,20,8400)
metadata={'name':'YOLO11n-OBB','task':'obb','inputSize':640,'classes':classes,'vehicleIds':vehicle_ids,'outputShape':list(shape),'license':'AGPL-3.0','source':'https://github.com/ultralytics/assets/releases/tag/v8.3.0','weightsSha256':hashlib.sha256(weights.read_bytes()).hexdigest(),'onnxSha256':hashlib.sha256(model_path.read_bytes()).hexdigest(),'ultralyticsVersion':'8.3.203','onnxBytes':model_path.stat().st_size}
(ASSETS/'model.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
def offsets(length,tile):
 if length<=tile:return [0]
 return sorted(set(list(range(0,length-tile,round(tile*.75)))+[length-tile]))
def infer(im,tile=384):
 rgb=np.asarray(im);candidates=[];maxima=np.zeros(15)
 for y in offsets(im.height,tile):
  for x in offsets(im.width,tile):
   crop=rgb[y:y+tile,x:x+tile];h,w=crop.shape[:2];scale=640/max(h,w);rw,rh=round(w*scale),round(h*scale);px,py=round((640-rw)/2),round((640-rh)/2)
   letter=np.full((640,640,3),114,dtype=np.uint8);letter[py:py+rh,px:px+rw]=cv2.resize(crop,(rw,rh))
   a=session.run(None,{'images':np.ascontiguousarray(letter.transpose(2,0,1)[None],dtype=np.float32)/255})[0][0]
   scores=a[4:19];maxima=np.maximum(maxima,scores.max(axis=1));ids=scores.argmax(axis=0);best=scores.max(axis=0)
   for i in np.where((best>=.08)&np.isin(ids,vehicle_ids))[0]:
    cx,cy=(a[0,i]-px)/scale,(a[1,i]-py)/scale
    if not(0<=cx<=w and 0<=cy<=h):continue
    candidates.append({'cx':float(cx+x),'cy':float(cy+y),'w':float(a[2,i]/scale),'h':float(a[3,i]/scale),'angle':float(a[19,i]),'score':float(best[i]),'classId':int(ids[i])})
 boxes=[((b['cx'],b['cy']),(b['w'],b['h']),math.degrees(b['angle'])) for b in candidates]
 keep=cv2.dnn.NMSBoxesRotated(boxes,[b['score'] for b in candidates],.08,.3) if boxes else []
 return [candidates[int(i)] for i in np.array(keep).flatten()],dict(zip(classes.values(),map(float,maxima)))
examples=[];diagnostics=[]
for site in SITES:
 im,record=mosaic(site);detections,maxima=infer(im)
 record['preview']={'engine':'YOLO11n-OBB / ONNX CPU','generatedAt':NOW,'detections':detections,'confidence':.08,'tileSize':384}
 draw=ImageDraw.Draw(im)
 for b in detections:
  if b['score']<.25:continue
  cs=math.cos(b['angle']);sn=math.sin(b['angle']);points=[(b['cx']+u*cs-v*sn,b['cy']+u*sn+v*cs) for u,v in [(-b['w']/2,-b['h']/2),(b['w']/2,-b['h']/2),(b['w']/2,b['h']/2),(-b['w']/2,b['h']/2)]];draw.line(points+[points[0]],fill='#c0f27b',width=2)
 im.save(ASSETS/f"{site['id']}-preview.jpg")
 examples.append(record);diagnostics.append({'site':site['id'],'detections':len(detections),'maximumScores':maxima});print('SAMPLE',site['id'],len(detections),maxima,flush=True)
(ASSETS/'examples.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2));(ASSETS/'diagnostics.json').write_text(json.dumps(diagnostics,indent=2))
(OUT/'LICENSE-AGPL-3.0.txt').write_bytes(get('https://raw.githubusercontent.com/ultralytics/ultralytics/v8.3.203/LICENSE'))
(OUT/'vendor').mkdir(exist_ok=True)
(OUT/'vendor/ONNX-RUNTIME-LICENSE.txt').write_bytes(get('https://raw.githubusercontent.com/microsoft/onnxruntime/v1.20.1/LICENSE'))
