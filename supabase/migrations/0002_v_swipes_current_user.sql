-- 0002_v_swipes_current_user.sql
--
-- `v_swipes` returned every swipe the caller is allowed to READ, not the ones
-- they made. RLS on `swipes` deliberately lets you see a partner's rows (that
-- is what `v_matches` is built on), so once you connect with someone their
-- swipes started showing up as yours:
--
--   * "Previous swipes" on /swiping listed names you never swiped
--   * /swipes and the settings counter were inflated
--   * names you BOTH swiped appeared twice, so `id` was no longer unique in
--     the result set, which breaks any keyed list built from it
--
-- Adding the owner filter is the fix. The original definition was:
--
--   SELECT swipes.babyname_id AS id, babynames.name, swipes.liked
--   FROM swipes
--   JOIN babynames ON swipes.babyname_id = babynames.id
--   ORDER BY swipes.created_at DESC;
--
-- Only the `where` clause is new. Nothing else reads this view - no other
-- view and no function references it - so this cannot affect matches, which
-- builds on the `swipes` table directly.

create or replace view public.v_swipes as
select swipes.babyname_id as id,
       babynames.name,
       swipes.liked
from swipes
join babynames on swipes.babyname_id = babynames.id
where swipes.user_id = auth.uid()
order by swipes.created_at desc;
