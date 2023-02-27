<img width="400" src="https://www.simplymc.art/images/full.png" alt="SimplyMC">
<a href="https://www.simplymc.art/">SimplyMC</a> is a Minecraft multitool for developers, server owners and players.
<br><br>
💖 Consider donating if we helped you:<br>
<a href="https://ko-fi.com/N4N550HUP"> <img src="https://ko-fi.com/img/githubbutton_sm.svg"></a>
<br><br>
<a href="https://discord.simplymc.art/"> <img src="https://img.shields.io/discord/1017694167155093554"></a>
<a href="https://github.com/AkiraDevelopment/SimplyMC/commits"> <img src="https://img.shields.io/github/last-commit/AkiraDevelopment/SimplyMC"></a>
<a href="#"> <img src="https://img.shields.io/github/languages/code-size/AkiraDevelopment/SimplyMC"></a>
<a href="https://github.com/AkiraDevelopment/SimplyMC/watchers"> <img src="https://img.shields.io/github/watchers/AkiraDevelopment/SimplyMC"></a>
<a href="https://github.com/AkiraDevelopment/SimplyMC/stargazers"> <img src="https://img.shields.io/github/stars/AkiraDevelopment/SimplyMC"></a>
<a href="https://github.com/AkiraDevelopment/SimplyMC/network/members"> <img src="https://img.shields.io/github/forks/AkiraDevelopment/SimplyMC"></a>

<h2>Contributing</h2>
If you would like to contribute please make sure your code works as intended and formatted properly.
<br><br>
<h2>Forking</h2>
If you are hosting this site or a single page from this site for your server or own project, please credit the original in some way. A link to the original GitHub is sufficient. <3
<br><br>
<a href="https://github.com/AkiraDevelopment/SimplyMC/graphs/contributors"><img src="https://contrib.rocks/image?repo=AkiraDevelopment/SimplyMC"></a>
<br><br>
<img src="https://estruyf-github.azurewebsites.net/api/VisitorHit?user=oli-idk&repo=SimplyMC&countColor=%237B1E7A"/>

## Cloudflare Pages

Cloudflare's [wrangler](https://github.com/cloudflare/wrangler) CLI can be used to preview a production build locally. To start a local server, run:

```
pnpm serve
```

Then visit [http://localhost:8787/](http://localhost:8787/)

### Deployments

[Cloudflare Pages](https://pages.cloudflare.com/) are deployable through their [Git provider integrations](https://developers.cloudflare.com/pages/platform/git-integration/).

If you don't already have an account, then [create a Cloudflare account here](https://dash.cloudflare.com/sign-up/pages). Next go to your dashboard and follow the [Cloudflare Pages deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/).

Within the projects "Settings" for "Build and deployments", the "Build command" should be `pnpm build`, and the "Build output directory" should be set to `dist`.

### Function Invocation Routes

Cloudflare Page's [function-invocation-routes config](https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes) can be used to include, or exclude, certain paths to be used by the worker functions. Having a `_routes.json` file gives developers more granular control over when your Function is invoked.
This is useful to determine if a page response should be Server-Side Rendered (SSR) or if the response should use a static-site generated (SSG) `index.html` file.

By default, the Cloudflare pages adaptor _does not_ include a `public/_routes.json` config, but rather it is auto-generated from the build by the Cloudflare adaptor. An example of an auto-generate `dist/_routes.json` would be:

```
{
  "include": [
    "/*"
  ],
  "exclude": [
    "/_headers",
    "/_redirects",
    "/build/*",
    "/favicon.ico",
    "/manifest.json",
    "/service-worker.js",
    "/about"
  ],
  "version": 1
}
```

In the above example, it's saying _all_ pages should be SSR'd. However, the root static files such as `/favicon.ico` and any static assets in `/build/*` should be excluded from the Functions, and instead treated as a static file.

In most cases the generated `dist/_routes.json` file is ideal. However, if you need more granular control over each path, you can instead provide you're own `public/_routes.json` file. When the project provides its own `public/_routes.json` file, then the Cloudflare adaptor will not auto-generate the routes config and instead use the committed one within the `public` directory.
