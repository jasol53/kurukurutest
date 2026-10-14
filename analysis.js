const KR_LABELS=['주도력','표현력','공격력','방어력','유머력','조율력'];
function krCompatibility(a,b){
 const complement=(a[2]*b[3]+b[2]*a[3])/200;
 const humor=(a[4]*b[1]+b[4]*a[1])/200;
 const flow=(a[0]*b[5]+b[0]*a[5])/200;
 const conflict=(a[2]*(100-b[3])+b[2]*(100-a[3]))/200;
 return {good:Math.round(complement*.5+humor*.3+flow*.2),fire:Math.round((a[2]*b[2]/100)*.45+complement*.35+humor*.2),risk:Math.round(conflict*.75+(a[0]*b[0]/100)*.25)};
}
function krAnalyze(v){
 const ranked=v.map((n,i)=>({n,i})).sort((a,b)=>b.n-a.n),mean=v.reduce((a,b)=>a+b,0)/6;
 const primary=ranked[0],secondary=ranked[1],spread=primary.n-ranked[5].n;
 const size=mean<35?'소형':mean<65?'중형':'대형';
 const shape=spread<18?'균형형':primary.n-secondary.n>=22?'특화형':'복합형';
 const names=['주도','표현','공격','방어','유머','조율'];
 const label=spread<18?'균형':primary.n-secondary.n>=22?names[primary.i]:names[primary.i]+'·'+names[secondary.i];
 return {title:`${size} ${label}${shape==='균형형'?'':` ${shape}`}`,summary:`${KR_LABELS[primary.i]}이 가장 두드러지고 ${KR_LABELS[secondary.i]}이 뒤를 잇습니다. 전체 평균 ${Math.round(mean)}점, 최고·최저 차이 ${spread}점입니다.`,position:`${KR_LABELS[primary.i]} 중심의 예능 역할`,scenario:'상대의 반응에 따라 다른 모습이 나타날 수 있으니 실제 장면에서 확인해 보세요.',strengths:ranked.slice(0,2).map(x=>KR_LABELS[x.i]+' '+x.n).join(' · '),weaknesses:ranked.slice(-2).map(x=>KR_LABELS[x.i]+' '+x.n).join(' · '),near:[]};
}
function krRender(root,values,name){root.replaceChildren();const x=krAnalyze(values);const h=document.createElement('h2');h.textContent=`${name?name+' · ':''}${x.title}`;const d=document.createElement('p');d.textContent=x.summary;root.append(h,d)}
window.krShowAnalysis=(values,name)=>{const root=document.getElementById('deepAnalysis');if(root)krRender(root,values,name)};
function krParse(code){const m=String(code).trim().match(/^KURU:\s*(\d{1,3}(?:-\d{1,3}){5})$/i);if(!m)return null;const v=m[1].split('-').map(Number);return v.every(n=>n>=0&&n<=100)?v:null}
document.addEventListener('DOMContentLoaded',()=>{const btn=document.getElementById('lookupBtn');if(btn)btn.onclick=()=>{const v=krParse(document.getElementById('lookupCode').value),target=document.getElementById('lookupAnalysis');if(!v){target.textContent='KURU: 형식의 점수 여섯 개를 입력해 주세요.';return}krRender(target,v,'이전 버전 점수');};});
