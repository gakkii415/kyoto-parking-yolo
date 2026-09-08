export function iou(a,b){const w=Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x)),h=Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));return w*h/(a.w*a.h+b.w*b.h-w*h||1)}
// YOLO11 COCO, [1,84,8400], class 0 = person. Coordinates are top-left pixels.
export function decode(data,n=8400,scale=1,padX=0,padY=0,threshold=.35){
 const candidates=[];
 for(let i=0;i<n;i++){const score=data[4*n+i];if(!Number.isFinite(score)||score<threshold)continue;
 const w=data[2*n+i]/scale,h=data[3*n+i]/scale;if(w<=0||h<=0)continue;
 candidates.push({x:(data[i]-padX)/scale-w/2,y:(data[n+i]-padY)/scale-h/2,w,h,score});}
 candidates.sort((a,b)=>b.score-a.score);const kept=[];
 for(const box of candidates.slice(0,1000)){if(kept.every(b=>iou(box,b)<.45))kept.push(box);if(kept.length>=100)break;}return kept;
}
export function letterbox(w,h,size=640){const scale=Math.min(size/w,size/h);return{scale,width:Math.round(w*scale),height:Math.round(h*scale),padX:Math.floor((size-Math.round(w*scale))/2),padY:Math.floor((size-Math.round(h*scale))/2)}}
export const labels='人,自転車,車,バイク,飛行機,バス,電車,トラック,船,信号機,消火栓,一時停止標識,駐車メーター,ベンチ,鳥,猫,犬,馬,羊,牛,象,熊,シマウマ,キリン,リュック,傘,バッグ,ネクタイ,スーツケース,フリスビー,スキー,スノーボード,ボール,凧,バット,グローブ,スケートボード,サーフボード,ラケット,ボトル,ワイングラス,カップ,フォーク,ナイフ,スプーン,ボウル,バナナ,りんご,サンドイッチ,オレンジ,ブロッコリー,にんじん,ホットドッグ,ピザ,ドーナツ,ケーキ,椅子,ソファ,鉢植え,ベッド,食卓,トイレ,テレビ,ノートPC,マウス,リモコン,キーボード,携帯電話,電子レンジ,オーブン,トースター,流し台,冷蔵庫,本,時計,花瓶,はさみ,ぬいぐるみ,ドライヤー,歯ブラシ'.split(',');
export const bones=[[0,1],[0,2],[1,3],[2,4],[5,6],[5,7],[7,9],[6,8],[8,10],[5,11],[6,12],[11,12],[11,13],[13,15],[12,14],[14,16]];
export function objects(data,n,g,threshold=.35,mode='detect',filter='all'){
 const classes=mode==='pose'?1:80,list=[];
 for(let i=0;i<n;i++){let cls=0,score=data[4*n+i];for(let c=1;c<classes;c++){if(data[(4+c)*n+i]>score){score=data[(4+c)*n+i];cls=c;}}
 if(!Number.isFinite(score)||score<threshold||(filter==='person'&&cls!==0)||(filter==='other'&&cls===0))continue;
 const w=data[2*n+i]/g.scale,h=data[3*n+i]/g.scale;if(w<=0||h<=0)continue;
 const b={x:(data[i]-g.padX)/g.scale-w/2,y:(data[n+i]-g.padY)/g.scale-h/2,w,h,cls,score,index:i};
 if(mode==='pose')b.points=Array.from({length:17},(_,k)=>[(data[(5+3*k)*n+i]-g.padX)/g.scale,(data[(6+3*k)*n+i]-g.padY)/g.scale,data[(7+3*k)*n+i]]);
 list.push(b);}
 list.sort((a,b)=>b.score-a.score);const kept=[];for(const b of list.slice(0,1500)){if(kept.every(a=>a.cls!==b.cls||iou(a,b)<.45))kept.push(b);if(kept.length>=60)break;}return kept;
}
// Reconstruct the model's actual 32-channel instance mask, cropped to its box.
export function mask(b,data,n,proto,g,size=160){
 const result=new Uint8Array(size*size),coeff=Array.from({length:32},(_,k)=>data[(84+k)*n+b.index]);
 const x0=Math.max(0,Math.floor((b.x*g.scale+g.padX)/4)),y0=Math.max(0,Math.floor((b.y*g.scale+g.padY)/4));
 const x1=Math.min(size,Math.ceil(((b.x+b.w)*g.scale+g.padX)/4)),y1=Math.min(size,Math.ceil(((b.y+b.h)*g.scale+g.padY)/4));
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const p=y*size+x;let sum=0;for(let k=0;k<32;k++)sum+=coeff[k]*proto[k*size*size+p];if(sum>0)result[p]=1;}return result;
}
export function inArea(b,w,h){return b.x+b.w/2>=w*.25&&b.x+b.w/2<=w*.75&&b.y+b.h/2>=h*.2&&b.y+b.h/2<=h*.8;}
// Keep unmatched tracks for three VIDEO seconds. Never count them as detections.
export function track(boxes,previous,nextId,time=(Math.max(-.1,...previous.map(p=>p.lastSeen??0))+.1)){
 const alive=previous.filter(p=>time>=(p.lastSeen??time)&&time-(p.lastSeen??time)<=3),pairs=[];
 for(let i=0;i<boxes.length;i++)for(let j=0;j<alive.length;j++){
 const b=boxes[i],p=alive[j];if(p.cls!==b.cls)continue;
 const dt=Math.min(1,Math.max(0,time-p.lastSeen)),pred={...p,x:p.x+(p.vx||0)*dt,y:p.y+(p.vy||0)*dt};
 const overlap=Math.max(iou(b,p),iou(b,pred)),distance=Math.hypot(b.x+b.w/2-pred.x-pred.w/2,b.y+b.h/2-pred.y-pred.h/2)/Math.max(20,Math.hypot(p.w,p.h));
 const ratio=b.w*b.h/(p.w*p.h);if(ratio<.3||ratio>3)continue;
 if(overlap>.1||distance<.65)pairs.push({i,j,score:overlap+Math.max(0,1-distance)*.4});
 }
 pairs.sort((a,b)=>b.score-a.score);const matches=new Map(),used=new Set();
 for(const pair of pairs)if(!matches.has(pair.i)&&!used.has(pair.j)){matches.set(pair.i,pair.j);used.add(pair.j);}
 const tracks=boxes.map((b,i)=>{const p=matches.has(i)?alive[matches.get(i)]:null,dt=p?time-p.lastSeen:0;
 const point=[b.x+b.w/2,b.y+b.h/2],trail=p?[...p.trail]:[];
 if(!p||dt>0)trail.push(point);
 return {...b,id:p?p.id:nextId++,trail:trail.slice(-240),lastSeen:time,visible:true,vx:p&&dt>0?(b.x-p.x)/dt:(p?.vx||0),vy:p&&dt>0?(b.y-p.y)/dt:(p?.vy||0)};
 });
 for(let j=0;j<alive.length;j++)if(!used.has(j))tracks.push({...alive[j],visible:false});
 return {tracks,nextId};
}
