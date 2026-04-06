# Luna — application

This folder is the **Next.js** app for **[LUNA](https://github.com/priyamjyotsna/LUNA)**. Project overview, features, and GitHub metadata are in the [**repository root README**](../README.md).

## Local development

```bash
cp .env.example .env.local
npm install
npx prisma db push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema to `LUNA_DATABASE_URL` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed script (if configured) |
