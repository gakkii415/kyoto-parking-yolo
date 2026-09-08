import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {objects,mask,track,inArea,labels} from '../web/detect.mjs';
const require=createRequire(import.meta.url),ort=require('../dist/ort.min.js');ort.env.wasm.numThreads=1;
const meta=JSON.parse(fs.readFileSync('dist/sample.json')),results=[];
for(const kind of ['detect','segment','pose']){
 const session=await ort.InferenceSession.create(fs.readFileSync(`dist/model-${kind}-v4.onnx`),{executionProviders:['wasm']});
 for(const check of meta.checks.filter(c=>kind==='detect'||c.scene==='store')){
 const buf=fs.readFileSync(`dist/${check.scene}-input.bin`),data=new Float32Array(buf.buffer,buf.byteOffset,buf.byteLength/4),tensor=new ort.Tensor('float32',data,[1,3,640,640]);const output=await session.run({[session.inputNames[0]]:tensor});tensor.dispose();const pred=output[session.outputNames[0]],n=pred.dims[2];
 assert.equal(pred.dims[1],kind==='pose'?56:kind==='segment'?116:84);
 const boxes=objects(pred.data,n,check.geometry,.35,kind);assert(boxes.length>0,kind+' / '+check.scene+' must yield real detections');
 const r={kind,scene:check.scene,count:boxes.length,classes:[...new Set(boxes.map(b=>labels[b.cls]))]};
 if(kind==='segment'){const proto=output[session.outputNames[1]];assert.deepEqual(proto.dims,[1,32,160,160]);r.maskPixels=mask(boxes[0],pred.data,n,proto.data,check.geometry).reduce((a,b)=>a+b,0);assert(r.maskPixels>10);}
 if(kind==='pose'){r.visibleJoints=boxes.flatMap(b=>b.points).filter(p=>p[2]>.4).length;assert(r.visibleJoints>5);}
 if(kind==='detect'&&check.scene==='road')assert(boxes.some(b=>[2,3,5,7].includes(b.cls)),'Road must detect vehicles');
 results.push(r);for(const x of Object.values(output))x.dispose();
 }
 await session.release();
}
let a=track([{x:10,y:10,w:20,h:20,cls:0}],[],1);let b=track([{x:12,y:11,w:20,h:20,cls:0}],a.tracks,a.nextId);assert.equal(a.tracks[0].id,b.tracks[0].id);assert.equal(b.tracks[0].trail.length,2);assert(inArea({x:40,y:40,w:20,h:20},100,100));assert(!inArea({x:0,y:0,w:10,h:10},100,100));
for(const c of meta.checks)fs.unlinkSync(`dist/${c.scene}-input.bin`);
fs.writeFileSync('dist/verification.json',JSON.stringify(results,null,2));console.log('VERIFIED_PATTERNS',JSON.stringify(results));
