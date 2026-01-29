## 2024-08-16 - Open Redirect Vulnerability in Next.js Image Configuration

**Vulnerability:** The `next.config.ts` file contained an overly permissive wildcard `*.supabase.co` in the `images.remotePatterns` configuration. This allowed the application to be used as an open image proxy for any Supabase project, creating a security risk.

**Learning:** Using wildcards in security-sensitive configurations like `remotePatterns` can introduce vulnerabilities. The principle of least privilege should be applied, and configurations should be as specific as possible.

**Prevention:** Always use specific hostnames in the `remotePatterns` configuration. When the hostname is dynamic, derive it from a trusted environment variable and ensure proper validation is in place.
