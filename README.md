# baby-name

Swipe together and find a baby name you both like!

Currently deployed at https://bby.vercel.app.

I'm using the [Svelte](https://svelte.dev/) framework (with
Typescript), and [Pico CSS](https://v2.picocss.com/docs) +
[Tailwind CSS](https://tailwindcss.com/) for styles.
Icons are from [Lucide](https://lucide.dev/) &
[Tabler](https://tabler.io/icons) and the font is
[Rubik](https://fonts.google.com/specimen/Rubik),
from Google Fonts.

## Running it locally

Clone the repo, copy the example env file and fill in your
Supabase project's URL and publishable key:

```bash
cp .env.example .env
```

Then install and run:

```bash
pnpm install
pnpm run dev
```

Other useful scripts:

```bash
pnpm run check   # svelte-check
pnpm run lint    # prettier + eslint
pnpm run build   # production build
```

## Pages

| Route       | What it does                                              |
| ----------- | --------------------------------------------------------- |
| `/`         | Landing page                                              |
| `/swiping`  | Swipe through names, undo, and see a name's meaning       |
| `/swipes`   | Your full swipe history: search, filter, re-swipe or undo |
| `/settings` | Theme, language, account, and deleting all your swipes    |
| `/partners` | Your connect link, your partners, and their match counts  |
| `/matches`  | Names you and a partner both liked, filterable            |
| `/connect`  | Lands here from a partner's connect link                  |

`/swipes` and `/settings` work for anonymous users too — only the
pages that involve another person require logging in.

## Database

The schema lives in the Supabase project. Migrations are in
`supabase/migrations/` and are meant to be run in order, either with
the Supabase CLI or by pasting them into the SQL editor:

- `0001_name_metadata.sql` — adds `gender`, `origin` and `meaning` to
  `babynames` and backfills all 200 seeded names. This is what powers
  the "+ info" button while swiping and the gender/origin filters on
  the matches page.

Migrations are additive and idempotent, so they're safe to re-run.
Until `0001` is applied the app still works: "+ info" just says there
is nothing to show, and the matches filters stay hidden.

## Languages

The app ships in English and Spanish. The selector in the footer (and
in `/settings`) writes a `preferredLanguage` cookie, which is read
server-side so the first paint is already in the right language.
Copy lives in `src/lib/i18n.svelte.ts` — add a language by adding one
more dictionary there.
