/* KURUKURU V5 — public browser key, never a service-role key. */
const KURU_URL='https://xcgawzmxepgcvremobnt.supabase.co';
const KURU_KEY='sb_publishable_V15kk2WL2o4iDakSXA-cjQ_uMzxzKeR';
const kuruDb=window.supabase?.createClient(KURU_URL,KURU_KEY);
const $k=id=>document.getElementById(id);
function kuruStatus(message){if($k('syncStatus'))$k('syncStatus').textContent=message;if($k('groupStatus'))$k('groupStatus').textContent=message}
async function kuruSession(){if(!kuruDb)throw new Error('Supabase 라이브러리를 불러오지 못했습니다.');const {data:{session},error:e}=await kuruDb.auth.getSession();if(e)throw e;if(session)return session.user;const {data,error}=await kuruDb.auth.signInAnonymously();if(error)throw error;return data.user}
async function kuruMember(name){
 const auth=await kuruSession();
 const {data:groupId,error}=await kuruDb.rpc('kuru_join_default_group',{p_display_name:name});
 if(error)throw error;
 return {userId:auth.id,groupId};
}
async function kuruSaveAndCompare(name,scores){
 const target=$k('groupChemistry');if(!target)return;
 target.replaceChildren();kuruStatus('그룹 결과를 저장하고 있어요...');
 try{
  if(!$k('privacyConsent')?.checked)throw new Error('그룹 공개 동의가 필요합니다.');
  const {userId,groupId}=await kuruMember(name);
  const keys=['lead_score','express_score','attack_score','defense_score','humor_score','coordinate_score'];
  const record={user_id:userId,group_id:groupId,test_version:'v5',consented_at:new Date().toISOString()};keys.forEach((key,i)=>record[key]=scores[i]);
  const {error:saveError}=await kuruDb.from('kuru_results').upsert(record,{onConflict:'user_id'});if(saveError)throw saveError;
  const {data:results,error:re}=await kuruDb.from('kuru_results').select('user_id,lead_score,express_score,attack_score,defense_score,humor_score,coordinate_score').eq('group_id',groupId).eq('test_version','v5');if(re)throw re;
  const {data:members,error:me}=await kuruDb.from('kuru_members').select('user_id,display_name').eq('group_id',groupId);if(me)throw me;
  const names=new Map(members.map(m=>[m.user_id,m.display_name]));
  const others=results.filter(r=>r.user_id!==userId).map(r=>{const v=keys.map(k=>r[k]);return{name:names.get(r.user_id)||'그룹 친구',...krCompatibility(scores,v)}});
  if(!others.length){target.textContent='첫 결과가 저장됐어요. 친구가 참여하면 여기서 실명 케미를 볼 수 있어요.';kuruStatus('그룹에 결과가 저장됐어요.');return}
  const categories=[['찰떡궁합','good','서로의 역할을 보완하는 조합'],['불꽃 케미','fire','장난과 반응이 활발할 조합'],['충돌 가능성','risk','의견이나 장난이 부딪힐 수 있는 조합']];
  categories.forEach(([label,key,desc])=>{const top=[...others].sort((a,b)=>b[key]-a[key])[0];const row=document.createElement('div');row.className='compatItem';const strong=document.createElement('b');strong.textContent=`${label} · ${top.name}`;const span=document.createElement('span');span.textContent=` — ${desc}`;row.append(strong,span);target.append(row)});
  kuruStatus(`저장 완료 · 같은 그룹의 V5 참여자 ${results.length}명`);
 }catch(e){console.error('KURU sync error',e);kuruStatus('기기에는 결과가 저장됐지만 서버 저장에 실패했어요: '+(e.message||String(e)));target.textContent='그룹 결과를 불러오지 못했습니다. Supabase 설정을 확인해 주세요.'}
}
