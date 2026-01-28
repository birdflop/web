# Birdflop Website
The website for Birdflop, a 501(c)(3) nonprofit aiming to provide accessible hosting and resources.

<a href="https://www.codefactor.io/repository/github/birdflop/web"><img src="https://www.codefactor.io/repository/github/birdflop/web/badge?style=for-the-badge" alt="CodeFactor" /></a>
<a href="https://github.com/birdflop/web/commits"> <img src="https://img.shields.io/github/last-commit/birdflop/web?style=for-the-badge"></a>
<a href="#"> <img src="https://img.shields.io/github/languages/code-size/birdflop/web?style=for-the-badge"></a>
<a href="https://github.com/birdflop/web/stargazers"> <img src="https://img.shields.io/github/stars/birdflop/web?style=for-the-badge"></a>
<a href="https://github.com/birdflop/web/network/members"> <img src="https://img.shields.io/github/forks/birdflop/web?style=for-the-badge"></a>

<a href="https://discord.com/invite/nmgtX5z"> <img src="https://discord.com/api/guilds/746125698644705524/widget.png?style=banner2"></a>

# Contributing
#### All contributions are welcome. Birdflop is a community-project aiming to support its community.

## Setting up a Local Development Environment
To contribute to the Birdflop website, you'll need to set up a local development environment.

### Prerequisites
- **Node.js** (version 24.13.0 or higher)
- **pnpm** package manager

### Steps to Set Up
1. **Clone the Repository**: Fork the Birdflop website repository on GitHub https://github.com/birdflop/web and clone it
2. **Install Dependencies**: Navigate to the project directory and run `pnpm install` to install all necessary dependencies.
3. **Build the Project**: Run `pnpm build` to build the project. This is only necessary the first time you set up the project to setup the RGBirdflop package and Cloudflare worker types to avoid type errors.
4. **Run the Development Server**: Start the development server with `pnpm start`. The website should now be accessible at `http://localhost:5173`.

### Database Setup
The Birdflop website uses Cloudflare D1 for its database, setting up a local database may be required for contributing to the Presets and other systems that require database setup, otherwise Flopbird will give you an error while opening some pages. To set up a local database:
1. **Migrate the Database**: Run `pnpm wrangler:migrate-local` to set up the local database schema on your machine.
2. **Run the server**: Start the development server with `pnpm start`.

### Setting up Environment Variables
For login with Discord to work, you will need to set up a Discord application from the dev portal and set up environment variables. Create a `.env` file in the root of the project and add the following variables:

```
AUTH_SECRET=this_can_be_any_random_string
AUTH_DISCORD_ID=the_client_id_from_your_discord_application
AUTH_DISCORD_SECRET=the_client_secret_from_your_discord_application

ADMINS=your_user_id_in_profile_page_after_you_login
```

#### Thank you to our Contributors
[![Contributors](https://contrib.rocks/image?repo=birdflop/web)](https://github.com/birdflop/web/graphs/contributors)
<h2>Forking & Licensing</h2>
If you are hosting this site or a single page from this site for your server or own project, please credit the original in some way. A link to the original GitHub is sufficient. <3
This project is dual-licensed. For open-source usage, it is available under the AGPL-3.0 license (OSS_LICENSE.md). Additional closed-source use, both commercial and non-commercial, is permitted under the details outlined in CSS_LICENSE.md. Licensing is required to re-use the RGBirdflop / RGB Birdflop gradient creator code.
<br><br>

<a href="https://www.star-history.com/#birdflop/web&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=birdflop/web&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=birdflop/web&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=birdflop/web&type=date&legend=top-left" />
 </picture>
</a>
