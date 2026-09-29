# ReviewQR — AI-Assisted Review Platform

A modern, professional web application that helps businesses create AI-assisted customer review experiences with QR codes.

## Overview

ReviewQR allows business owners to:
- Create a business profile with services, description, and Google review URL
- Generate ~50 AI-assisted review suggestions using the Gemini API
- Produce a unique public review page per business
- Generate a QR code linking directly to that review page
- Let customers scan, select/edit a suggestion, copy it, and post on Google

---

## Features

- **AI Review Generation** — 50 suggestions across 5 categories via Gemini API
- **Secure Backend** — API key never exposed to frontend
- **QR Code Generator** — PNG/SVG download + print
- **Public Review Page** — Mobile-optimized, no login required
- **Review Management** — Edit, delete, search, filter, add custom
- **Toast Notifications** — Real-time feedback throughout
- **Demo Business** — Pre-seeded for testing
- **Analytics-Ready** — Structured event tracking stubs

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Routing | React Router v6 |
| Icons | Lucide React |
| QR Code | qrcode |
| Backend | Node.js, Express |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Storage (MVP) | localStorage |

---

## Architecture

```
reviewqr/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Toast)
│   ├── pages/              # Route-level page components
│   ├── services/           # Business logic & API calls
│   └── types/              # Shared TypeScript types
├── server/                 # Express backend
│   ├── routes/             # API route handlers
│   └── services/           # Gemini API service
├── .env                    # Environment variables (git-ignored)
├── .env.example            # Environment template
└── vite.config.ts          # Vite config with API proxy
```

---

## Installation

```bash
# 1. Clone or navigate to the project
cd review

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Gemini API key
```

---

## Environment Variables

Create a `.env` file in the root (never commit this):

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
APP_URL=http://localhost:5173
```

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key (server-side only) |
| `PORT` | Express server port (default: 5000) |
| `APP_URL` | Frontend URL for CORS (default: http://localhost:5173) |

---

## Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create or copy an API key
3. Add it to `.env` as `GEMINI_API_KEY`
4. The backend uses `gemini-1.5-flash` model

> **Security**: The API key is only used server-side via Express. It is never included in the frontend bundle.

---

## Development

```bash
# Start both frontend and backend concurrently
npm run dev
```

This starts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

Vite proxies all `/api/*` requests to the Express server automatically.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Admin dashboard |
| `/businesses` | All businesses |
| `/qr-codes` | QR code management |
| `/business/create` | Create new business |
| `/business/:id` | Business details |
| `/business/:id/reviews` | Review management |
| `/business/:id/generate` | AI generation page |
| `/business/:id/qr` | QR code generator |
| `/review/:slug` | **Public customer review page** |

---

## Production Build

```bash
npm run build
```

The frontend is built to `dist/`. For production deployment, serve the Express backend separately and update `APP_URL` accordingly.

---

## Deployment Notes

- Point your domain's `A` record to your server
- Configure a reverse proxy (nginx/Caddy) to route `/api/*` to Express (port 5000) and everything else to the static Vite build
- Set environment variables in your hosting platform — never commit `.env`

---

## Security Notes

- Gemini API key is only read by the Express server from environment variables
- Input is validated before any Gemini request
- User-provided content is not rendered as raw HTML
- Google review redirect uses only the business's configured URL — no arbitrary redirects
- `.env` is listed in `.gitignore`

---

## Future Improvements

- PostgreSQL/MongoDB storage backend
- User authentication for business owners
- Analytics dashboard with scan/click tracking
- Multi-user support and team management
- Custom branding per QR card
- Email notifications
- Bulk QR code export

---

## Demo

A demo business ("Apex Pinhole Surgery") is seeded automatically on first load. Visit `/review/apex-pinhole-surgery` to see the customer experience.
