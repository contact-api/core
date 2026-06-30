# Contact API Vercel

Deployable **multi-provider** contact form API.

## Features
- Single `POST /api/contact` endpoint - drop into any project.
- Multi-provider support: Resend and Nodemailer (SMTP).
- CORS support via `ALLOWED_ORIGINS`.
- Input validation with descriptive error responses.
- Rate limiting via Vercel WAF to prevent spam and abuse.
- Honeypot protection.
> **Note:** To utilize the honeypot, include a hidden input field named `fax_number` in your frontend and keep it empty when submitting the form.

## Usage
```js
await fetch("https://your-deployment.vercel.app/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email: "sender@example.com",  // required
        message: "Your message here", // required
        subject: "Hello",             // optional
        name: "Your name",            // optional
        fax_number: ""                // optional; must be empty
    })
});
```

## Response
| Status | Body |
| ------ | ---- |
| 200    | { success: true, message: "Message sent successfully" } |
| 400    | { error: "Invalid or missing fields" } |
| 403    | { error: "Forbidden" } |
| 405    | { error: "Method not allowed" } |
| 415    | { error: "Unsupported Media Type" } |
| 429    | { error: "Too many requests. Please try again later" } |
| 500    | { error: "Message delivery failed. Please try again later" } |
| 503    | { error: "Service temporarily unavailable" } |

## Deployment & Configuration

### Prerequisites
- Node.js 20+
- Vercel
- An email provider
    - **Resend:** API key and verified domain.
    - **Nodemailer:** Valid SMTP settings (`host`, `port`, `auth.user`, `auth.pass`, and `secure` when needed).

### 1. Clone & Install
```bash
git clone https://github.com/masonlet/contact-api.git
cd contact-api
npm install
```

### 2. Configure `.env`
Copy `.env.example` to `.env` and fill Environment Variables. Shared values are **required**; provider-specific values depend on `EMAIL_PROVIDER`.

| Variable          | Description |
| ----------------- | ----------- |
| `FROM_EMAIL`      | Sender address |
| `TO_EMAIL`        | Recipient email addresses, comma-separated. |
| `ALLOWED_ORIGINS` | Allowed CORS origins, comma-separated. Leave empty to block all cross-origin requests. |
| `EMAIL_PROVIDER`  | Email provider to use: `resend` or `nodemailer`. |
| `RESEND_API_KEY`  | Resend API key, required when `EMAIL_PROVIDER=resend`. |
| `SMTP_CONFIG`     | JSON string of Nodemailer SMTP config, required when `EMAIL_PROVIDER=nodemailer`. |

### Local Development
```bash
npm run typecheck     # TypeScript type check
npm run test          # Run Vitest tests
npm run test:watch    # Run Vitest in watch mode
npm run test:coverage # Run Vitest in coverage mode
```

## License
MIT License - see [LICENSE](./LICENSE) for details.
