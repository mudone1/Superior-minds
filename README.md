# Superior Minds Academy — School Management System

**Phase 1: Foundation** — authentication, role-based routing, and the
reusable UI/architecture that later phases (admissions, gradebook, fees,
messaging) will build on.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS 3**
- **Firebase Authentication** (email/password)
- **Firestore** (user profiles, rules-enforced)
- **Firebase Storage** (avatars, documents)
- **Firebase Cloud Functions** (staff-managed account provisioning)
- Server-verified **httpOnly session cookies** (not just client SDK state)

No plain HTML pages — every screen is a React component rendered through
the App Router.

## Architecture at a glance

```
src/
  app/                      # Routes only — thin, delegate to components
    page.tsx                # Home (public)
    login/page.tsx
    forgot-password/page.tsx
    dashboard/
      page.tsx               # Redirects to the caller's role dashboard
      super-admin/page.tsx
      administrator/page.tsx
      administrative-staff/page.tsx
      teacher/page.tsx
      parent/page.tsx
    unauthorized/page.tsx
    api/auth/session/route.ts # Mint/verify/clear the session cookie
  components/
    ui/                      # Button, Input, Card, Alert, Spinner, Badge
    layout/                  # Navbar, Footer, Sidebar, DashboardShell, Logo
    auth/                    # LoginForm, ForgotPasswordForm, AuthLayout
    dashboard/                # StatCard, WelcomeBanner, PhaseNotice
  contexts/AuthContext.tsx    # Client auth state (wraps Firebase + session cookie)
  hooks/                      # useAuth, useRoleRedirect
  lib/
    firebase/                 # config (client), admin (server), auth, firestore, storage
    auth/requireSession.ts    # Server-only route guards
    roles.ts, navigation.ts, constants.ts, utils.ts
  types/                      # UserRole, AppUser, SessionUser
  middleware.ts               # Edge-level redirect for /dashboard/*
functions/                    # Cloud Functions (account provisioning)
scripts/bootstrap-super-admin.ts
firestore.rules / storage.rules / firebase.json
```

### Why both middleware *and* server-side guards?

Edge middleware can't run the Firebase Admin SDK, so it only checks that a
session cookie **exists** before letting a request through — a cheap first
pass that redirects obviously-signed-out visitors immediately. The real
authorization boundary is `requireSession()` / `requireRole()` in
`lib/auth/requireSession.ts`, which runs on the server, verifies the
cookie with Firebase Admin, and checks the caller's role against Firestore
before a role dashboard ever renders. Firestore/Storage rules are the
final backstop — never trust the client alone.

### Roles

`super-admin | administrator | administrative-staff | teacher | parent`

Each role has exactly one dashboard segment (`/dashboard/<role>`). After
login, `AuthContext.login()` reads the caller's role from the verified
session and routes them straight there. Visiting another role's dashboard
URL bounces you back to your own (see `requireRole`).

Accounts are **not self-registered** — an Administrator or Super Admin
provisions every login via the `createStaffAccount` Cloud Function, which
creates the Firebase Auth user, sets a `role` custom claim, and writes the
matching Firestore profile in one request.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase config (see below)
npm run dev
```

### 1. Create a Firebase project

In the [Firebase Console](https://console.firebase.google.com):

1. Create a project, then add a **Web app** — copy the config values into
   the `NEXT_PUBLIC_FIREBASE_*` vars in `.env.local`.
2. **Authentication → Sign-in method** → enable **Email/Password**.
3. **Firestore Database** → create in production mode.
4. **Storage** → create a default bucket.
5. **Project settings → Service accounts** → *Generate new private key* →
   copy `project_id`, `client_email`, and `private_key` into the
   `FIREBASE_ADMIN_*` vars (keep the `\n` sequences in the private key
   intact — it's a single-line env var).

### 2. Deploy security rules & functions

```bash
npm install -g firebase-tools   # if you don't have it
firebase login
firebase use --add               # pick your project, alias "default"

firebase deploy --only firestore:rules,storage:rules
cd functions && npm install && cd ..
firebase deploy --only functions
```

### 3. Bootstrap the first Super Admin

Every other account is created *through* the app, but the first one has
to be seeded directly:

```bash
npm run bootstrap:admin -- "admin@superiorminds.edu" "Ada Lovelace" "ChangeMe123!"
```

Then sign in at `/login` with that email and password — you'll land on
`/dashboard/super-admin`.

### 4. Run locally against the Firebase Emulator Suite (optional)

```bash
firebase emulators:start
```

## Scripts

| Command                 | Description                                  |
| ------------------------ | --------------------------------------------- |
| `npm run dev`             | Start the Next.js dev server                  |
| `npm run build`           | Production build                              |
| `npm run start`           | Serve the production build                    |
| `npm run lint`            | ESLint                                        |
| `npm run type-check`      | `tsc --noEmit`                                |
| `npm run bootstrap:admin` | Seed the first Super Admin account            |

## What's next (Phase 2+)

- Admissions & enrollment workflows (Administrative Staff)
- Gradebook & attendance (Teacher)
- Fee statements & online payment (Parent)
- Staff/account management UI backed by `createStaffAccount` / `setUserRole`
- In-app messaging between staff and parents
