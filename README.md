# Hello World — Next.js App

A minimal Next.js app built for deployment on Vercel. It shows a single page with a "Hello World" heading and a button that toggles between light and dark mode.

## What it is

- **Single-page app** using the Next.js [App Router](https://nextjs.org/docs/app) (`app/` directory).
- **Theme toggle** implemented with React `useState` only — no theme or CSS-in-JS libraries.
- **No backend** — no APIs, auth, environment variables, or database. Static-friendly and ready for Vercel with zero configuration.

## Features

- Large "Hello World" heading
- Button that switches between light and dark mode
- Background and text colors update when the mode changes
- Button label: "Switch to Dark Mode" or "Switch to Light Mode" depending on the current mode

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```