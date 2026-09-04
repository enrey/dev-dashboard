# Security Policy

## Reporting a Vulnerability

Please do not open public issues for suspected vulnerabilities.

Report security concerns privately to the maintainers through the repository owner's preferred private contact channel. Include:

- affected component or path;
- steps to reproduce;
- potential impact;
- any logs or screenshots with secrets removed.

## Secrets

Do not commit API tokens, passwords, private keys, `.env` files, production URLs, customer data, or real employee data. Use `.env.example` files and local environment variables instead.

Before publishing or releasing, run secret scanning:

```bash
gitleaks detect --source . --no-git
trufflehog filesystem .
```
