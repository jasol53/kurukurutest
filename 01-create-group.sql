-- Run once AFTER the main schema. Save the returned invite_code privately.
WITH new_group AS (
  INSERT INTO public.kuru_groups(name) VALUES ('쿠루쿠루') RETURNING id
), new_code AS (
  SELECT encode(gen_random_bytes(18), 'hex') AS invite_code
), new_invite AS (
  INSERT INTO public.kuru_invites(group_id,token_hash,max_uses,expires_at)
  SELECT new_group.id, encode(sha256(convert_to(new_code.invite_code,'UTF8')),'hex'),30,now()+interval '90 days'
  FROM new_group CROSS JOIN new_code
  RETURNING group_id
)
SELECT new_invite.group_id, new_code.invite_code FROM new_invite CROSS JOIN new_code;
