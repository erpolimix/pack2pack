## 2026-01-30 - [Secure Supabase Image Configuration]
**Vulnerability:** Use of `*.supabase.co` wildcard in `next.config.ts`'s `remotePatterns`.
**Learning:** This wildcard allowed any Supabase project to serve images through the application, potentially being used as an open image proxy.
**Prevention:** Dynamically parse the hostname from `NEXT_PUBLIC_SUPABASE_URL` in `next.config.ts` to restrict image loading to the project's specific Supabase instance.
