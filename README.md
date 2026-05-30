# Binjan — Portfolio

Personal portfolio built with **Next.js 14**, **Tailwind CSS**, and **Supabase**.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Google Fonts (Syne, DM Sans)
- **Icons**: @iconify/react
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Deployment**: Vercel + GitHub Actions CI

## Setup

```bash
# Clone
git clone https://github.com/your-username/my-portfolio.git
cd my-portfolio

# Install
npm install

# Copy env
cp .env.example .env.local
# Isi credentials di .env.local dari Supabase dashboard

# Run dev
npm run dev
```

## Admin

| Route | Description |
|---|---|
| `/admin/login` | Login with Supabase Auth |
| `/admin` | Dashboard overview |
| `/admin/projects` | CRUD portfolio projects |
| `/admin/project-categories` | Manage project categories |
| `/admin/skills` | CRUD skills |
| `/admin/skill-categories` | Manage skill categories |
| `/admin/experiences` | CRUD work experience |
| `/admin/educations` | CRUD education |
| `/admin/social-links` | CRUD social links |
| `/admin/messages` | View contact messages |
| `/admin/settings` | Edit about/profile |

## Scripts

```bash
npm run dev     # Development
npm run build   # Production build
npm run start   # Start production server
npm run lint    # ESLint
```

## CI/CD

Push to `main` branch:
1. GitHub Actions runs lint + build
2. Vercel auto-deploys on success

## Database

11 tables + storage bucket, managed via Supabase dashboard or SQL migrations.
