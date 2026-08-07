# Repository Security Containment Record

## Existing State

Repository assessment-এ দুইটি P0 exposure পাওয়া গেছে:

1. একটি live-looking AI provider credential `.env.example` এবং `lib/ai-provider.ts`-এ committed ছিল।
2. 45টি CV PDF, মোট প্রায় 7.2 MB, `public/uploads/cvs`-এ tracked ছিল। Next.js production build-এ এই directory public URL দিয়ে serve হতে পারে, তাই CV-এর personal data unauthorizedভাবে প্রকাশিত হওয়ার ঝুঁকি আছে।

## Required Change

- Exposed AI credential অবিলম্বে provider console থেকে revoke এবং rotate করতে হবে।
- Replacement credential কেবল deployment secret manager বা untracked `.env.local`-এ রাখতে হবে।
- Tracked CV files current branch থেকে remove করতে হবে এবং future uploads block করতে ignore ও CI guard যোগ করতে হবে।
- Production deployment, CDN cache, build artifact এবং public URL-এ পুরোনো documents এখনও available কি না যাচাই করতে হবে।
- Git history-তে secret ও files রয়ে গেছে; coordinated history rewrite এবং force-push আলাদা approval ছাড়া করা হবে না।

## Files Involved

- `.env.example`
- `lib/ai-provider.ts`
- `.gitignore`
- `public/uploads/cvs/*`
- `scripts/security-check.mjs`
- `.github/workflows/ci.yml`

## Implementation

- Source code থেকে hardcoded AI credential fallback সরানো হয়েছে।
- Environment examples placeholder-only করা হয়েছে।
- Current branch থেকে tracked CV documents সরানো হয়েছে।
- `public/uploads` এবং root `uploads` ignore করা হয়েছে।
- CI-তে tracked upload ও common embedded-secret pattern check যোগ করা হয়েছে।

## Database Impact

এই containment change database data পরিবর্তন করে না। Legacy records যদি removed public URLs reference করে, private Storage migration-এর সময় তাদের object references backfill করতে হবে।

## API Impact

Current API এখনও legacy local/Data URI storage path ব্যবহার করে; private Storage migration না হওয়া পর্যন্ত production upload endpoint নিরাপদ বলে গণ্য করা যাবে না।

## Frontend Impact

Historical profile preview link removed local file reference করলে temporaryভাবে unavailable হতে পারে। Private Storage migration signed URLs দিয়ে এটি replace করবে।

## Test

- `npm run security:check`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- GitHub secret scan এবং deployment cache review

## Operator Actions Required

1. AI provider credential revoke এবং rotate করুন।
2. New secret deployment environment-এ configure করুন; chat বা Git-এ paste করবেন না।
3. Existing deployments redeploy করুন এবং CDN cache purge করুন।
4. Supabase RLS, Storage policies এবং API access logs review করুন।
5. Git history purge প্রয়োজন হলে repository collaborators-এর সঙ্গে maintenance window ঠিক করুন।

## Status

PARTIAL — source containment implemented; external credential rotation, deployment purge এবং optional Git history rewrite repository owner-এর action প্রয়োজন।
