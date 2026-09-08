"""Build a real camera-video YOLO demo; no cached or synthetic detections."""
import json, shutil, urllib.request
from pathlib import Path
import cv2
import numpy as np
from ultralytics import YOLO
import onnxruntime as ort

out=Path('dist');out.mkdir(exist_ok=True)
shutil.copytree('web',out,dirs_exist_ok=True)
source='https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/57978890822836f2b4743852f04f62fc511757e4/'
urllib.request.urlretrieve(source+'store-aisle-detection.mp4',out/'camera.mp4')
urllib.request.urlretrieve(source+'LICENSE',out/'VIDEO-LICENSE.txt')
model=YOLO('yolo11n.pt')
assert model.names[0]=='person'
path=model.export(format='onnx',imgsz=640,opset=17,simplify=False,nms=False,dynamic=False)
shutil.copy(path,out/'model.onnx');shutil.copy('LICENSE',out/'LICENSE')
session=ort.InferenceSession(str(out/'model.onnx'),providers=['CPUExecutionProvider'])
video=cv2.VideoCapture(str(out/'camera.mp4'))
fps=video.get(cv2.CAP_PROP_FPS);duration=video.get(cv2.CAP_PROP_FRAME_COUNT)/fps
assert duration>10
checks=[]
for index,t in enumerate([15,25,35]):
 video.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=video.read();assert ok
 h,w=frame.shape[:2];scale=min(640/w,640/h);nw,nh=round(w*scale),round(h*scale);px,py=(640-nw)//2,(640-nh)//2
 rgb=cv2.cvtColor(frame,cv2.COLOR_BGR2RGB);padded=np.full((640,640,3),114,np.uint8);padded[py:py+nh,px:px+nw]=cv2.resize(rgb,(nw,nh))
 data=padded.astype(np.float32).transpose(2,0,1)[None]/255
 prediction=session.run(None,{session.get_inputs()[0].name:data})[0];assert prediction.shape==(1,84,8400)
 (out/f'raw-{index}.bin').write_bytes(prediction.astype('<f4').tobytes())
 if index==0:
  cv2.imwrite(str(out/'poster.jpg'),frame)
  (out/'input.bin').write_bytes(data.astype('<f4').tobytes())
 ref=model.predict(frame,imgsz=640,classes=[0],conf=.35,iou=.45,verbose=False)[0]
 checks.append({'time':t,'scale':scale,'padX':px,'padY':py,'reference':len(ref.boxes)})
video.release()
(out/'sample.json').write_text(json.dumps({'model':'YOLO11n / COCO','source':source+'store-aisle-detection.mp4','duration':duration,'checks':checks}))
base='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/'
for f in ['ort.min.js','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm']:
 urllib.request.urlretrieve(base+f,out/f)
print('CAMERA_BUILD',json.dumps(checks))
