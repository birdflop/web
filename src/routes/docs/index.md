---
title: Overview
date_created: 05-06-2025
last_updated: 05-06-2025
author: bwmp
description: Overview of the documentation
contributors:
  - bwmp
---

# Introduction

Welcome to birdflop's documentation!

This part of the website will help you understand how do to things such as:

- Using the panel
- Using our tools
- Running a server
- and other frequently asked questions

---

# Contributing

## Option #1:

You can contribute to the docs by forking our repo and making a pull request with your changes. This is the preferred method of contributing to the docs.

1. Fork the [birdflop repo](https://github.com/birdflop/web).
2. Clone your forked repo to your local machine.
3. Create a new folder in src/routes/docs/category with the name of the page you want to create. (e.g. `src/routes/docs/server_setup/changing_MOTD`).
4. create a new file in that folder named index.mdx.
5. once you have made your changes, commit and push them to your forked repo.
6. Create a pull request to the main repo with your changes.
7. Once your pull request is merged, your changes will be live on the website.

---

## Option #2:

You can also contribute by writing a documentation page in whatever format you're comfortable with and sending it to us through a ticket in our [Discord](https://discord.gg/nmgtX5z). Doing this will allow us to format it and add it to the website. This is a good option for users who are unfamiliar with GitHub or who want to contribute without forking the repo.

---

## Option #3:

You can also contribute to the docs by creating an issue on our GitHub repo either suggesting a change or asking for a page to be added. This is a good option if you don't want to fork the repo or if you have a small change that doesn't require a full page.

1. Go to the [birdflop repo](https://github.com/birdflop/web).
2. Click on the "Issues" tab.
3. Click on the "New Issue" button.
4. Fill out the issue template with your changes.
5. Click on the "Submit new issue" button.

---

## Page Structure

```yaml
---
title: Page Title
description: Page description
last_updated: MM-DD-YYYY (current date)
date_created: MM-DD-YYYY (current date)
author: Your Name
contributors: [Contributor 1, Contributor 2] # add your github username here
---
The rest of the page content goes here.
```

For example, if you want to look at the structure of this page you can check the source code [here](https://github.com/birdflop/web/tree/birdflop/src/routes/docs/index.mdx).
