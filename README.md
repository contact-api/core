# Contact API Core
Contact form logic: CORS evaluation, validation, honeypot handling, and email orchestration. Will be paired with one or more providers, (`Resend` or `Nodemailer`), and a platform, (`Vercel`).

[![CI](https://github.com/contact-api/core/actions/workflows/ci.yml/badge.svg)](https://github.com/contact-api/core/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

## Exports
- `handleContact(req, deps)` — orchestrates the full contact-form flow
- `evaluateCors(req, allowedOrigins)` — CORS decision logic
- `sendEmail(config, body)` — dispatches to a given `EmailProvider`
- `isValidBody(body)` — input validation
- Types: `ContactRequest`, `ContactResult`, `EmailProvider`, `EmailPayload`, `EmailBody`

## License
MIT License - see [LICENSE](./LICENSE) for details.
