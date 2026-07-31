# AGENTS.md

<!-- meemong-common v1 start -->
## Meemong shared working agreements

- Keep changes scoped to the requested problem and preserve unrelated user-authored work.
- Apply technically valid, low-risk review feedback in the current change when it improves the touched area.
- After refactoring, verify that names still match the domain intent and actual reuse scope.
- Follow the repository's existing architecture and reuse established shared building blocks and utilities before adding new abstractions.
- Never commit credentials, tokens, production data, or user personal information.
- Run the relevant checks for the changed area and report any check that could not be run.
<!-- meemong-common v1 end -->

## Project overview

This is the Meemong chat operations dashboard built with Next.js 15, React 19, TypeScript, TanStack Query, Zustand, and Firebase.

## Package manager and commands

Use npm and keep `package-lock.json` authoritative.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

The repository currently has no automated test script. Add focused tests when introducing testable business logic instead of claiming a test run that does not exist.

## Code organization

- `src/app/` owns pages and the server-side webview-login route.
- `src/apis/` owns authenticated API and Firestore operations.
- `src/hooks/` owns query/subscription composition consumed by pages.
- `src/stores/` owns current-channel client state.
- `src/components/chat/` contains reusable chat presentation; route-specific components stay with their route.
- `src/types/chat/` owns Firestore chat data types.

## Authentication and security

- Preserve the login chain: the client calls `/api/auth/webview-login`, the route uses the server-only webview API key, and the returned JWT is normalized and stored through `src/apis/auth/token.ts`.
- Do not expose `WEBVIEW_API_KEY` to client bundles or log auth headers and JWT values.
- Use the shared authenticated fetch helper instead of duplicating token refresh or retry logic.

## Firestore

- Keep the database initialization centralized in `src/lib/firebase.ts`.
- Reuse the collection mapping in `src/apis/firestore/constants.ts` when adding channel types.
- Preserve Firestore `Timestamp` semantics and participant ID normalization; do not silently replace them with locale strings or unordered values.
- Clean up real-time subscriptions in hooks and effects.

## Verification

- Run `npm run lint` for all code changes.
- Run `npm run build` for authentication, route, Firebase, configuration, or production-facing changes.
- Manually verify the affected channel type and empty/loading/error states when no automated coverage exists.
