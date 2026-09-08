import {decode,letterbox} from './detect.mjs?v=2';
const $=id=>document.getElementById(id),video=$('video'),canvas=$('canvas'),ctx=canvas.getContext('2d');
const frame=document.createElement('canvas'),fc=frame.getContext('2d'),input=document.createElement('canvas');input.width=input.height=640;
const ic=input.getContext('2d',{willReadFrequently:true});
let session=null,starting=false,active=false,busy=false,dirty=true,epoch=0,last=null,lastTime=-1,boxList=[];
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function position(){const t=Number.isFinite(video.currentTime)?video.currentTime:0,d=video.duration;$('time').textContent=`${fmt(t)} / ${Number.isFinite(d)?fmt(d):'—'}`;$('seek').value=t;}
function invalidate(){epoch++;dirty=true;last=null;$('count').textContent='—';canvas.style.visibility='hidden';}
function draw(){if(!last)return;ctx.drawImage(frame,0,0);if($('boxes').checked){ctx.strokeStyle='#cbf779';ctx.lineWidth=Math.max(2,canvas.width/350);ctx.font=`bold ${Math.max(14,canvas.width/48)}px sans-serif`;for(const b of boxList){const x=Math.max(0,b.x),y=Math.max(0,b.y),w=Math.min(canvas.width,b.x+b.w)-x,h=Math.min(canvas.height,b.y+b.h)-y;if(w<=0||h<=0)continue;ctx.strokeRect(x,y,w,h);const label=`人物 ${Math.round(b.score*100)}%`,tw=ctx.measureText(label).width+10,ly=Math.max(0,y-24);ctx.fillStyle='#cbf779';ctx.fillRect(x,ly,tw,24);ctx.fillStyle='#101619';ctx.fillText(label,x+5,ly+18);}}
 canvas.style.visibility='visible';$('count').textContent=boxList.length;
}
function classify(){if(!last)return;boxList=decode(last.data,last.n,last.geometry.scale,last.geometry.padX,last.geometry.padY,Number($('confidence').value)/100);draw();}
function ui(){const paused=video.paused;$('play').textContent=paused?'再生':'一時停止';$('play').setAttribute('aria-label',paused?'再生':'一時停止');if(active)$('state').textContent=paused?'一時停止':'人物を検出中';}
async function infer(){if(!session||busy||!active||video.readyState<2||video.seeking||document.hidden)return;
 if(!dirty&&(video.paused||Math.abs(video.currentTime-lastTime)<.08))return;
 busy=true;dirty=false;const ticket=epoch,t=video.currentTime,begin=performance.now();
 try{const w=video.videoWidth,h=video.videoHeight;if(frame.width!==w||frame.height!==h){frame.width=canvas.width=w;frame.height=canvas.height=h;}fc.drawImage(video,0,0,w,h);
 const g=letterbox(w,h);ic.fillStyle='rgb(114,114,114)';ic.fillRect(0,0,640,640);ic.drawImage(frame,0,0,w,h,g.padX,g.padY,g.width,g.height);
 const rgba=ic.getImageData(0,0,640,640).data,pixels=640*640,a=new Float32Array(3*pixels);for(let p=0;p<pixels;p++){a[p]=rgba[p*4]/255;a[p+pixels]=rgba[p*4+1]/255;a[p+2*pixels]=rgba[p*4+2]/255;}
 const tensor=new ort.Tensor('float32',a,[1,3,640,640]);let outputs;
 try{outputs=await session.run({[session.inputNames[0]]:tensor});}finally{tensor.dispose();}
 const out=outputs[session.outputNames[0]];
 if(ticket===epoch){last={data:Float32Array.from(out.data),n:out.dims[2],geometry:g};lastTime=t;classify();$('status').textContent=`${fmt(t)} の映像を解析`;$('performance').textContent=`1回の解析 ${(performance.now()-begin).toFixed(0)} ms · 人数は推定値`;}
 for(const output of Object.values(outputs))output.dispose();
 }catch(e){console.error(e);active=false;video.pause();$('state').textContent='解析を停止しました';$('message').textContent='解析できませんでした。もう一度お試しください。';$('cover').hidden=false;$('start').disabled=false;$('start').textContent='もう一度試す';$('status').textContent='解析エラー';$('count').textContent='—';last=null;canvas.style.visibility='hidden';session=null;
 }finally{busy=false;}
}
async function start(){if(starting)return;starting=true;$('start').disabled=true;$('message').textContent='YOLOを読み込み中… 初回は少し時間がかかります。';
 try{await video.play();
 if(!session){if(!globalThis.ort)throw new Error('Runtime unavailable');ort.env.wasm.wasmPaths=new URL('.',location.href).href;ort.env.wasm.numThreads=1;session=await ort.InferenceSession.create('person-model.onnx',{executionProviders:['wasm'],graphOptimizationLevel:'all'});}
 active=true;dirty=true;$('cover').hidden=true;for(const id of ['play','restart','seek'])$(id).disabled=false;ui();await infer();
 }catch(e){console.error(e);video.pause();$('message').textContent='読み込みに失敗しました。通信を確認して再試行してください。';$('start').disabled=false;$('start').textContent='もう一度試す';$('state').textContent='読み込みエラー';}
 finally{starting=false;}
}
$('start').onclick=start;
$('play').onclick=async()=>{if(video.paused){try{await video.play();dirty=true;}catch{$('status').textContent='再生できませんでした。もう一度再生を押してください。';}}else{video.pause();invalidate();}ui();};
$('restart').onclick=()=>{invalidate();video.currentTime=0;position();};
$('seek').oninput=()=>{invalidate();video.currentTime=Number($('seek').value);position();};
$('confidence').oninput=()=>{$('confidenceValue').textContent=`${$('confidence').value}%`;if(busy){invalidate();}else classify();};
$('boxes').onchange=()=>{if(!busy)draw();else dirty=true;};
video.addEventListener('loadedmetadata',()=>{$('seek').max=video.duration;video.currentTime=Math.min(15,video.duration/3);position();});
video.addEventListener('loadeddata',()=>{if(!active&&!starting){$('start').disabled=false;$('message').textContent='人物の動きをYOLOで見てみよう';$('state').textContent='再生待ち';}});
video.addEventListener('error',()=>{active=false;$('cover').hidden=false;$('message').textContent='映像を読み込めませんでした。再読み込みしてください。';$('start').disabled=true;$('status').textContent='映像の読み込みエラー';});
video.addEventListener('seeking',invalidate);video.addEventListener('seeked',()=>{dirty=true;position();});
video.addEventListener('timeupdate',position);video.addEventListener('play',ui);video.addEventListener('pause',ui);
video.addEventListener('ended',()=>{invalidate();video.currentTime=0;video.play().catch(()=>{$('status').textContent='続けるには再生を押してください。';});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();invalidate();}else{dirty=true;ui();}});
setInterval(infer,100);

if(video.readyState>=2){video.currentTime=Math.min(15,video.duration/3);$('start').disabled=false;$('message').textContent='人物の動きをYOLOで見てみよう';$('state').textContent='再生待ち';$('seek').max=video.duration;position();}
