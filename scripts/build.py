"""Package public camera videos and actual YOLO detect / segment / pose models."""
import json,shutil,urllib.request
from pathlib import Path
import cv2,numpy as np
from ultralytics import YOLO
out=Path('dist');out.mkdir(exist_ok=True);shutil.copytree('web',out,dirs_exist_ok=True)
source='https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/57978890822836f2b4743852f04f62fc511757e4/'
checks=[]
detector=YOLO('yolo11n.pt')
for key,name,t in [('store','store-aisle-detection',35),('road','car-detection',5),('street','person-bicycle-car-detection',5)]:
 target='camera' if key=='store' else key
 urllib.request.urlretrieve(source+name+'.mp4',out/(target+'.mp4'))
 video=cv2.VideoCapture(str(out/(target+'.mp4')));duration=video.get(cv2.CAP_PROP_FRAME_COUNT)/video.get(cv2.CAP_PROP_FPS);assert duration>1
 found=False
 for chosen in [min(t,duration/2),duration*.2,duration*.4,duration*.6,duration*.8]:
  video.set(cv2.CAP_PROP_POS_MSEC,chosen*1000);ok,frame=video.read()
  if not ok:continue
  result=detector.predict(frame,imgsz=640,conf=.35,rect=False,verbose=False)[0]
  cls=result.boxes.cls.tolist()
  if (key=='road' and any(c in [2,3,5,7] for c in cls)) or (key!='road' and len(cls)>0):found=True;break
 assert found,f'No suitable objects in {key}'
 video.release()
 cv2.imwrite(str(out/('poster.jpg' if key=='store' else key+'.jpg')),frame)
 h,w=frame.shape[:2];scale=min(640/w,640/h);nw,nh=round(w*scale),round(h*scale);px,py=(640-nw)//2,(640-nh)//2
 rgb=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB);pad=np.full((640,640,3),114,np.uint8);pad[py:py+nh,px:px+nw]=cv2.resize(rgb,(nw,nh));a=pad.astype(np.float32).transpose(2,0,1)[None]/255
 (out/(key+'-input.bin')).write_bytes(a.astype('<f4').tobytes())
 checks.append({'scene':key,'geometry':{'scale':scale,'padX':px,'padY':py,'width':nw,'height':nh},'duration':duration,'time':chosen})
for kind,name in [('detect','yolo11n'),('segment','yolo11n-seg'),('pose','yolo11n-pose')]:
 model=YOLO(name+'.pt');path=model.export(format='onnx',imgsz=640,opset=17,simplify=False,nms=False,dynamic=False);shutil.copy(path,out/f'model-{kind}-v4.onnx')
urllib.request.urlretrieve(source+'LICENSE',out/'VIDEO-LICENSE.txt');shutil.copy('LICENSE',out/'LICENSE')
(out/'sample.json').write_text(json.dumps({'checks':checks}))
for f in ['ort.min.js','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm']:
 urllib.request.urlretrieve('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/'+f,out/f)
print('BUILD_PATTERNS',json.dumps(checks))
