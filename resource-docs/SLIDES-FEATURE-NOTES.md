# Slide Notes — AI Outreach Assistant + Campaign Insights

## AI Outreach Assistant (Donor Profiles)

### What it is
A user-facing AI tool embedded directly on each donor profile that generates a stewardship outreach draft (email or call script) that staff can review, edit, and send.

### How it works (in the app)
- **Where users see it:** Donor detail page → section labeled **“AI Outreach Assistant”**.
- **User action:** Staff choose a channel (**Email** or **Call**) and click **Generate**.
- **Request path:** The UI calls `POST /api/ai/outreach`.
- **Security / access control:**
  - Requires an authenticated session.
  - Limited to `ADMIN` and `STAFF` roles.
- **Data used (minimized on purpose):**
  - Donor basics: name + email
  - Donor totals: total gifts, total amount, last gift date
  - **Last 3 donations**: date, amount, campaign name
- **Model behavior (guardrails):**
  - Prompt instructs the model to be conservative: **don’t invent facts**, **don’t add personal details**, **don’t mention internal risk scores**.
  - Output is constrained to a short, structured draft + “next steps”.
- **Fail-safe behavior:**
  - If no OpenAI key is configured, or the AI call fails (e.g., invalid key, rate limit, network error), the API returns a **template-based fallback draft**.
  - The UI clearly labels the draft source: **OpenAI-generated** vs **Template fallback**, and shows a warning when it falls back.
- **No automation:**
  - Nothing is sent automatically.
  - Drafts are not automatically written to the database; the user copies and uses them intentionally.

### Slide bullets — how it helps users
- Reduces time to write stewardship outreach (email/call script in one click)
- Improves consistency of donor follow-up (structured, repeatable drafts)
- Keeps humans in control (review/edit before sending; no automated actions)
- Uses minimal, relevant context (recent giving + totals, not sensitive guesses)
- Degrades gracefully (template fallback ensures the feature still works)
- Builds trust through transparency (labels AI vs template + shows warnings)

---

## Campaign Insights (Dashboard)

### What it is
A dashboard feature that summarizes campaign performance trends and suggests practical next steps based on recent donation results.

### How it works (in the app)
- **Where users see it:** Dashboard → **Campaign Insights** card.
- **User control:** Insights are **collapsible** (Show/Hide) to keep the dashboard scannable.
- **Data source:** Donation records linked to campaigns (organization-scoped / multi-tenant safe).
- **Trend calculation:**
  - Compares **last 30 days** vs **previous 30 days**.
  - Computes direction labels: **UP / DOWN / FLAT** using amount + gift-count changes.
- **Output displayed:**
  - Top campaigns by recent revenue
  - Each campaign shows 30-day totals and comparison to the previous period
  - “What to do next” list summarizing suggested actions
- **AI note (accuracy):**
  - The current Campaign Insights card is **deterministic** (math/aggregations), not an AI model call.

### Slide bullets — how it helps users
- Makes fundraising performance easier to scan (clear UP/DOWN/FLAT signals)
- Helps prioritize attention (which campaigns need review vs doubling down)
- Supports data-driven decision making (period-over-period comparison)
- Encourages continuous improvement (small “what to do next” actions)
- Keeps the dashboard clean (optional Show/Hide control)

