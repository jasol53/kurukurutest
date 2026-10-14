-- 기존 V5 테이블과 RLS는 유지합니다. SQL Editor에서 이 파일만 실행하세요.
-- 주의: 누구나 웹사이트에 접속해 익명 인증을 받으면 단일 그룹에 가입할 수 있습니다.
-- 실명/점수는 그룹 참가자들에게 공개되므로, 이 방식은 초대 전용 접근 제한이 아닙니다.

create or replace function public.kuru_join_default_group(p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_group uuid;
  v_existing uuid;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  if p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 30 then
    raise exception 'Invalid display name';
  end if;
  select group_id into v_existing from public.kuru_members where user_id = v_user;
  if v_existing is not null then
    update public.kuru_members set display_name=btrim(p_display_name) where user_id=v_user;
    return v_existing;
  end if;
  select id into v_group from public.kuru_groups where name='쿠루쿠루' order by created_at limit 1;
  if v_group is null then
    insert into public.kuru_groups(name) values ('쿠루쿠루') returning id into v_group;
  end if;
  insert into public.kuru_members(user_id,group_id,display_name)
  values(v_user,v_group,btrim(p_display_name));
  return v_group;
end;
$$;
revoke all on function public.kuru_join_default_group(text) from public;
grant execute on function public.kuru_join_default_group(text) to authenticated;
