# Admin User Setup
# Run after the login page at https://swtmt-portal.netlify.app is confirmed working

Step 1 — Supabase dashboard → Authentication → Users → Add user → Create new user
Step 2 — Email: mward4102@gmail.com
Step 3 — Check "Auto Confirm User"
Step 4 — Click Create user
Step 5 — Click the new user in the list and copy their UID (a long UUID)

Step 6 — Supabase SQL editor → new query → paste this, replacing PASTE-UID-HERE with the UID you copied:

insert into users (id, email, role, full_name, is_veteran)
values (
  'PASTE-UID-HERE',
  'mward4102@gmail.com',
  'admin',
  'Michael Ward',
  true
);

Step 7 — Click Run. Should see "Success. 1 row affected."
Step 8 — Go to https://swtmt-portal.netlify.app/, enter your email, click Send magic link, check email, click the link. You should land on the empty dashboard logged in as admin.
