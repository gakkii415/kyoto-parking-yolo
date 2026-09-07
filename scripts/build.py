"""Build reproducible public sample and browser YOLO assets. No synthetic detections."""
import json, math, shutil, urllib.request
from pathlib import Path
from datetime import datetime, timezone
from PIL import Image
from io import BytesIO
import numpy as np
from ultralytics import YOLO
import onnxruntime as ort

out=Path('dist');out.mkdir(exist_ok=True)
shutil.copytree('web',out,dirs_exist_ok=True)
# GSI z18 aerial photograph, Kyoto Takaragaike south-west parking area.
z=18; x=229948; y=103778
url=f'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
raw=urllib.request.urlopen(url,timeout=60).read()
img=Image.open(BytesIO(raw)).convert('RGB').crop((0,128,128,256));img.save(out/'sample.jpg',quality=95)
model=YOLO('yolo11n-obb.pt')
assert model.names[9]=='large vehicle' and model.names[10]=='small vehicle',model.names
shutil.copy('LICENSE',out/'LICENSE')
path=model.export(format='onnx',imgsz=640,opset=17,simplify=False,nms=False,dynamic=False)
shutil.copy(path,out/'model.onnx')
session=ort.InferenceSession(str(out/'model.onnx'),providers=['CPUExecutionProvider'])
a=np.array(img.resize((640,640)),dtype=np.float32).transpose(2,0,1)[None]/255
pred=session.run(None,{session.get_inputs()[0].name:a})[0]
assert pred.shape==(1,20,8400),pred.shape
print('CLASS_MAX',[(model.names[i],float(pred[0,4+i].max())) for i in range(15)])
r=model.predict(img,imgsz=640,conf=.05,verbose=False)[0]
print('REFERENCE',r.obb.data.tolist())
# Keep raw outputs so the exact same browser decoder is tested during CI.
(out/'raw.bin').write_bytes(pred.astype('<f4').tobytes())
meta={'name':'京都・岩倉の駐車場','lat':35.062696,'lon':135.785897,'source':url,'captureDate':None,'retrievedAt':datetime.now(timezone.utc).isoformat(),'model':'YOLO11n-OBB / DOTA','width':128,'height':128,'crop':[0,128,128,256],'roi':[[46,88],[91,90],[82,127],[39,122]],'input':640}
(out/'sample.json').write_text(json.dumps(meta,ensure_ascii=False))
# Vendor runtime and WASM: same origin, no runtime CDN dependency.
base='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/'
for f in ['ort.min.js','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm']:
 urllib.request.urlretrieve(base+f,out/f)
print('BUILD_OK',json.dumps(meta,ensure_ascii=False))
