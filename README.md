# 🚗 CMS Catalog Cars

A modern car catalog CMS built with **Next.js** and **Payload CMS**, featuring cloud image storage and ultra-fast tooling.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **CMS**: [Payload CMS 3](https://payloadcms.com/)
- **Database**: SQLite (dev) → PostgreSQL (production)
- **Image Storage**: [Cloudinary](https://cloudinary.com/)
- **Package Manager**: [Bun](https://bun.sh/) ⚡
- **Linter**: [oxlint](https://oxc.rs/) (10-100x faster than ESLint)
- **Formatter**: [oxfmt](https://oxc.rs/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

---

## 📦 Installation

### Prerequisites

- **Bun** >= 1.0 ([Install](https://bun.sh/docs/installation))
- **Node.js** >= 18 (for compatibility)
- **Cloudinary Account** ([Sign up free](https://cloudinary.com/users/register_free))

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cms-catalog-cars
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Cloudinary credentials:
   ```env
   # Payload CMS Secret Key
   PAYLOAD_SECRET=your-secret-key-here

   # Database URL (SQLite)
   DATABASE_URL=file:./payload.db

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Start development server**
   ```bash
   bun dev
   ```

   The app will be available at:
   - **Frontend**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin

---

## 🌱 Initial Data Setup

### Auto-seeding Brands

The first time you access the admin panel, **20 car brands will be automatically created**:

Audi, BMW, Chevrolet, Cupra, Fiat, Ford, Honda, Hyundai, Kia, Mazda, Mercedes-Benz, Nissan, Peugeot, Renault, Seat, Škoda, Tesla, Toyota, Volkswagen, Volvo

**No manual action needed!** 🎉

The brands are seeded automatically through a hook in the `Brands` collection when you first visit the admin panel.

---

## 🗄️ Database Management

### Development Database

We use **SQLite** for development (zero config, fast, and simple).

### 🔄 Reset Database After Schema Changes

**IMPORTANT**: When you modify collections (add/remove fields), you **MUST reset the database**:

```bash
# Delete the database file
rm -f payload.db

# Restart the server
bun dev
```

Payload will:
- ✅ Recreate the database with the new schema
- ✅ Auto-seed the brands collection (20 brands)
- ✅ Prompt you to create an admin user

### Common Schema Changes That Require Reset

- Adding new fields to collections (e.g., `transmission`, `cylinders`)
- Removing fields from collections
- Changing field types (e.g., `text` → `select`)
- Modifying relationships
- Adding new collections

**Pro tip:** If you have important data, export it before resetting:
```bash
# Export data (from admin panel)
Admin → Settings → Export Collection Data

# Reset database
rm -f payload.db

# Restart and re-import
bun dev
```

### Migration to Production

For production, switch to **PostgreSQL**:

1. Install PostgreSQL adapter:
   ```bash
   bun remove @payloadcms/db-sqlite
   bun add @payloadcms/db-postgres
   ```

2. Update `payload.config.ts`:
   ```typescript
   import { postgresAdapter } from '@payloadcms/db-postgres'

   db: postgresAdapter({
     pool: {
       connectionString: process.env.DATABASE_URL
     }
   })
   ```

3. Update `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

---

## 🛠️ Available Scripts

```bash
# Development
bun dev              # Start dev server (with Turbopack)
bun build            # Build for production
bun start            # Start production server

# Code Quality
bun lint             # Run ESLint + oxlint
bun lint:eslint      # Run only ESLint
bun lint:ox          # Run only oxlint (ultra-fast)
bun lint:fix         # Auto-fix ESLint issues

# Formatting
bun format           # Format all files with oxfmt
bun format:check     # Check if files need formatting
```

---

## 📁 Project Structure

```
cms-catalog-cars/
├── app/
│   ├── (frontend)/          # Public-facing pages
│   │   └── layout.tsx
│   ├── (payload)/           # Payload CMS admin
│   │   ├── admin/
│   │   └── layout.tsx
│   ├── api/                 # API routes
│   └── src/
│       ├── collections/     # Payload collections
│       │   ├── Brands.ts    # Car brands (auto-seeded)
│       │   ├── Cars.ts      # Car listings
│       │   ├── Media.ts     # Images/videos (Cloudinary)
│       │   └── Users.ts     # Admin users
│       ├── seed/
│       │   └── brands.ts    # Brand seed data (20 brands)
│       └── payload.config.ts
├── .vscode/
│   ├── settings.json        # Format on save config
│   └── extensions.json      # Recommended extensions
├── payload.db               # SQLite database (gitignored)
├── bun.lock                 # Bun lockfile
└── .env                     # Environment variables
```

---

## 🎨 Collections

### 🚗 Cars
Main collection for car listings.

**Fields:**
- `brand` (relationship → Brands)
- `model` (text)
- `year` (number)
- `transmission` (select: Automatic | Manual)
- `price` (number)
- `cylinders` (number)
- `passengers` (number)
- `mileage` (number)
- `images` (upload, multiple → Media)
- `featuredImage` (upload, single → Media)
- `description` (textarea)
- `featured` (checkbox)
- `sold` (checkbox)

### 🏷️ Brands
Car manufacturers (auto-seeded on first run).

**Fields:**
- `name` (text, unique)
- `slug` (text, unique)

**Seeded Brands (20):**
Audi, BMW, Chevrolet, Cupra, Fiat, Ford, Honda, Hyundai, Kia, Mazda, Mercedes-Benz, Nissan, Peugeot, Renault, Seat, Škoda, Tesla, Toyota, Volkswagen, Volvo

### 🖼️ Media
Image and video storage via Cloudinary.

**Auto-generated sizes:**
- `thumbnail` (400x300)
- `card` (768x576)
- `featured` (1024x768)

---

## 💡 Tips & Tricks

### Format on Save (VS Code)

1. Install recommended extension: **Run on Save**
2. Files will auto-format when you save (powered by oxfmt)

### Adding New Car Brands

Even though 20 brands are pre-seeded, you can add more:

Go to **Admin → Brands → Create New**

### Uploading Car Images

1. Go to **Admin → Media → Upload**
2. Or upload directly when creating/editing a car

Images are automatically uploaded to Cloudinary and optimized.

### Cloudinary Benefits

- ✅ Automatic image optimization
- ✅ Responsive image sizes
- ✅ CDN delivery
- ✅ 25GB free tier
- ✅ WebP/AVIF conversion
- ✅ Lazy loading support

---

## 🚀 Performance

**Bun vs npm:**
- Installation: **8.53s** vs ~60s (7x faster)
- Script execution: **10-20x faster**

**oxlint vs ESLint:**
- Linting: **10ms** vs ~2s (200x faster)

**oxfmt:**
- Formatting: **1.1s** for 96 files (10 threads)

---

## 🐛 Troubleshooting

### Error: "no such column: transmission" (or other field)

This means you added a new field but the database schema is outdated.

**Solution:**
```bash
rm -f payload.db
bun dev
```

### Brands not appearing

Brands are seeded automatically when you first access the admin panel. If they don't appear:

1. Check the server console for errors
2. Try accessing `/admin/collections/brands`
3. Refresh the page

### Cloudinary upload fails

1. Verify your `.env` credentials
2. Check Cloudinary dashboard for quota limits
3. Ensure `CLOUDINARY_CLOUD_NAME` doesn't have the full URL (just the name)

---

## 🔐 Security

- ❌ Never commit `.env` files
- ❌ Never commit `payload.db` (contains sensitive data)
- ✅ Use strong `PAYLOAD_SECRET` in production
- ✅ Rotate Cloudinary API keys regularly
- ✅ Enable 2FA on Cloudinary account

---

## 📝 License

MIT

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run `bun lint` and `bun format`
5. Submit a PR

---

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js + Payload CMS**
