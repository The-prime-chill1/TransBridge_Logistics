# TransBridge Logistics — Enterprise Logistics Platform

A full-stack, production-grade logistics management platform for door-to-door shipping between the United Kingdom and Nigeria.

**Tagline:** Across Borders, On Time.

---

## Tech Stack

**Frontend:** React 19, Vite, CSS Modules, Framer Motion, GSAP, React Three Fiber, React Router DOM, Axios, React Hook Form, Lucide Icons, Socket.io Client

**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT (access + refresh tokens), bcrypt, Socket.io, Nodemailer, Termii SMS, Cloudinary, Multer, Helmet, express-validator, express-rate-limit

---

## Project Structure

```
transbridge/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # layout, ui, three (3D), common
│       ├── pages/          # public, customer, admin
│       ├── context/        # Auth, Theme, Socket providers
│       ├── services/       # Axios API layer
│       └── assets/styles/  # global design system CSS
└── server/                 # Express backend
    ├── config/             # db, cloudinary
    ├── controllers/        # business logic
    ├── routes/             # API endpoints
    ├── models/             # Mongoose schemas
    ├── middleware/         # auth, validation, rate limiting, errors
    ├── services/           # email, sms, otp, tokens, uploads
    ├── sockets/             # Socket.io real-time logic
    └── utils/               # seed scripts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

Copy `server/.env.example` to `server/.env` and fill in:

- **MongoDB Atlas** connection string
- **JWT secrets** (access + refresh)
- **Nodemailer** SMTP credentials (e.g. Gmail App Password)
- **Termii** API key for SMS OTP delivery
- **Cloudinary** credentials for image/document storage
- **Admin seed** credentials (first admin account)

### 3. Seed the first admin account

```bash
cd server && node utils/seedAdmin.js
```

### 4. Run in development

From the project root:

```bash
npm run dev
```

This concurrently starts:
- Frontend on `http://localhost:3000`
- Backend API on `http://localhost:5000`

---

## Key Features Implemented

- **Dual-channel OTP verification** (Email + SMS) for registration, password reset, and password change
- **JWT authentication** with httpOnly refresh token cookies and auto-refresh interceptor
- **Auto-generated tracking numbers** in `TB-YYYY-NNNNNN` format, collision-checked
- **9-step shipment timeline** with full audit history (location, remarks, timestamp, updated-by)
- **Real-time updates** via Socket.io — customers see shipment status changes instantly, admins get live alerts
- **Role-based access control** — customer, staff, admin with route-level and field-level permissions
- **Rate limiting** on auth and OTP endpoints to prevent brute-force and spam
- **Audit logging** for all sensitive admin actions
- **Cloudinary uploads** for shipment images, proof of delivery, and avatars
- **Light/dark theme** with persisted preference and CSS variable-driven design system
- **3D animated globe** (React Three Fiber) visualizing the UK–Nigeria shipping route

---

## API Overview

| Domain | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | register, verify-otp, resend-otp, login, refresh-token, logout, forgot-password, reset-password, change-password |
| Shipments | `/api/shipments` | track/:trackingNumber (public), my, CRUD (admin), images upload |
| Users | `/api/users` | profile, avatar, addresses, admin user management |
| Quotes | `/api/quotes` | create (public/guest), my, admin CRUD |
| Notifications | `/api/notifications` | list, unread-count, mark read |
| Support | `/api/support` | tickets CRUD, reply, close |
| Analytics | `/api/analytics` | dashboard, revenue, shipment stats |

---

## Brand Identity

| Color | Hex |
|---|---|
| Navy (Primary) | `#0A1D56` |
| Gold (Secondary) | `#D4A017` |
| Green (Accent) | `#008751` |
| Dark | `#071228` |
| White | `#FFFFFF` |

**Fonts:** Poppins (display), Outfit (body), Inter (UI text)

**Contact:**
- Email: Transbridgelogistics01@gmail.com
- UK WhatsApp: +44 7934 219309
- Nigeria WhatsApp: 08165595873

---

## Next Steps / Remaining Pages

The architecture supports rapid scaffolding of the remaining pages using the same patterns established in `Home`, `Register`, `Login`, and `TrackShipment`:

- Public: About, Services (full), Pricing, GetQuote, Contact, FAQ, Privacy, Terms
- Customer: Dashboard, Shipments list/detail, Notifications, Quotes, Invoices, Profile, Security, Addresses, Support
- Admin: Login, Dashboard, Shipments CRUD + form, Customers, Analytics, Quotes, Notifications, Support Center, Settings

Each follows the same conventions: CSS Modules for styling, Framer Motion for entrance animations, the shared `api.js` service layer, and the `AuthContext`/`SocketContext` for state.
