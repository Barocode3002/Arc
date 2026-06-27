# Arc. ☕

> The complete digital transformation platform for Egyptian cafés.

Arc. replaces paper menus, phone bookings, and handwritten notebooks with a single modern platform — live in one week.

---

## What is Arc.?

Arc. is a SaaS MVP built specifically for cafés in Egypt. It gives café owners a full digital stack: a QR-scannable menu, an online booking system with personalized table experiences, and an admin dashboard to manage bookings, staff, inventory, and the menu — all from one screen.

---

## Features

### Customer-Facing
- **QR Digital Menu** — Customers scan a QR code and browse the full menu on their phone. No app download needed.
- **Online Table Booking** — Reserve a table in seconds, 24/7, directly from the website.
- **Special Opening** — Customers can book a personalized table experience for birthdays, engagements, graduations, and more. Includes custom add-ons (candles, flowers, balloons) and a gold sticker printed with the guest's name.

### Admin Dashboard
- **Overview** — Today's bookings count, pending confirmations, Special Opening count, add-ons revenue, and low-stock alerts at a glance.
- **Bookings Management** — View, confirm, or cancel bookings in real-time using Supabase Realtime. Filter by status or type.
- **Menu Manager** — Add, edit, delete, and toggle availability of menu items. Changes reflect instantly on the live QR menu.
- **Staff Management** — Employee profiles with roles, salaries, and shift assignments.
- **Shift Tracking** — Daily attendance sheet. Mark each employee as present, absent, or late.
- **Inventory Control** — Track stock levels, log incoming and outgoing transactions, get low-stock alerts, and record purchases.

### Platform
- **Bilingual** — Full Arabic and English support with automatic RTL layout when Arabic is active. Language auto-detected from the user's device.
- **Mobile-first** — All customer-facing pages are optimized for mobile. Admin dashboard is desktop-first.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Auth + Realtime) |
| i18n | i18next + react-i18next |
| QR Code | qrcode.react |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── components/
│   ├── ui/               # Button, Card, Badge, Input, Modal, Spinner, LanguageToggle
│   └── layout/           # Navbar, AdminLayout, Sidebar, ProtectedRoute
├── contexts/
│   └── AuthContext.jsx
├── hooks/
│   ├── useBookings.js
│   ├── useMenu.js
│   ├── useStaff.js
│   ├── useInventory.js
│   └── useRealtime.js
├── i18n/
│   ├── index.js
│   └── locales/
│       ├── en.json
│       └── ar.json
├── lib/
│   └── supabase.js
├── pages/
│   ├── Home.jsx
│   ├── Menu.jsx
│   ├── Booking.jsx
│   └── admin/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── Bookings.jsx
│       ├── MenuManager.jsx
│       ├── Staff.jsx
│       ├── Shifts.jsx
│       └── Inventory.jsx
└── utils/
    └── helpers.js
```

---

## Database Schema

```sql
cafes                 -- café profiles and branding
menu_items            -- menu with categories, prices, badges
bookings              -- all reservations (regular + special)
special_addons        -- add-on options per café (candles, flowers, etc.)
employees             -- staff profiles with roles and salaries
shifts                -- daily attendance records per employee
inventory_items       -- stock items with units and min levels
inventory_transactions -- stock in/out movements
purchases             -- purchase records from suppliers
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project with the schema above applied

### Installation

```bash
git clone https://github.com/your-username/arc-coffee.git
cd arc-coffee
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## Routes

| Path | Description |
|---|---|
| `/` | Public landing page |
| `/:slug/menu` | QR menu for a specific café |
| `/:slug/book` | Booking page for a specific café |
| `/admin/login` | Admin login |
| `/admin` | Dashboard overview |
| `/admin/bookings` | Bookings management |
| `/admin/menu` | Menu manager |
| `/admin/staff` | Staff management |
| `/admin/shifts` | Shift attendance |
| `/admin/inventory` | Inventory control |

---

## MVP Scope

This is a focused MVP. The following are intentional decisions:

- **One café per deployment** — Multi-tenancy is on the roadmap, not in scope for v1.
- **No payment processing** — Special Opening add-ons are priced but paid in person.
- **No customer accounts** — Bookings are guest-based, identified by phone number.
- **Simple auth** — Single admin user per café via Supabase Auth.

---

## Roadmap

- [ ] Multi-tenant support (one platform, many cafés)
- [ ] Customer-facing booking history via phone number
- [ ] Online payment for Special Opening add-ons
- [ ] Sales analytics and reporting
- [ ] WhatsApp booking confirmation via Twilio
- [ ] Mobile app for staff attendance

---

## License

MIT — free to use, modify, and distribute.

---

<p align="center">Built with care for Egyptian cafés. ✦</p>