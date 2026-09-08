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
