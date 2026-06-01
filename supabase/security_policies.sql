alter table users enable row level security;
alter table referral_redemptions enable row level security;
alter table stripe_events enable row level security;
alter table chat_messages enable row level security;
alter table non_billable_events enable row level security;
alter table user_reviews enable row level security;
alter table contact_inquiries enable row level security;

drop policy if exists users_select_own_auth_profile on users;
create policy users_select_own_auth_profile
  on users for select
  to authenticated
  using (client_user_id = ('auth:' || auth.uid()::text));

drop policy if exists users_insert_own_auth_profile on users;
create policy users_insert_own_auth_profile
  on users for insert
  to authenticated
  with check (client_user_id = ('auth:' || auth.uid()::text));

drop policy if exists users_update_own_auth_profile on users;
create policy users_update_own_auth_profile
  on users for update
  to authenticated
  using (client_user_id = ('auth:' || auth.uid()::text))
  with check (client_user_id = ('auth:' || auth.uid()::text));

drop policy if exists chat_messages_select_own on chat_messages;
create policy chat_messages_select_own
  on chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = chat_messages.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );

drop policy if exists chat_messages_insert_own on chat_messages;
create policy chat_messages_insert_own
  on chat_messages for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = chat_messages.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );

drop policy if exists user_reviews_select_own on user_reviews;
create policy user_reviews_select_own
  on user_reviews for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = user_reviews.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );

drop policy if exists user_reviews_insert_own on user_reviews;
create policy user_reviews_insert_own
  on user_reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from users
      where users.id = user_reviews.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );

drop policy if exists user_reviews_update_own on user_reviews;
create policy user_reviews_update_own
  on user_reviews for update
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = user_reviews.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  )
  with check (
    exists (
      select 1 from users
      where users.id = user_reviews.user_id
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );

drop policy if exists referral_redemptions_select_related on referral_redemptions;
create policy referral_redemptions_select_related
  on referral_redemptions for select
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id in (referral_redemptions.referrer_user_id, referral_redemptions.referred_user_id)
        and users.client_user_id = ('auth:' || auth.uid()::text)
    )
  );
