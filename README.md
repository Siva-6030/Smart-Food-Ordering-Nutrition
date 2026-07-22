
# NutriPlate — AI-Powered Smart Food Ordering & Nutrition Assistant

A full-stack food ordering platform with an AI nutrition assistant grounded in your own menu data (RAG), health-goal-based recommendations, and a premium glassmorphism UI.

## What's implemented (MVP)

- Firebase Authentication (email/password + Google)
- Menu browsing with diet/category/search filters, nutrition facts per dish
- AI chatbot (`/api/ai/chat`) — retrieval-augmented, answers only from your real menu data, not hallucinated facts
- "Healthier swap" AI suggestion per dish, backed by real menu alternatives
- Cart → order placement → live order status tracking
- Weekly nutrition report endpoint
- Admin dashboard: add dishes, view revenue/order/user analytics
- In-memory response caching for repeat AI queries (cost control)
- Loyalty points on order placement
- Responsive glassmorphism UI with Framer Motion animations
- Voice search (Web Speech API — mic button next to the search bar)
- Barcode scanner for packaged foods (camera scan → Open Food Facts lookup, no API key needed)
- Dark/light mode toggle, persisted and defaults to system preference
- Optional Redis-backed AI response cache for production (`services/redisCacheService.js`)

## Project structure

```
food-ai-app/
  backend/     Node.js + Express + MongoDB + OpenAI
  frontend/    React + Vite + Tailwind + Framer Motion
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, OPENAI_API_KEY, and Firebase Admin SDK credentials
npm run seed   # seeds sample dishes AND generates their OpenAI embeddings
npm run dev    # starts on http://localhost:5000
```

**Firebase Admin setup**: Firebase Console → Project Settings → Service Accounts → "Generate new private key". Copy `project_id`, `client_email`, and `private_key` into `.env`.

**Make yourself an admin**: after your first login, manually set `isAdmin: true` on your user document in MongoDB Compass to access `/admin`.

### 2. Frontend

```bash
cd frontend
npm install
```

Edit `src/firebase/firebaseConfig.js` with your Firebase **web app** config (Project Settings → General → Your apps → Web app → Config).

```bash
npm run dev    # starts on http://localhost:5173
```

Optionally create `frontend/.env` with `VITE_API_URL=http://localhost:5000/api` if your backend runs elsewhere.

## How the AI/RAG pipeline works

1. Each menu item's name, ingredients, nutrition, and allergens are embedded via `text-embedding-3-small` and stored on the document (`seed/seedData.js` or `POST /api/admin/menu/reembed`).
2. A user question hits `POST /api/ai/chat` → the query is embedded → cosine similarity finds the top 5 most relevant dishes from MongoDB → those are injected into the GPT-4o-mini system prompt as grounding context.
3. The model is instructed to answer **only** from that context, so it can't invent nutrition facts or dishes that don't exist on your menu.
4. Repeat questions are cached in-memory for 30 minutes to cut API cost — swap `responseCache` in `ragService.js` for Redis in production.

## Notes on the newer features

- **Voice search** needs no setup — it uses the browser's built-in `SpeechRecognition` API. The mic button auto-hides on browsers that don't support it (e.g. Firefox).
- **Barcode scanner** needs camera permission in the browser and works over `https://` or `localhost` only (browser security requirement for camera access). It calls the free [Open Food Facts](https://openfoodfacts.github.io/api-documentation/) API — no key needed, but their data quality is community-sourced, so double-check results for accuracy before demoing.
- **Dark mode** is class-based (`darkMode: "class"` in `tailwind.config.js`) and toggled via `ThemeContext`.
- **Redis cache**: only needed once you deploy multiple backend instances or want the AI cache to survive restarts. To switch it on: `npm install redis` in `backend/`, set `REDIS_URL` in `.env`, then swap the `responseCache.get/set` calls in `ragService.js` for `cacheGet`/`cacheSet` from `redisCacheService.js`.

## Next steps / good places to extend

- QR code table ordering: generate a QR per table linking to `/?table=12`, read the param on load to tag orders
- Socket.io for real push updates on order status instead of polling
- Cloudinary integration for admin image uploads instead of URL paste
- Multi-language: `react-i18next` + translated strings, detect via `navigator.language`
=======
# Smart-Food-Ordering-Nutrition

