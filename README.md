This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Chat v2 contract

This dashboard supports Firestore chat schema v2 only. It does not parse or
display schema v1 channels.

- Service-wide recent lists read v2 documents from the four authoritative chat
  channel collections and use immutable `participantIds` for administrator
  visibility and read-status checks. Invalid v2 documents are isolated and
  shown as warning rows instead of failing the entire list.
- User-specific lists read `users/{userId}/chatListItems`, preserve the app's
  `isPinned`, `sortAt`, and document-ID ordering, and exclude projected schema
  v1 items.
- System messages write the message, v2 main-channel activity timestamps, and
  every active participant's service metadata in one Firestore batch. The Node
  unread badge and push notification run afterward; pushes carry the exact
  `chatChannelId`, `sourceCollection`, and `schemaVersion: 2`.
- Daily counts are recalculated from validated v2 channels and stored with
  `schemaVersion: 2` on KST day boundaries. Invalid document counts are stored
  and shown, while earlier aggregate documents are not shown.

## Getting Started

The app gets a fresh JWT by calling the webview login API before the first
authenticated API request.

Local environment values:

```bash
MEEMONG_API_URL=https://api.meemong.com
```

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:4000](http://localhost:4000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
