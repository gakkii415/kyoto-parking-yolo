import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {decode,letterbox,iou} from '../web/detect.mjs';
const require=createRequire(import.meta.url),ort=require('../dist/ort.min.js');
const meta=JSON.parse(fs.readFileSync('dist/sample.json','utf8')),checks=[];
for(let i=0;i<meta.checks.length;i++){
 const m=meta.checks[i],b=fs.readFileSync(`dist/raw-${i}.bin`),a=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);
 const boxes=decode(a,8400,m.scale,m.padX,m.padY,.35);
 assert(boxes.length>0,`Real camera frame at ${m.time}s must detect persons`);
 assert(Math.abs(boxes.length-m.reference)<=1,'Decoder must agree with reference YOLO');
 checks.push({time:m.time,persons:boxes.length,reference:m.reference,boxes});fs.unlinkSync(`dist/raw-${i}.bin`);
}
// Run the shipped Web WASM runtime and model, not just Python inference.
ort.env.wasm.numThreads=1;
const s=await ort.InferenceSession.create(fs.readFileSync('dist/model.onnx'),{executionProviders:['wasm']});
const b=fs.readFileSync('dist/input.bin'),input=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4);
const outputs=await s.run({[s.inputNames[0]]:new ort.Tensor('float32',input,[1,3,640,640])});
const m=meta.checks[0],wasm=decode(outputs[s.outputNames[0]].data,8400,m.scale,m.padX,m.padY,.35);
assert.equal(wasm.length,checks[0].persons);await s.release();fs.unlinkSync('dist/input.bin');
assert.equal(decode(new Float32Array(84*8400)).length,0);
assert.equal(iou({x:0,y:0,w:2,h:2},{x:0,y:0,w:2,h:2}),1);
assert.deepEqual(letterbox(768,432),{scale:640/768,width:640,height:360,padX:0,padY:140});
fs.writeFileSync('dist/verification.json',JSON.stringify({model:meta.model,wasmPersons:wasm.length,checks},null,2));
console.log('VERIFIED_REAL_CAMERA_AND_WEB_WASM',JSON.stringify(checks.map(c=>({time:c.time,persons:c.persons,reference:c.reference}))));
