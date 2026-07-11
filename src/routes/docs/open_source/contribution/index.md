---
title: Contributing to the Birdflop Website
date_created: 01-18-2026
last_updated: 01-18-2026
description: Information about contributing to the Birdflop website, including forking and community involvement.
author: Sab
contributors:
  - saboooor
---

### All contributions are welcome. Birdflop is a community-project aiming to support its community.

# Setting up a Local Development Environment

To contribute to the Birdflop website, you'll need to set up a local development environment.

## Prerequisites

- **Node.js** (version 24.13.0 or higher)
- **pnpm** package manager

## Steps to Set Up

1. **Clone the Repository**: Fork the Birdflop website repository on GitHub https://github.com/birdflop/web and clone it
2. **Install Dependencies**: Navigate to the project directory and run `pnpm install` to install all necessary dependencies.
3. **Build the Project**: Run `pnpm build` to build the project. This is only necessary the first time you set up the project to setup the RGBirdflop package and Cloudflare worker types to avoid type errors.
4. **Run the Development Server**: Start the development server with `pnpm start`. The website should now be accessible at `http://localhost:5173`.

## Database Setup

The Birdflop website uses Cloudflare D1 for its database, setting up a local database may be required for contributing to the Presets and other systems that require database setup, otherwise Flopbird will give you an error while opening some pages. To set up a local database:

1. **Migrate the Database**: Run `pnpm wrangler:migrate-local` to set up the local database schema on your machine.
2. **Run the server**: Start the development server with `pnpm start`.

## Setting up Environment Variables

For login with Discord to work, you will need to set up a Discord application from the dev portal and set up environment variables. Create a `.env` file in the root of the project and add the following variables:

```
AUTH_SECRET=this_can_be_any_random_string
AUTH_DISCORD_ID=the_client_id_from_your_discord_application
AUTH_DISCORD_SECRET=the_client_secret_from_your_discord_application

ADMINS=your_user_id_in_profile_page_after_you_login
```

#### Thank you to our Contributors

[![Contributors](https://contrib.rocks/image?repo=birdflop/web)](https://github.com/birdflop/web/graphs/contributors)
