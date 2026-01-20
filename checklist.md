# Project Pages Checklist (Trello-style cards)

Below are Trello-style cards for each page in the app. Each card contains a short user story, success criteria, and a checklist describing how the page was implemented.

---

### Card: Dashboard
File: src/app/(dashboard)/dashboard/page.jsx

- User story: As an org admin, I want a dashboard showing key metrics and recent activity so I can quickly understand donor health.
- Success criteria:
  - Shows Total Donors, Total Donations, and Amount Received.
  - Displays At-risk donors count and latest donations (with donor name, campaign, amount, date).
  - Shows campaign insights trending up/down based on recent donation totals and gift counts, plus a short “what to do next” list.
  - Requires authenticated user; shows sign-in prompt otherwise.
- Checklist (how this page was made):
  - Server component with `getSessionUser()` for auth.
  - Prisma queries for counts, aggregates and recent donations.
  - Prisma groupBy over donations to compare last 30 days vs previous 30 days per campaign (totals + gift counts) and compute an up/down/flat trend.
  - Sidebar navigation and a main content grid with stat cards.
  - Format amounts with `.toFixed(2)` and dates with `toLocaleDateString()`.

---

### Card: Donors List
File: src/app/(dashboard)/donors/page.jsx

- User story: As a user, I want to view and search donors so I can manage relationships.
- Success criteria:
  - Displays table of donors with name, email, phone, status, gifts, amount, last gift.
  - Supports search, status filter, pagination, and page size selection.
  - Uses `useDonors` hook to fetch data and shows loading/error states.
- Checklist:
  - Client component using `useState` and `useDonors(page, limit, filters)`.
  - Render table rows and format amounts/dates.
  - Prev/Next pagination buttons wired to `setPage`.
   - Prev/Next pagination buttons wired to `setPage`.

  ---

  ### Card: Home / Landing
  File: src/app/page.jsx

  - User story: As a prospective user, I want to see a clear product summary and CTAs so I can understand value and sign in or register.
  - Success criteria:
    - Shows hero section with product pitch, primary CTA to `Login` and secondary CTA to `Register`.
    - Brief feature list and footer links visible and responsive on mobile.
    - SEO meta title and description present.
  - Checklist (how this page was made):
    - Server component rendering static content and CTAs.
    - Uses shared layout and global CSS for styling.
    - Links to `(auth)/login` and `(auth)/register` routes.

  ---

  ### Card: Workflows
  File: src/app/(dashboard)/workflows/page.jsx

  - User story: As a user, I want to view and manage automated workflows so I can run donor engagement sequences.
  - Success criteria:
    - Lists workflows with name, status, last run and run counts.
    - Create/edit workflow CTA and ability to trigger a run or view run history.
    - Requires authenticated user; shows unauthorized otherwise.
  - Checklist:
    - Server/component fetch via Prisma for workflows and recent runs.
    - `useWorkflows` hook for client-side interactions where needed.
    - Buttons wired to API routes for triggering runs and viewing logs.

  ---

  ### Card: Segments List
  File: src/app/(dashboard)/segments/page.jsx

  - User story: As a user, I want to browse saved donor segments so I can analyze and act on groups.
  - Success criteria:
    - Displays segments with name, rule summary, and donor count.
    - Preview button shows matching donors and export option.
    - Create segment CTA present.
  - Checklist:
    - Server fetch for segments; client preview uses an API endpoint to run segment query.
    - Preview modal lists donors and supports pagination.
    - Segment creation links to segment builder UI.

  ---

  ### Card: Segment Detail / Preview
  File: src/app/(dashboard)/segments/[id]/page.jsx

  - User story: As a user, I want to view a segment's rules and preview results so I can verify membership.
  - Success criteria:
    - Shows segment rules, donor count, and paginated preview list.
    - Export/refresh actions available.
  - Checklist:
    - Server component reads segment by id with Prisma and computes preview counts.
    - Preview requests call a paginated API that runs the segment query.
    - UI displays rule summary and donor rows with links to donor detail.

  ---

  ### Card: Donor Detail
  File: src/app/(dashboard)/donors/[id]/page.jsx

  - User story: As a user, I want to view a donor's profile and donation history so I can manage relationships.
  - Success criteria:
    - Shows donor fields (name, email, phone, address, status) and calculated stats (total gifts, total amount, last gift).
    - Lists donation history with amounts, campaigns and dates.
    - Edit button navigates to the edit form; tasks and notes visible.
  - Checklist:
    - Server component fetching donor and related donations via Prisma `include`.
    - Format amounts and dates; show donor status badge.
    - Action buttons link to edit page and task creation flows.

  ---

  ### Card: Create Donor
  File: src/app/(dashboard)/donors/new/page.jsx

  - User story: As a user, I want to add a new donor so I can track their donations.
  - Success criteria:
    - Form captures required donor fields and validates inputs.
    - On success, donor is created, user is redirected to donor detail and sees a success toast.
  - Checklist:
    - Client form using React Hook Form with Zod schema validation.
    - Submits to `/api/donors` POST route which validates server-side and creates record via Prisma.
    - On success, navigate to newly created donor page and show notification.

  ---

  ### Card: Edit Donor
  File: src/app/(dashboard)/donors/[id]/edit/page.jsx

  - User story: As a user, I want to update a donor's information so records stay current.
  - Success criteria:
    - Pre-filled form with donor data and client-side validation.
    - Saves updates via API and returns to donor detail with updated info.
  - Checklist:
    - Server component loads donor data and passes it to the client form.
    - Form uses React Hook Form + Zod and calls `/api/donors/[id]` PATCH endpoint.
    - Handle API errors and show success toast on completion.

  ---

  ### Card: Donations List
  File: src/app/(dashboard)/donations/page.jsx

  - User story: As a user, I want to browse gifts so I can review and reconcile giving.
  - Success criteria:
    - Table shows donor name, amount, campaign, type, and date.
    - Supports filtering by campaign, date range and donor; pagination available.
  - Checklist:
    - Client component uses `useDonations` hook and renders paginated rows.
    - Filters wired to query params and trigger refetches.
    - Amounts formatted and links to donor/campaign detail pages.

  ---

  ### Card: Create Donation
  File: src/app/(dashboard)/donations/new/page.jsx

  - User story: As a user, I want to record a donation so it appears in donor history and reporting.
  - Success criteria:
    - Form accepts donor (lookup), amount, campaign, date and type; validates required fields.
    - On success, donation appears in donor detail and donations list.
  - Checklist:
    - Client form with donor search/autocomplete and campaign select.
    - Submits to `/api/donations` POST route which creates donation via Prisma and updates donor aggregates.
    - Redirect or show success message after creation.

  ---

  ### Card: Campaigns List
  File: src/app/(dashboard)/campaigns/page.jsx

  - User story: As a user, I want to manage fundraising campaigns so I can attribute donations to initiatives.
  - Success criteria:
    - Lists campaigns with name, date range, total raised and gift counts.
    - Create/edit actions available and link to campaign detail.
  - Checklist:
    - Server component fetches campaigns and aggregate metrics with Prisma.
    - Render list with links to campaign detail and actions for editing.

  ---

  ### Card: Campaign Detail
  File: src/app/(dashboard)/campaigns/[id]/page.jsx

  - User story: As a user, I want to view a campaign's performance so I can evaluate effectiveness.
  - Success criteria:
    - Shows campaign details, totals (amount, gifts), and recent donations.
    - Date range filter and export option available.
  - Checklist:
    - Server fetch for campaign with donation aggregates and recent donations.
    - Render charts/tables for performance and donation rows.

  ---

  ### Card: Tasks
  File: src/app/(dashboard)/tasks/page.jsx

  - User story: As a user, I want to see and manage my tasks so I can follow up on donors.
  - Success criteria:
    - Shows assigned tasks with due date, donor, and status.
    - Mark complete action updates status and removes task from active list.
  - Checklist:
    - Client component with `useTasks` hook fetching tasks for the session user.
    - Mutations call API endpoints to update task status and refresh list.

  ---

  ### Card: Login
  File: src/app/(auth)/login/page.jsx

  - User story: As a returning user, I want to sign in so I can access my organization's dashboard.
  - Success criteria:
    - Accepts email and password, posts to `/api/auth/login`, receives session cookie, and redirects to dashboard.
    - Shows validation and authentication errors.
  - Checklist:
    - Client form handles input and posts credentials to the auth API.
    - On successful response, client follows redirect and stores session cookie from server.

  ---

  ### Card: Register
  File: src/app/(auth)/register/page.jsx

  - User story: As a new org admin, I want to create an account and organization so I can start using the app.
  - Success criteria:
    - Form collects organization name, admin email and password, calls `/api/auth/register`, and signs in new user.
    - On success, user is redirected to onboarding or dashboard.
  - Checklist:
    - Client form with validations (password strength, email format) using Zod.
    - POST to `/api/auth/register` that creates org + user and sets session cookie.

  ---
