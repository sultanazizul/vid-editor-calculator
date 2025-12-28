# Editor Fee Calculator 🎬

Aplikasi PWA untuk menghitung dan mengelola fee editor video. Dilengkapi dengan dashboard analytics, invoice generator, dan integrasi database PostgreSQL.

![Dashboard Screenshot](public/screenshots/dashboard.png)

## ✨ Fitur

- **📊 Dashboard** - Overview pengeluaran dengan statistik dan chart
- **🧮 Kalkulator** - Hitung fee berdasarkan tipe editing dan durasi
- **📄 Invoice** - Generate invoice PDF untuk editor
- **📧 Email Share** - Kirim invoice langsung via email
- **📥 Export Excel** - Export data ke format Excel
- **👥 Manajemen Editor** - Kelola daftar editor dengan kontak
- **💰 Rate Card** - Kustomisasi tarif untuk setiap tipe editing
- **💾 Database** - Persistensi data dengan PostgreSQL (Neon)
- **📱 PWA** - Install sebagai aplikasi di device

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: TailwindCSS
- **Backend**: Express.js
- **Database**: PostgreSQL (Neon) + Prisma ORM
- **PDF**: jsPDF + AutoTable
- **Excel**: SheetJS (xlsx)
- **PWA**: vite-plugin-pwa

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Neon PostgreSQL account (free tier available)

### Installation

1. Clone repository
```bash
git clone https://github.com/sultanazizul/vid-editor-calculator.git
cd vid-editor-calculator
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env dengan DATABASE_URL dari Neon
```

4. Generate Prisma client & push schema
```bash
npm run db:generate
npm run db:push
```

5. Jalankan development server

**Terminal 1 - Backend API:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

6. Buka http://localhost:5173

## 📝 Environment Variables

Buat file `.env` di root project:

```env
# Neon PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require"
```

## 📁 Project Structure

```
├── prisma/
│   └── schema.prisma    # Database schema
├── public/
│   └── icon-*.png       # PWA icons
├── server/
│   └── index.js         # Express API server
├── src/
│   ├── api/             # API client
│   ├── components/      # React components
│   └── pages/           # Page components
├── .env                 # Environment variables (not in git)
└── vite.config.js       # Vite + PWA config
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run server` | Start Express API server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |

## 📊 Database Schema

```prisma
model Editor {
  id        Int       @id @default(autoincrement())
  name      String
  email     String?
  phone     String?
  projects  Project[]
}

model Project {
  id        Int      @id @default(autoincrement())
  name      String
  type      String
  duration  Int
  total     Int
  tags      String[]
  date      DateTime @default(now())
  editor    Editor?  @relation(...)
}

model Rate {
  id             Int    @id @default(autoincrement())
  key            String @unique
  label          String
  basePrice      Int
  extraPerMinute Int
}
```

## 📄 License

MIT License

## 👤 Author

**Sultan Azizul**

- GitHub: [@sultanazizul](https://github.com/sultanazizul)
