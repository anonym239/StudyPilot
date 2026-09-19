# StudyPilot

StudyPilot ist eine moderne Lernplattform für Studierende. Die App verwandelt
Unterlagen in tägliche Lernaufgaben, Zusammenfassungen, Karteikarten, Quizze und
Prüfungsvorbereitung.

## Lokal starten

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/studypilot run dev
```

Im Replit-Projekt werden die beiden Dienste über die vorhandenen Workflows
gestartet.

## Build

```bash
pnpm --filter @workspace/studypilot run build
```

Der statische Build liegt anschließend in
`artifacts/studypilot/dist/public`.

## Netlify

1. Repository mit Netlify verbinden.
2. Netlify erkennt die `netlify.toml` im Projektstamm.
3. Build Command: `pnpm --filter @workspace/studypilot run build`.
4. Publish Directory: `artifacts/studypilot/dist/public`.
5. Functions Directory: `netlify/functions`.
6. Die Werte aus `.env.example` unter **Site configuration → Environment
   variables** hinterlegen.
7. Deploy starten. Der SPA-Fallback und `/api/*`-Redirect sind bereits
   konfiguriert.

## Supabase vorbereiten

1. Ein Supabase-Projekt erstellen.
2. Die Migration `supabase/migrations/202609190002_studypilot_learning.sql` im
   Supabase SQL Editor ausführen. Sie legt Tabellen, `auth.uid()`-RLS, Trigger
   und den privaten `course-documents`-Bucket an.
5. In Supabase Auth E-Mail/Passwort aktivieren und die Netlify-Domain als
   erlaubte Redirect-URL hinterlegen.
6. `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` dürfen im Browser genutzt
   werden. `SUPABASE_SERVICE_ROLE_KEY` bleibt ausschließlich serverseitig.

Die API akzeptiert nur authentifizierte Supabase-Bearer-Tokens und verwendet
keine Demo-Daten. PDF-Uploads sind auf 10 MB begrenzt; Text wird serverseitig
extrahiert und als Zusammenfassung, Karteikarten, Quiz und Lernplan persistiert.

## Stripe vorbereiten

1. In Stripe die Produkte **Student** und **Pro** sowie wiederkehrende Preise
   anlegen.
2. Preis-IDs als `STRIPE_PRICE_STUDENT` und `STRIPE_PRICE_PRO` speichern.
3. Secret Key als `STRIPE_SECRET_KEY` setzen.
4. Nach dem ersten Netlify-Deploy einen Webhook auf
   `https://DEINE-DOMAIN/.netlify/functions/stripe-webhook` einrichten.
5. Mindestens `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated` und `customer.subscription.deleted`
   abonnieren.
6. Signing Secret als `STRIPE_WEBHOOK_SECRET` setzen.

Checkout, Tarifwechsel, Kündigung, Portal und Webhooks laufen ausschließlich
serverseitig. Der Webhook verwirft ungültige Signaturen und Ereignisse, die älter
als fünf Minuten sind. Secret Keys gehören nie in `VITE_*`-Variablen.

## KI konfigurieren

`AI_API_KEY`, optional `AI_API_BASE_URL` und `AI_MODEL` ausschließlich als
serverseitige Netlify-Variablen setzen. Für Replit AI Integrations werden
alternativ die Variablen `AI_INTEGRATIONS_OPENAI_*` verwendet. KI-Aufrufe laufen
über den API-Handler, der Nutzer und Dokumentbesitz prüft.

## PDF-Upload

Produktiv werden PDFs zuerst in den privaten Supabase-Storage hochgeladen.
Metadaten und extrahierter Text gehören in die Datenbank, nicht in öffentliche
Client-Variablen. Dateityp, Größe und Besitz müssen serverseitig validiert
werden.