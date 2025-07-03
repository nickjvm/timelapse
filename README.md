# Timelapse Project

A Next.js project with global state management using Zustand and IndexedDB persistence.

## Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Zustand** for global state management
- ✅ **IndexedDB** for persistent storage
- ✅ **Full SSR/Hydration** support

## Global State Management

This project includes a complete global state management solution with:

- **Persistent Storage**: Data survives browser restarts using IndexedDB
- **TypeScript Support**: Fully typed store and actions
- **Performance Optimized**: Selective subscriptions with custom selectors
- **SSR Compatible**: Proper hydration handling for Next.js

### State Structure

- **Theme**: Light/dark/system theme preference
- **UI State**: Sidebar visibility and other UI preferences
- **User Data**: User information and authentication state
- **Projects**: Project management with CRUD operations
- **Settings**: Application-wide settings

See [STORE_USAGE.md](./STORE_USAGE.md) for detailed usage instructions.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The demo page shows all store functionality with interactive examples of:

- Theme switching
- User management
- Project CRUD operations
- Settings management
- Data persistence

## Project Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout with StoreProvider
│   └── page.tsx           # Demo page
├── components/
│   └── StoreDemo.tsx      # Interactive demo component
└── store/
    ├── index.ts           # Main store definition
    ├── indexeddb-storage.ts # IndexedDB storage adapter
    └── provider.tsx       # React provider for hydration
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
