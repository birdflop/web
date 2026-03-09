# Running the website on the Production database

To run the website connected to the production database, go into `wrangler.jsonc` and set `"remote": true` under the `d1_databases` section. This will connect the website to the production D1 database when running locally. Please turn this off when making contributions to allow for easier testing and development.

# Production Environment Variables
The following environment variables on top of the example env are required to run the Birdflop website in production and/or migrate the production database.

```
NODE_VERSION=

CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_D1_TOKEN=
```