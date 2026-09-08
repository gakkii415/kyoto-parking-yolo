import {objects,letterbox,labels,bones,mask,track,inArea} from './detect.mjs?v=4';
const $=id=>document.getElementById(id),video=$('video'),canvas=$('canvas'),ctx=canvas.getContext('2d');
const frame=document.createElement('canvas'),fc=frame.getContext('2d'),input=document.createElement('canvas');input.width=input.height=640;
const ic=input.getContext('2d',{willReadFrequently:true});
const scenes={store:['店舗の固定カメラ','camera.mp4','poster.jpg','store-aisle-detection.mp4'],road:['道路の車','road.mp4','road.jpg','car-detection.mp4'],street:['人・自転車・車','street.mp4','street.jpg','person-bicycle-car-detection.mp4']};
const hints={detect:'人・車・自転車・食器など、対象に名前と枠を表示します。',segment:'対象の形に沿って色を塗ります。輪郭専用のYOLOを使います。',pose:'人の肩・肘・膝などを点と線で表示します。骨格は人専用です。',track:'同じ対象を仮番号で追い、移動の軌跡を表示します。隠れると番号が変わる場合があります。',area:'中央の水色エリアに、対象の中心が入ると強調します。数字はエリア内の対象数です。'};
let mode='detect',sessionKind='',tracks=[],nextId=1;
const kind=()=>mode==='segment'?'segment':mode==='pose'?'pose':'detect';
let session=null,starting=false,active=false,busy=false,dirty=true,epoch=0,last=null,lastTime=-1,boxList=[];
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function position(){const t=Number.isFinite(video.currentTime)?video.currentTime:0,d=video.duration;$('time').textContent=`${fmt(t)} / ${Number.isFinite(d)?fmt(d):'—'}`;$('seek').value=t;}
function invalidate(){tracks=[];nextId=1;epoch++;dirty=true;last=null;$('count').textContent='—';canvas.style.visibility='hidden';}
const colors=['#cbf779','#6bd9f5','#ffaf7b','#e9a6ff','#ffe078'];
function draw(){if(!last)return;ctx.drawImage(frame,0,0);const w=canvas.width,h=canvas.height;
 if($('boxes').checked){
 if(mode==='area'){ctx.strokeStyle='#6bd9f5';ctx.lineWidth=3;ctx.strokeRect(w*.25,h*.2,w*.5,h*.6);}
 if(mode==='segment'&&last.proto){const layer=document.createElement('canvas');layer.width=layer.height=160;const lc=layer.getContext('2d'),pixels=lc.createImageData(160,160);
 for(let j=0;j<boxList.length;j++){const values=mask(boxList[j],last.data,last.n,last.proto,last.geometry);const hex=colors[j%colors.length];for(let i=0;i<values.length;i++)if(values[i]){pixels.data[i*4]=parseInt(hex.slice(1,3),16);pixels.data[i*4+1]=parseInt(hex.slice(3,5),16);pixels.data[i*4+2]=parseInt(hex.slice(5,7),16);pixels.data[i*4+3]=140;}}
 lc.putImageData(pixels,0,0);const g=last.geometry;ctx.drawImage(layer,g.padX/4,g.padY/4,g.width/4,g.height/4,0,0,w,h);}
 for(let j=0;j<boxList.length;j++){const b=boxList[j],color=colors[j%colors.length];ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=Math.max(2,w/300);
 if(mode==='pose'){for(const [a,z] of bones){const p=b.points[a],q=b.points[z];if(p[2]<.4||q[2]<.4)continue;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}for(const p of b.points){if(p[2]<.4)continue;ctx.beginPath();ctx.arc(p[0],p[1],Math.max(3,w/180),0,Math.PI*2);ctx.fill();}}
 else if(mode==='track'){ctx.beginPath();b.trail.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();ctx.beginPath();ctx.arc(b.x+b.w/2,b.y+b.h/2,5,0,Math.PI*2);ctx.fill();}
 else if(mode!=='segment'){ctx.globalAlpha=mode==='area'&&!inArea(b,w,h)?.3:1;ctx.strokeRect(b.x,b.y,b.w,b.h);ctx.globalAlpha=1;}
 const label=`${mode==='track'?'#'+b.id+' ':''}${labels[b.cls]} ${Math.round(b.score*100)}%`;ctx.font=`bold ${Math.max(14,w/48)}px sans-serif`;const tw=ctx.measureText(label).width+10,x=Math.max(0,Math.min(w-tw,b.x)),y=Math.max(0,b.y-24);ctx.fillStyle=color;ctx.fillRect(x,y,tw,24);ctx.fillStyle='#101619';ctx.fillText(label,x+5,y+18);
 }}
 canvas.style.visibility='visible';const counted=mode==='area'?boxList.filter(b=>inArea(b,w,h)):boxList;$('count').textContent=counted.length;const totals={};for(const b of counted)totals[labels[b.cls]]=(totals[labels[b.cls]]||0)+1;$('breakdown').textContent=Object.entries(totals).map(([label,n])=>`${label} ${n}`).join(' ／ ')||'この場面では対象を検出していません。';
}
function classify(){if(!last)return;boxList=objects(last.data,last.n,last.geometry,Number($('confidence').value)/100,kind(),mode==='pose'?'person':$('filter').value);if(mode==='track'){const result=track(boxList,tracks,nextId);tracks=result.tracks;nextId=result.nextId;boxList=tracks;}draw();}
function ui(){const paused=video.paused;$('play').textContent=paused?'再生':'一時停止';$('play').setAttribute('aria-label',paused?'再生':'一時停止');if(active)$('state').textContent=paused?'一時停止':'検出中';}
async function infer(){if(!session||busy||!active||video.readyState<2||video.seeking||document.hidden)return;
 if(!dirty&&(video.paused||Math.abs(video.currentTime-lastTime)<.08))return;
 busy=true;dirty=false;const ticket=epoch,t=video.currentTime,begin=performance.now();
 try{const w=video.videoWidth,h=video.videoHeight;if(frame.width!==w||frame.height!==h){frame.width=canvas.width=w;frame.height=canvas.height=h;}fc.drawImage(video,0,0,w,h);
 const g=letterbox(w,h);ic.fillStyle='rgb(114,114,114)';ic.fillRect(0,0,640,640);ic.drawImage(frame,0,0,w,h,g.padX,g.padY,g.width,g.height);
 const rgba=ic.getImageData(0,0,640,640).data,pixels=640*640,a=new Float32Array(3*pixels);for(let p=0;p<pixels;p++){a[p]=rgba[p*4]/255;a[p+pixels]=rgba[p*4+1]/255;a[p+2*pixels]=rgba[p*4+2]/255;}
 const tensor=new ort.Tensor('float32',a,[1,3,640,640]);let outputs;
 try{outputs=await session.run({[session.inputNames[0]]:tensor});}finally{tensor.dispose();}
 const out=outputs[session.outputNames[0]];
 if(ticket===epoch){last={data:Float32Array.from(out.data),n:out.dims[2],geometry:g,proto:session.outputNames.length>1?Float32Array.from(outputs[session.outputNames[1]].data):null};lastTime=t;classify();$('status').textContent=`${fmt(t)} の映像を解析`;$('performance').textContent=`1回の解析 ${(performance.now()-begin).toFixed(0)} ms · 検出結果は推定値`;}
 for(const output of Object.values(outputs))output.dispose();
 }catch(e){console.error(e);active=false;video.pause();$('state').textContent='解析を停止しました';$('message').textContent='解析できませんでした。もう一度お試しください。';$('cover').hidden=false;$('start').disabled=false;$('start').textContent='もう一度試す';$('status').textContent='解析エラー';$('count').textContent='—';last=null;canvas.style.visibility='hidden';session=null;
 }finally{busy=false;}
}
function timeout(promise,ms,label){let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(label)),ms);})]).finally(()=>clearTimeout(timer));}
async function runtime(){
 if(globalThis.ort)return;
 const script=document.createElement('script');script.src='ort.min.js';
 try{await timeout(new Promise((resolve,reject)=>{script.onload=resolve;script.onerror=()=>reject(new Error('runtime'));document.head.appendChild(script);}),30000,'runtime timeout');}finally{script.remove();}
}
async function start(){if(starting)return;starting=true;lock(true);active=false;$('start').disabled=true;$('cover').hidden=false;$('message').textContent='映像を再生しています…';$('state').textContent='映像を読み込み中';
 try{
 // Call play directly in the tap handler. Do not wait for preload/loadeddata.
 video.muted=true;video.playsInline=true;if(video.error)video.load();
 await timeout(video.play(),20000,'video timeout');
 $('message').textContent='YOLOを読み込み中… 初回は少し時間がかかります。';$('state').textContent='YOLOを準備中';
 while(busy)await new Promise(resolve=>setTimeout(resolve,25));
 if(session&&sessionKind!==kind()){await session.release();session=null;}
 if(!session){await runtime();ort.env.wasm.wasmPaths=new URL('.',location.href).href;ort.env.wasm.numThreads=1;
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
 let bytes;try{const response=await fetch(`model-${kind()}-v4.onnx`,{signal:controller.signal});if(!response.ok)throw new Error('model download');bytes=await response.arrayBuffer();}finally{clearTimeout(timer);}
 const creation=ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
 try{session=await timeout(creation,45000,'model timeout');sessionKind=kind();}catch(e){creation.then(s=>s.release()).catch(()=>{});throw e;}
 }
 active=true;dirty=true;$('cover').hidden=true;for(const id of ['play','restart','seek'])$(id).disabled=false;ui();await infer();
 }catch(e){console.error(e);active=false;video.pause();$('message').textContent='読み込みが完了しませんでした。ボタンを押して再試行できます。';$('start').disabled=false;$('start').textContent='もう一度試す';$('state').textContent='読み込みを再試行できます';$('status').textContent='読み込みを中断しました';}
 finally{starting=false;lock(false);}
}
function lock(value){$('scene').disabled=value;$('filter').disabled=value||mode==='pose';for(const button of document.querySelectorAll('[data-mode]'))button.disabled=value;}
function prepare(){active=false;video.pause();invalidate();$('cover').hidden=false;$('start').disabled=false;$('start').textContent='このモードで開始';$('message').textContent='ボタンを押すと解析を開始します。';$('state').textContent='開始できます';$('countLabel').textContent=mode==='area'?'エリア内の対象':'検出した対象';$('countUnit').textContent=mode==='pose'?'人':'件';$('modeHint').textContent=hints[mode];$('breakdown').textContent='開始すると種類ごとの数を表示します。';lock(false);}
for(const button of document.querySelectorAll('[data-mode]'))button.onclick=()=>{if(starting)return;mode=button.dataset.mode;for(const other of document.querySelectorAll('[data-mode]'))other.setAttribute('aria-pressed',String(other===button));prepare();};
$('scene').onchange=()=>{prepare();const scene=scenes[$('scene').value];video.src=scene[1];video.poster=scene[2];video.load();$('sceneTitle').textContent=scene[0];$('sourceLink').href='https://github.com/intel-iot-devkit/sample-videos/blob/master/'+scene[3];$('sourceLink').textContent='Intel / '+scene[3];};
$('filter').onchange=()=>{if(busy)invalidate();else{tracks=[];classify();}};
$('start').onclick=start;
$('play').onclick=async()=>{if(video.paused){try{await video.play();dirty=true;}catch{$('status').textContent='再生できませんでした。もう一度再生を押してください。';}}else{video.pause();invalidate();}ui();};
$('restart').onclick=()=>{invalidate();video.currentTime=0;position();};
$('seek').oninput=()=>{invalidate();video.currentTime=Number($('seek').value);position();};
$('confidence').oninput=()=>{$('confidenceValue').textContent=`${$('confidence').value}%`;if(busy){invalidate();}else classify();};
$('boxes').onchange=()=>{if(!busy)draw();else dirty=true;};
video.addEventListener('loadedmetadata',()=>{$('seek').max=video.duration;position();});
video.addEventListener('loadeddata',()=>{if(!active&&!starting){$('start').disabled=false;$('message').textContent='映像をYOLOで見てみよう';$('state').textContent='再生待ち';}});
video.addEventListener('error',()=>{active=false;$('cover').hidden=false;$('message').textContent='映像を読み込めませんでした。再読み込みしてください。';$('start').disabled=false;$('start').textContent='もう一度試す';$('status').textContent='映像の読み込みエラー';});
video.addEventListener('seeking',invalidate);video.addEventListener('seeked',()=>{dirty=true;position();});
video.addEventListener('timeupdate',position);video.addEventListener('play',ui);video.addEventListener('pause',ui);
video.addEventListener('ended',()=>{invalidate();video.currentTime=0;video.play().catch(()=>{$('status').textContent='続けるには再生を押してください。';});});
document.addEventListener('visibilitychange',()=>{if(document.hidden){video.pause();invalidate();}else{dirty=true;ui();}});
setInterval(infer,100);

// Readiness is not a prerequisite for a user-initiated play request.
$('start').disabled=false;$('state').textContent='開始できます';
if(Number.isFinite(video.duration)){$('seek').max=video.duration;position();}
