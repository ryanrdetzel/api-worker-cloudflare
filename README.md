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

### Schema

Create a new file in schemas 

replace d1-example-db with the database name in wrangler.toml

```
npx wrangler d1 execute d1-example-db --file=./schemas/schema.sql
```

To execute the schema on the remove database

```
npx wrangler d1 execute d1-example-db --file=./schemas/schema.sql --remote
```


## Deploy

```
npx wrangler deploy
```