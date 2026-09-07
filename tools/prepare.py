"""Prepare real, attributable aerial examples and official YOLO11n-OBB weights.
No simulated observations. Run in GitHub Actions; output is a Pages artifact.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import hashlib, io, json, math, shutil, time
from datetime import datetime, timezone
import numpy as np
import requests
from PIL import Image, ImageDraw
from ultralytics import YOLO
import onnx
import onnxruntime as ort

OUT = Path('_site')
ASSETS = OUT / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
CACHE = Path('.asset-cache')
CACHE.mkdir(exist_ok=True)
NOW = datetime.now(timezone.utc).isoformat()
SITES = [
    {'id': 'icc', 'name': '国際会館周辺', 'district': '京都市左京区', 'lat': 35.0620, 'lon': 135.7815},
    {'id': 'katsuragawa', 'name': '桂川駅・商業施設周辺', 'district': '京都市南区', 'lat': 34.9643, 'lon': 135.7084},
    {'id': 'botanical', 'name': '京都府立植物園周辺', 'district': '京都市左京区', 'lat': 35.0482, 'lon': 135.7643},
]

def get(url):
    for attempt in range(3):
        try:
            r = requests.get(url, timeout=35)
            r.raise_for_status()
            return r.content
        except requests.RequestException:
            if attempt == 2: raise
            time.sleep(1 + attempt)

def mosaic(site, layer='seamlessphoto'):
    z, size = 18, 768
    n = 2 ** z
    cx = (site['lon'] + 180) / 360 * n * 256
    cy = (1 - math.asinh(math.tan(math.radians(site['lat']))) / math.pi) / 2 * n * 256
    left, top = round(cx - size/2), round(cy - size/2)
    tiles = [(x, y) for y in range(top//256, (top+size-1)//256+1)
             for x in range(left//256, (left+size-1)//256+1)]
    ext = 'jpg' if layer == 'seamlessphoto' else 'png'
    def tile(xy):
        x, y = xy
        url = f'https://cyberjapandata.gsi.go.jp/xyz/{layer}/{z}/{x}/{y}.{ext}'
        key = CACHE / f'{layer}-{z}-{x}-{y}.{ext}'
        if not key.exists(): key.write_bytes(get(url))
        im = Image.open(key).convert('RGBA')
        if im.size != (256,256) or im.getchannel('A').getextrema()[0] < 255:
            raise ValueError('Incomplete imagery coverage')
        return x,y,im,url
    canvas = Image.new('RGB', (size,size))
    urls=[]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for x,y,im,url in pool.map(tile,tiles):
            canvas.paste(im.convert('RGB'), (x*256-left, y*256-top))
            urls.append(url)
    name = f"{site['id']}-{layer}"
    canvas.save(ASSETS/f'{name}.jpg', quality=96)
    return canvas, {'id':name,'siteId':site['id'],'name':site['name'],'district':site['district'],
                   'image':f'assets/{name}.jpg','width':size,'height':size,
                   'latitude':site['lat'],'longitude':site['lon'],'zoom':z,
                   'globalPixelOrigin':[left,top], 'layer':layer,
                   'source':'国土地理院・地理院タイル（切り出し・結合）',
                   'sourceUrl':'https://maps.gsi.go.jp/development/ichiran.html',
                   'sourceTiles':urls,'acquiredAt':None,'retrievedAt':NOW,
                   'captureLabel':'撮影日不明・配信写真' if layer=='seamlessphoto' else layer.replace('nendophoto','')+'年度の航空写真',
                   'sha256':hashlib.sha256((ASSETS/f'{name}.jpg').read_bytes()).hexdigest(),
                   'roi':[[0,0],[1,0],[1,1],[0,1]]}

weights = CACHE / 'yolo11n-obb.pt'
if not weights.exists():
    weights.write_bytes(get('https://github.com/ultralytics/assets/releases/download/v8.3.0/yolo11n-obb.pt'))
model = YOLO(str(weights))
model_path = CACHE / 'yolo11n-obb.onnx'
if not model_path.exists():
    exported = model.export(format='onnx', imgsz=640, dynamic=False, simplify=False, opset=17, batch=1, nms=False, device='cpu')
    if Path(exported) != model_path: shutil.copy2(exported,model_path)
onnx.checker.check_model(str(model_path))
shutil.copy2(model_path, ASSETS / 'yolo11n-obb.onnx')
classes = {int(k):v for k,v in model.names.items()}
vehicle_ids = [i for i,n in classes.items() if n in ('small-vehicle','large-vehicle')]
assert len(vehicle_ids)==2, classes
session = ort.InferenceSession(str(model_path), providers=['CPUExecutionProvider'])
shape = session.run(None, {'images':np.zeros((1,3,640,640),dtype=np.float32)})[0].shape
assert shape[1]==4+len(classes)+1, shape
metadata = {'name':'YOLO11n-OBB','task':'obb','inputSize':640,'classes':classes,
            'vehicleIds':vehicle_ids,'outputShape':list(shape),'license':'AGPL-3.0',
            'source':'https://github.com/ultralytics/assets/releases/tag/v8.3.0',
            'weightsSha256':hashlib.sha256(weights.read_bytes()).hexdigest(),
            'onnxSha256':hashlib.sha256(model_path.read_bytes()).hexdigest(),
            'ultralyticsVersion':'8.3.203','onnxBytes':model_path.stat().st_size}
(ASSETS/'model.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
examples=[]
for site in SITES:
    im, record = mosaic(site)
    # Actual model result is a preview only. Browser performs its own inference.
    pred = model.predict(im, imgsz=1024, conf=.15, classes=vehicle_ids, verbose=False)[0]
    detections=[]
    for xywhr,conf,cls in zip(pred.obb.xywhr.tolist(),pred.obb.conf.tolist(),pred.obb.cls.tolist()):
        detections.append({'cx':xywhr[0],'cy':xywhr[1],'w':xywhr[2],'h':xywhr[3],
                           'angle':xywhr[4],'score':conf,'classId':int(cls)})
    record['preview']={'engine':'YOLO11n-OBB / Python','generatedAt':NOW,'detections':detections,'confidence':.15}
    annotated=Image.fromarray(pred.plot()[:,:,::-1])
    annotated.save(ASSETS/f"{site['id']}-preview.jpg")
    examples.append(record)
    print('SAMPLE',site['id'],'ACTUAL_DETECTIONS',len(detections),flush=True)
(ASSETS/'examples.json').write_text(json.dumps(examples,ensure_ascii=False,indent=2))
# Include the source/terms used for this openly distributed demo.
license_text=get('https://raw.githubusercontent.com/ultralytics/ultralytics/v8.3.203/LICENSE')
(OUT/'LICENSE-AGPL-3.0.txt').write_bytes(license_text)
print('MODEL',json.dumps(metadata,ensure_ascii=False),flush=True)
