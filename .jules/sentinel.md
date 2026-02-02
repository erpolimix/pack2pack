## 2025-05-22 - [Secure AI Key Management in Next.js]
**Vulnerability:** Use of `NEXT_PUBLIC_` prefix for AI service API keys (Gemini) exposed them to the client-side browser bundle and network requests.
**Learning:** Next.js Server Actions provide a clean way to move sensitive logic to the server while maintaining a simple client-side calling convention. Passing `File` objects via `FormData` is necessary for Server Action compatibility.
**Prevention:** Avoid `NEXT_PUBLIC_` for any secret. Use Server Actions or API routes for third-party service calls that require authentication.
