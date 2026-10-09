let user="",cur=0,picks=Array(72).fill(null),best="",worst="";const $=x=>document.getElementById(x);
const SAVE_KEY="kurukuru-character-test-v3";
let currentPage="start";
function saveProgress(){try{localStorage.setItem(SAVE_KEY,JSON.stringify({version:3,user,cur,picks,best,worst,currentPage,updatedAt:Date.now()}))}catch(e){console.warn("저장할 수 없습니다",e)}}
function readProgress(){try{const v=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");if(!v||v.version!==3||!Array.isArray(v.picks)||v.picks.length!==72)return null;return v}catch(e){return null}}
function hasSavedProgress(v){return !!(v&&(v.user||v.picks.some(x=>x!==null)))}
function restoreProgress(v){user=String(v.user||"").slice(0,12);cur=Math.min(71,Math.max(0,Number(v.cur)||0));picks=v.picks.map(x=>Number.isInteger(x)&&x>=0&&x<=3?x:null);best=String(v.best||"");worst=String(v.worst||"");$("nameDisplay").textContent=user||"아직 입력하지 않았습니다.";$("bestDisplay").textContent=best||"미입력";$("worstDisplay").textContent=worst||"미입력";const allowed=["start","test","chem","complete","result"];currentPage=allowed.includes(v.currentPage)?v.currentPage:"test";if(currentPage==="result"){$("resultBtn").click()}else if(currentPage==="complete"){$("completeText").textContent=`${user}님의 72개 선택이 모두 기록되었습니다.`;page("complete")}else if(currentPage==="chem")page("chem");else if(currentPage==="start")page("start");else{page("test");render()}}
function updateResume(){const v=readProgress();const el=$("resumeArea");if(!el)return;el.hidden=!hasSavedProgress(v);if(hasSavedProgress(v)){$("resumeSummary").textContent=v.currentPage==="result"?"저장된 검사 결과가 있습니다.":v.currentPage==="complete"||v.currentPage==="chem"?"검사를 완료했습니다. 이어서 확인하세요.":`저장된 진행 기록 · ${Math.min(72,(v.picks||[]).filter(x=>x!==null).length)} / 72문항`;}}
function page(x){document.querySelectorAll(".page").forEach(e=>e.classList.remove("active"));$(x).classList.add("active");currentPage=x;saveProgress();scrollTo(0,0)}
function askText(message,current,maxLen){let v=window.prompt(message,current||"");if(v===null)return current||"";v=v.trim();if(maxLen)v=v.slice(0,maxLen);return v}
$("nameEntryBtn").onclick=()=>{user=askText("이름을 입력해주세요.",user,12);$("nameDisplay").textContent=user||"아직 입력하지 않았습니다.";saveProgress()};
$("bestEntryBtn").onclick=()=>{best=askText("나와 가장 케미가 잘 맞는 사람은?",best);$("bestDisplay").textContent=best||"미입력";saveProgress()};
$("worstEntryBtn").onclick=()=>{worst=askText("나와 가장 케미가 안 맞는 사람은?",worst);$("worstDisplay").textContent=worst||"미입력";saveProgress()};
function start(){if(!user)return $("nameEntryBtn").click();page("test");render()}$("startBtn").onclick=start;
function render(){if(document.activeElement&&typeof document.activeElement.blur==="function")document.activeElement.blur();let q=QUESTIONS[cur];$("progressText").textContent=`${cur+1} / 72`;$("progress").style.width=`${(cur+1)/72*100}%`;$("qno").textContent=`QUESTION ${String(cur+1).padStart(2,"0")}`;$("question").textContent=q.text;$("answers").innerHTML="";q.answers.forEach((a,i)=>{let b=document.createElement("button");b.className="answer";b.innerHTML=`<span class="letter">${"ABCD"[i]}</span>${a.text}`;b.type="button";b.tabIndex=-1;b.onclick=()=>{picks[cur]=i;saveProgress();b.blur();$("answers").innerHTML="";if(cur===71){requestAnimationFrame(()=>page("chem"));return;}cur++;saveProgress();requestAnimationFrame(()=>{render();scrollTo(0,0)})};$("answers").appendChild(b)});$("prev").style.visibility=cur?"visible":"hidden"}$("prev").onclick=()=>{if(document.activeElement&&typeof document.activeElement.blur==="function")document.activeElement.blur();if(cur){cur--;saveProgress();render()}};$("finishBtn").onclick=()=>{best=best||"미입력";worst=worst||"미입력";$("completeText").innerHTML=`<b style="color:white">${user}</b>님의 72개 선택이 모두 기록되었습니다.`;page("complete")};function calc(){let raw=Object.fromEntries(STAT_ORDER.map(k=>[k,0]));picks.forEach((p,i)=>raw[QUESTIONS[i].answers[p].stat]++);let s={};STAT_ORDER.forEach(k=>{let n=raw[k],m=APPEARANCES[k],t=HIGH_THRESHOLD[k];s[k]=n<t?Math.round(n/Math.max(1,t-1)*74):Math.min(100,Math.round(75+(n-t)/Math.max(1,m-t)*25))});return{raw,s}}function typeOf(raw){let high=STAT_ORDER.filter(k=>raw[k]>=HIGH_THRESHOLD[k]),key=high.join("+");return{high,t:TYPES[key]||TYPES[""]}}$("resultBtn").onclick=()=>{
  // 먼저 결과 페이지로 이동. 이후 부가 렌더링 하나가 실패해도 버튼 자체는 항상 작동한다.
  page("result");
  try{
    let{raw,s}=calc(),{high,t}=typeOf(raw);
    $("owner").textContent=`${user}님의 캐릭터 유형`;
    $("typeName").textContent=t.name;
    $("typeDesc").textContent=t.desc;
    $("highs").innerHTML=high.length?high.map(k=>`<b>${STAT_INFO[k].name}</b> HIGH`).join(" · "):"HIGH 없음";

    const typeKey=high.join("+");
    const celeb=(typeof CELEB_MATCH!=="undefined"&&(CELEB_MATCH[typeKey]||CELEB_MATCH[""]))||null;
    if($("celebNames")) $("celebNames").textContent=celeb?celeb.names:"";
    if($("celebDesc")) $("celebDesc").textContent=celeb?celeb.desc:"";

    $("stats").innerHTML=STAT_ORDER.map(k=>`<div class="stat"><div class="statHead"><b>${STAT_INFO[k].name}${raw[k]>=HIGH_THRESHOLD[k]?'<span class="badge">HIGH</span>':""}</b><span class="score">${s[k]}</span></div><div class="bar"><i style="width:${s[k]}%"></i></div><p><b>${STAT_INFO[k].short}</b> ${STAT_INFO[k].desc}</p></div>`).join("");

    if($("radar")) radar(s);
    compat(high);
    if($("bestOut")) $("bestOut").textContent=best;
    if($("worstOut")) $("worstOut").textContent=worst;

    let code=`KURU:${STAT_ORDER.map(k=>s[k]).join("-")}`;
    if($("resultCode")) $("resultCode").textContent=code;
    const txt=`[쿠루쿠루 캐릭터 테스트]\n${user}\n유형: ${t.name}\n${t.desc}\n${STAT_ORDER.map(k=>STAT_INFO[k].name+" "+s[k]).join("\n")}\n결과 코드: ${code}\n${location.origin+location.pathname}`;
    async function copyResult(){try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(txt)}else{const ta=document.createElement("textarea");ta.value=txt;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.select();const ok=document.execCommand("copy");ta.remove();if(!ok)throw new Error("copy failed")}$("copyBtn").textContent="복사 완료 ✓";$("shareStatus").textContent="결과가 복사됐어요. 카톡에 붙여넣으세요."}catch(e){$("shareStatus").textContent="자동 복사가 안 됩니다. 아래 결과 코드를 길게 눌러 복사해 주세요."}}
    $("copyBtn").onclick=copyResult;
    $("shareBtn").onclick=async()=>{if(navigator.share){try{await navigator.share({title:"쿠루쿠루 캐릭터 테스트 결과",text:txt});return}catch(e){if(e.name==="AbortError")return}}await copyResult()};
    saveProgress();
  }catch(err){
    console.error("result render error",err);
  }
};
function radar(s){let c=$("radar"),x=c.getContext("2d"),cx=320,cy=270,R=175,pt=(i,v)=>{let a=-Math.PI/2+i*Math.PI/3;return[cx+Math.cos(a)*R*v,cy+Math.sin(a)*R*v]};x.clearRect(0,0,640,540);for(let l=1;l<=5;l++){x.beginPath();for(let i=0;i<6;i++){let p=pt(i,l/5);i?x.lineTo(...p):x.moveTo(...p)}x.closePath();x.strokeStyle="#333";x.stroke()}x.beginPath();STAT_ORDER.forEach((k,i)=>{let p=pt(i,s[k]/100);i?x.lineTo(...p):x.moveTo(...p)});x.closePath();x.fillStyle="#ffffff22";x.strokeStyle="#eee";x.lineWidth=2;x.fill();x.stroke();x.textAlign="center";STAT_ORDER.forEach((k,i)=>{let p=pt(i,1.18);x.fillStyle="#ddd";x.font="bold 15px Malgun Gothic";x.fillText(STAT_INFO[k].name,...p);x.fillStyle=s[k]>=75?"#fff":"#777";x.font="bold 12px Arial";x.fillText(s[k],p[0],p[1]+19)})}function cs(m,c){let M=new Set(m),C=new Set(c),v=0;if(M.has("attack")&&C.has("defense"))v+=4;if(M.has("defense")&&C.has("attack"))v+=4;if(M.has("humor")&&C.has("express"))v+=3;if(M.has("express")&&C.has("humor"))v+=3;if(M.has("humor")&&C.has("coordinate"))v+=3;if(M.has("coordinate")&&C.has("humor"))v+=3;if(M.has("lead")&&C.has("coordinate"))v+=3;if(M.has("coordinate")&&C.has("lead"))v+=3;if(M.has("lead")&&C.has("lead"))v-=2;if(M.has("attack")&&C.has("attack")&&!M.has("defense")&&!C.has("defense"))v-=3;return v}function compat(h){
  const render=(items,target)=>{
    $(target).innerHTML=items.map(x=>`<div class="compatItem"><b>${x.name}</b><span> — ${x.desc}</span></div>`).join("");
  };
  if(!h.length){
    const good=["lead+coordinate","lead+humor","humor+coordinate"].map(k=>TYPES[k]);
    const bad=["express+attack","lead+attack","lead+express+attack"].map(k=>TYPES[k]);
    render(good,"goodTypes"); render(bad,"badTypes"); return;
  }
  let a=Object.entries(TYPES).filter(([k])=>k).map(([k,v])=>({name:v.name,desc:v.desc,p:k.split("+"),s:0}));
  a.forEach(x=>x.s=cs(h,x.p));
  render([...a].sort((x,y)=>y.s-x.s).slice(0,3),"goodTypes");
  render([...a].sort((x,y)=>x.s-y.s).slice(0,3),"badTypes");
}
$("restartBtn").onclick=()=>{if(!confirm("기존 답변과 저장된 결과를 지우고 새로 검사할까요?"))return;user="";cur=0;picks=Array(72).fill(null);best="";worst="";try{localStorage.removeItem(SAVE_KEY)}catch(e){}$("nameDisplay").textContent="아직 입력하지 않았습니다.";$("bestDisplay").textContent="미입력";$("worstDisplay").textContent="미입력";page("start");updateResume()};
$("resumeBtn").onclick=()=>{const v=readProgress();if(v)restoreProgress(v)};
$("freshBtn").onclick=()=>{if(!confirm("저장된 진행 기록을 지우고 처음부터 시작할까요?"))return;try{localStorage.removeItem(SAVE_KEY)}catch(e){}user="";cur=0;picks=Array(72).fill(null);best="";worst="";$("nameDisplay").textContent="아직 입력하지 않았습니다.";updateResume()};
window.addEventListener("pagehide",saveProgress);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")saveProgress()});
updateResume();