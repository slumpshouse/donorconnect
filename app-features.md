# DonorConnect — App Features

## Overview
DonorConnect is a multi-tenant donor retention platform built with Next.js (App Router), PostgreSQL, and Prisma.

## Authentication & Security
- Email/password authentication (bcrypt)
- Session-based auth using HTTP-only cookies (database-backed sessions)
- Protected dashboard route group (redirects to login when unauthenticated)

## Multi-Tenancy (Organizations)
- Organizations are the tenant boundary
- Core data is scoped by `organizationId`
- API queries filter by the signed-in user’s organization

## Role-Based Access Control (RBAC)
- User roles: `ADMIN`, `STAFF`, `MARKETING`, `READONLY`
- Admin-only capability example: deleting a donor (server-side enforcement)
- Staff/Admin capabilities example: creating donors and donations (server-side enforcement)

## Donor Management
- Donor list with pagination and filtering/search
- Create donor
- Donor profile detail view (overview)
- Donor-related data tabs:
  - Donations (giving history)
  - Interactions (engagement timeline items)
- Delete donor (admin-only)

## Donation Tracking
- View recent donations (org-scoped)
- Log a new donation (donor, amount, date, method, optional campaign, notes)
- Donor metrics update when a donation is recorded (total gifts, total amount, first/last gift date)

## Campaigns / Segments / Workflows / Tasks (Platform Modules)
- Campaign data model and API routes exist (campaign tracking)
- Segments data model and API routes exist (grouping donors)
- Workflows and tasks API routes exist (automation/follow-up patterns)

## Real Data (Not Placeholder Only)
- Full Prisma schema with real relationships (Donor ↔ Donation, Campaign, Tasks, Segments, etc.)
- Seed script creates realistic demo data:
  - Multiple organizations
  - Users across roles
  - Donors, donations, campaigns, and related entities

## Testing & Tooling
- Vitest configuration for unit/component/integration tests
- Playwright configuration for E2E tests

## Notes / Known Incomplete Areas
These are present in the project but currently appear to be TODO/incomplete:
- Donor edit page UI (stub)
- Individual donation endpoint (`/api/donations/[id]`) includes TODOs for GET/PATCH/DELETE
