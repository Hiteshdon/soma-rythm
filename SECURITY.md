Security & secret-handling guidance

1) Immediate (do now)
- Rotate the exposed credentials immediately: revoke the leaked Resend API key and rotate your MongoDB connection string / user/password.
- Treat old keys as compromised and delete them at the provider.

2) Remove secrets from the repo history (we will do this)
- We'll purge `.env` from git history and force-push the cleaned repository to your fork. After that, every collaborator must re-clone the repo.

3) Local development
- Keep a local `.env` file (not committed). Use `.env.example` in the repo to document required env vars.
- To run locally:
  - Copy `.env.example` to `.env` and fill values.
  - `npm install` then `npm start` (or your usual start command).

4) Deployment / production
- Do NOT store production secrets in the repo. Put them into your hosting provider environment (Render/Heroku/Vercel) or into GitHub Secrets used by Actions.
- Example GitHub Actions usage:

  name: CI
  on: [push]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Setup Node
          uses: actions/setup-node@v4
          with:
            node-version: '18'
        - name: Install and build
          run: npm ci && npm run build
          env:
            MONGO_URI: ${{ secrets.MONGO_URI }}
            RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
            EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
            EMAIL_TO: ${{ secrets.EMAIL_TO }}

5) After purge
- Everyone who works with the repo must re-clone:
  - `git clone https://github.com/Hiteshdon/soma-rythm.git`
- Rotate credentials again if necessary and update environment variables in deployment.

6) Monitoring
- Check logs for suspicious activity on Mongo and Resend and revoke any leaked tokens.

If you want, I can also prepare a small Actions workflow template for deployment to a chosen host, or run the history purge now (I will run it against your fork and force-push cleaned history).