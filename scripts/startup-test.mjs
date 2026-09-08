// Event-level regression tests with stub media/inference, not a browser test.
import assert from 'node:assert/strict';
const context={beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){},drawImage(){},fillRect(){},strokeRect(){},fillText(){},measureText(){return{width:50}},getImageData(){return{data:new Uint8ClampedArray(640*640*4)}}};
class Element extends EventTarget { constructor(){super();this.style={};this.value='35';this.checked=true;this.disabled=true;this.width=300;this.height=150;this.hidden=false;}getContext(){return context}setAttribute(){} }
const els=new Map();const el=id=>{if(!els.has(id))els.set(id,new Element());return els.get(id)};
const buttons=['detect','segment','pose','track','area'].map(mode=>Object.assign(new Element(),{dataset:{mode}}));
const v=el('video');Object.assign(v,{readyState:0,videoWidth:720,videoHeight:404,duration:65,currentTime:15,paused:true,seeking:false});
v.load=()=>{v.readyState=0};
v.play=async()=>{v.readyState=2;v.paused=false;v.dispatchEvent(new Event('play'))};v.pause=()=>{v.paused=true;v.dispatchEvent(new Event('pause'))};
globalThis.document=Object.assign(new EventTarget(),{hidden:false,getElementById:el,createElement:()=>new Element(),querySelectorAll:()=>buttons});
globalThis.location={href:'https://example.test/camera/'};let tick;globalThis.setInterval=f=>{tick=f};
let pending=null;function output(){const data=new Float32Array(84*8400);data[0]=320;data[8400]=320;data[2*8400]=80;data[3*8400]=180;data[4*8400]=.8;return{output:{data,dims:[1,84,8400],dispose(){}}}}
globalThis.ort={env:{wasm:{}},Tensor:class{dispose(){}},InferenceSession:{create:async()=>({inputNames:['input'],outputNames:['output'],run:async()=>pending?await pending:output()})}};
globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>new ArrayBuffer(4)});
await import('../web/app.mjs');
assert.equal(v.readyState,0);
assert.equal(el('start').disabled,false);
await el('start').onclick();assert.equal(el('count').textContent,1);
el('confidence').value='90';el('confidence').oninput();assert.equal(el('count').textContent,0);
el('confidence').value='35';el('confidence').oninput();assert.equal(el('count').textContent,1);
let resolve;pending=new Promise(r=>resolve=r);v.currentTime=17;const inFlight=tick();
el('seek').value='25';el('seek').oninput();assert.equal(el('count').textContent,'—');
resolve(output());await inFlight;assert.equal(el('count').textContent,'—','An old frame may not replace a seek result');pending=null;
await tick();assert.equal(el('count').textContent,1);assert.match(el('status').textContent,/0:25/);
await el('play').onclick();assert(v.paused);await tick();assert.equal(el('count').textContent,1);
el('restart').onclick();await tick();assert.match(el('status').textContent,/0:00/);
console.log('PASS: app events: start, threshold, stale inference after seek, pause, restart');

const realTimer=globalThis.setTimeout;globalThis.setTimeout=(fn,ms)=>realTimer(fn,ms===20000?0:ms);const realPlay=v.play;v.play=()=>new Promise(()=>{});
const savedError=console.error;console.error=()=>{};await el('start').onclick();console.error=savedError;assert.equal(el('start').disabled,false);assert.match(el('state').textContent,/再試行/);
v.play=realPlay;globalThis.setTimeout=realTimer;await el('start').onclick();assert.equal(el('count').textContent,1);
console.log('PASS: zero-preload / no loadeddata, play timeout, retry recovery');

buttons.find(b=>b.dataset.mode==='area').onclick();assert.equal(el('play').disabled,true);assert.equal(el('count').textContent,'—');await el('start').onclick();assert.equal(el('count').textContent,1);
buttons.find(b=>b.dataset.mode==='track').onclick();await el('start').onclick();assert.equal(el('count').textContent,1);
el('scene').value='road';el('scene').onchange();assert.equal(v.src,'road.mp4');assert.equal(el('count').textContent,'—');assert.equal(el('start').disabled,false);await el('start').onclick();assert.equal(el('count').textContent,1);
console.log('PASS: mode switch, transport gating, source reset and restart');
