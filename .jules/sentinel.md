## 2025-02-11 - Gemini API Key Exposure in Client Bundle
**Vulnerability:** Gemini API key was leaked to the browser via `NEXT_PUBLIC_GEMINI_API_KEY` in `services/aiService.ts`.
**Learning:** Even with recent Next.js versions, the `NEXT_PUBLIC_` prefix remains a common source of accidental secret exposure when developers attempt to use environment variables in client components.
**Prevention:** Use Next.js Server Actions to encapsulate sensitive SDK logic and transition to private environment variables (e.g., `GEMINI_API_KEY`) to ensure secrets remain on the server.
