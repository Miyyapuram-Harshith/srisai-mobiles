# Sri Sai Mobiles — Cloudflare Architecture

Production-grade e-commerce application powered by Cloudflare's edge platform.

## Architecture

- **Frontend**: React 19 + TypeScript + Vite, served via **Cloudflare Pages**.
- **Backend API**: Serverless edge endpoints in `functions/api/*` running on **Cloudflare Pages Functions**.
- **Database**: Relational SQLite database on **Cloudflare D1** (`DB` binding).
- **Object Storage**: Media and asset storage on **Cloudflare R2** (`STORAGE` binding).
- **Authentication**: Passwordless OTP authentication with session persistence.
## Project Structure

```
├── db/
│   ├── migrations/          # D1 SQL Schema migrations (tracked by Wrangler)
│   └── seed/                # Initial seed data for products, categories, banners
├── functions/               # Cloudflare Pages Functions (Edge API)
│   ├── _shared/             # Shared DB helpers, response formats, error classes
│   └── api/                 # REST endpoints
│       ├── products/        # Products CRUD
│       ├── categories.ts    # Categories listing
│       ├── banners/         # Banners CRUD
│       ├── accessories/     # Accessories CRUD
│       ├── orders/          # Orders management
│       ├── flash-sales/     # Flash deals & campaigns
│       ├── settings/        # Store & communication settings
│       ├── instagram-posts/ # Instagram feed management
│       ├── users/           # Users and staff admin accounts
│       ├── cart/            # Customer cart operations
│       ├── wishlist/        # Customer wishlist operations
│       ├── addresses/       # Customer delivery addresses
│       ├── upload.ts        # R2 file upload endpoint
│       └── storage/         # R2 object streaming endpoint
├── src/                     # React application source
└── wrangler.toml            # Cloudflare Pages, D1, and R2 configuration
```

## Local Development

### 1. Install Dependencies
```bash
npm run
```

### 2. Run Local D1 Migrations and Seeds
```bash
npm run db:migrate:local
npm run db:seed:local
```

### 3. Start Development Server
```bash
# Vite frontend dev server (fast HMR)
npm run dev

# Or full Cloudflare Pages Functions simulation with Wrangler:
npm run pages:dev
```

### 4. Build & Verify
```bash
# Typecheck and build frontend
npm run build

# Compile Pages Functions worker
npm run pages:build
```
