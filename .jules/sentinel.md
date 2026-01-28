## 2024-08-07 - Overly Permissive Image Hostname Wildcard

**Vulnerability:** The `next.config.ts` file contained an `images.remotePatterns` entry with the hostname `*.supabase.co`. This wildcard allows the application to be used as an image proxy for any Supabase project, creating an open redirect vulnerability.

**Learning:** Wildcard hostnames in security-sensitive configurations are dangerous. The initial fix of using a placeholder was incomplete because it broke functionality. The correct approach is to dynamically and programmatically determine the correct hostname from an environment variable, ensuring the configuration is both secure and functional.

**Prevention:** Always use specific hostnames in `remotePatterns`. Dynamically constructing the hostname from an environment variable like `NEXT_PUBLIC_SUPABASE_URL` is a robust pattern to prevent both hardcoding and overly permissive wildcards. Future code reviews should flag any use of wildcards or static placeholders in `remotePatterns` as a potential security issue.
