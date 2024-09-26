```
npm install
npm run dev
```

```
npm run deploy
```

## Env and Secrets


### Local

Edit .dev.vars

### Remote

Update the wrangler.toml if it's plaintext or update the vars directly in the Cloudflare dashboard if it's a secret

## Add a D1 database

https://developers.cloudflare.com/d1/tutorials/build-an-api-to-access-d1

```
npx wrangler d1 create <DATABASE_NAME>
```

Copy the output and replace what's in wrangler.toml

### Database Migrations

```
npx wrangler d1 migrations create DB initial
npx wrangler d1 migrations list DB
```

```
npx wrangler d1 migrations apply DB
```

## Clerk
Add the clerk secret via the dashboard or command line and then update the existing CLERK keys
in the wrangler.toml to match the depoyment

## Deploy

```
npx wrangler deploy
```