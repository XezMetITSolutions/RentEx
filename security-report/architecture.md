# RentEx Architecture Mapping

## 1. Technology Stack
- **Primary Language:** TypeScript (90%), JavaScript (10%)
- **Backend Framework:** Next.js 16.1.4 (App Router)
- **Frontend Framework:** React 19.2.3, TailwindCSS 4
- **Mobile Framework:** Expo (React Native) 54.0.34
- **ORM:** Prisma 6.19.2
- **Database:** PostgreSQL (via `pg` driver)
- **File Storage:** AWS S3
- **Payments:** Stripe
- **Email:** Resend
- **Auth:** Custom cookie-based session management, Biometrics (Mobile)

## 2. Application Classification
- **Type:** Full-stack Web Application with companion Mobile App
- **Structure:** Monolith with separate mobile client

## 3. Entry Points
### Web API Routes (`/api/*`)
- `/api/admin/*`: Protected admin operations
- `/api/cars/*`: Fleet management
- `/api/mobile/*`: Mobile app endpoints
- `/api/webhook/*`: Stripe/AWS webhooks
- `/api/cron/*`: Scheduled tasks

### Frontend Routes
- `/dashboard/*`: Customer dashboard (Authenticated)
- `/admin/*`: Staff dashboard (Authenticated)
- `/login`, `/admin/login`: Entry points for auth

## 4. Trust Boundaries
- **CORS Middleware:** `middleware.ts` handles CORS. Note: Permissive `*` for API routes in some conditions.
- **Authentication:** 
  - Customer: `rentex_customer` cookie
  - Admin: `rentex_admin_session` cookie
- **Input Validation:** Zod used in `package.json`, likely used in API handlers.

## 5. Detected Security Controls
- **Rate Limiting:** Not explicitly seen in `package.json` or `middleware.ts`.
- **CSRF Protection:** Standard Next.js CSRF protection (if using server actions).
- **Session Management:** SecureStore used on mobile.

## 6. External Integrations
- **AWS S3:** Asset storage
- **Stripe:** Payment processing
- **Resend:** Transactional emails
- **Sixt API:** Potential integration found in `app/api/sixt`

## 7. Detected Languages Summary
- **TypeScript:** Primary logic for web and mobile.
- **JavaScript:** Scripts and legacy components.
- **PHP:** Legacy migration scripts found in `Downloads/Emlaxia` (may not be part of the main app but relevant for migration).
- **PostgreSQL (SQL):** Database queries.

## 8. Critical Paths
- `app/api/auth/*`: Authentication logic
- `native-app/lib/auth.tsx`: Mobile auth logic
- `prisma/schema.prisma`: Data structure
- `middleware.ts`: Security filters
