# RGBirdflop Package

This NPM package is used to generate RGB gradient text for Minecraft without having to make API calls and is the most recommended way to use RGBirdflop in your projects.

## Installation
To install the RGBirdflop NPM package, use the following command:

```bash
npm install @birdflop/rgbirdflop
```

## Usage
Here is a basic example of how to use the RGBirdflop NPM package:

```
import { ColorGradient, RGBColor } from '@birdflop/rgbirdflop';
const colors = [new RGBColor(255, 0, 0), new RGBColor(0, 0, 255)];
const gradient = new ColorGradient(colors);
const result = gradient.generateOutput('Hello, Minecraft!', false);
console.log(result);
```

<a href="https://www.codefactor.io/repository/github/birdflop/web"><img src="https://www.codefactor.io/repository/github/birdflop/web/badge?style=for-the-badge" alt="CodeFactor" /></a>
<a href="https://github.com/birdflop/web/commits"> <img src="https://img.shields.io/github/last-commit/birdflop/web?style=for-the-badge"></a>
<a href="#"> <img src="https://img.shields.io/github/languages/code-size/birdflop/web?style=for-the-badge"></a>
<a href="https://github.com/birdflop/web/stargazers"> <img src="https://img.shields.io/github/stars/birdflop/web?style=for-the-badge"></a>
<a href="https://github.com/birdflop/web/network/members"> <img src="https://img.shields.io/github/forks/birdflop/web?style=for-the-badge"></a>

<a href="https://discord.com/invite/nmgtX5z"> <img src="https://discord.com/api/guilds/746125698644705524/widget.png?style=banner2"></a>

# Contributing
#### All contributions are welcome. Birdflop is a community-project aiming to support its community.

## Setting up a Local Development Environment
To contribute to RGBirdflop, you'll need to set up a local development environment as your testing ground.

### Prerequisites
- **Node.js** (version 23 or higher)
- **pnpm** package manager

### Steps to Set Up
1. **Clone the Repository**: Fork the Birdflop website repository on GitHub https://github.com/birdflop/web and clone it
2. **Install Dependencies**: Navigate to the project directory and run `pnpm install` to install all necessary dependencies.
3. **Build the Project**: Run `pnpm build.pkg` to build the RGBirdflop package.
4. **Run the Development Server**: Start the development server with `pnpm start`. The website should now be accessible at `http://localhost:5173`.

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
