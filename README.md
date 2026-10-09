# Ally

A mobile AI companion that remembers what you share, adapts its mood to yours, and can talk back out loud.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Ally is a React Native (Expo) app with a small Express backend. It wraps an OpenAI chat model in a consistent, warm persona and adds the parts a plain chatbot lacks: long-term memory, emotional state, voice, and gentle check-ins.

> [!IMPORTANT]
> Ally is a student project, not a medical or crisis service. It is not a substitute for professional mental health care.

## Features

- **Persona-driven chat.** A fixed system prompt keeps Ally's voice consistent. Each reply comes back as JSON with the message and an emotion tag (calm, warm, encouraging, …). An optional mode adds gentle CBT-style reframes.
- **Memory.** The app saves memories on the device, ranked by an importance score. The backend keeps up to 50 memories per user in process memory and pulls the most relevant ones into each prompt by keyword overlap.
- **Mood engine.** Ally's own mood shifts with your recent sentiment and the time of day, and that mood changes how it speaks.
- **Voice calls.** The call screen speaks replies with OpenAI text-to-speech and drives simple avatar lip-sync from the text.
- **Proactive check-ins.** Optional daily or twice-daily notifications that start a conversation.
- **Graceful fallback.** Without an API key, or if the model times out, the backend returns a supportive canned reply so the app keeps working.

Onboarding, profile, history, memory log, avatar, and settings screens are included. Login and sign-up are UI only; there is no real authentication yet.

## Architecture

```
Expo app (frontend/)                     Express API (backend/)              OpenAI
  chat, call, memory log, avatar  ──►  POST /chat  → persona + memories ──►  chat model
  mood engine, sentiment, storage ──►  POST /tts   → speech synthesis   ──►  text-to-speech
                                        GET  /health
```

| Path | Purpose |
|---|---|
| [`frontend/`](frontend/) | Expo Router app: screens in `app/`, API clients in `api/`, mood, memory, and notification logic in `utils/` and `store/` |
| [`backend/`](backend/) | TypeScript Express server: routes in `src/routes/`, OpenAI calls in `src/services/`, tests in `tests/` |
| [`docs/`](docs/) | Design tokens, store usage, system prompt notes, QA and release checklists |

## Run it locally

You need Node.js 20+ and an [OpenAI API key](https://platform.openai.com/api-keys). The backend still runs without a key, using canned replies.

**Backend** (port 4000):

```bash
cd backend
cp .env.example .env   # set OPENAI_API_KEY
npm install
npm run dev
```

**App** (in a second terminal):

```bash
cd frontend
cp .env.example .env   # point EXPO_PUBLIC_API_BASE_URL at the backend
npm install
npx expo start
```

Open it in [Expo Go](https://expo.dev/go), an iOS simulator, an Android emulator, or a browser (press `w`). On a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN address instead of `localhost`.

## Test

```bash
cd backend && npm test          # API tests (Vitest + Supertest)
cd frontend && npx tsc --noEmit # type check
```

## Team

- **Sanjit Saji** ([@Sanjit2004](https://github.com/Sanjit2004))
- **Adnan Fazulbhoy** ([@Adnanfaz](https://github.com/Adnanfaz))

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the branch and PR workflow.

## License

[MIT](LICENSE)
