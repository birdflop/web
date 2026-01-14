---
title: Hytale Server Setup
date_created: 05-06-2025
last_updated: 05-06-2025
description: How to set up a Hytale server
author: Oli/bwmp
contributors:
  - bwmp
---

# Introduction

This guide will help you get a Hytale server up and running with birdflop!

## Prerequisites

Before you begin, ensure you have the following:

- **A birdflop server** — [Get one here](/plans)
- **A Hytale account** — Required to download server files and run the game in online mode ([Sign up here](https://store.hytale.com/))

## Setting Up Your Hytale Server

### Step 1: Switch Your Server to Hytale

1. Log in to your birdflop control panel
2. Navigate to the **Settings** tab of your server
3. Click the **Change Egg** button
4. From the list of available eggs, select **Hytale**
5. Enable **Reinstall server** & **Wipe Server Files**
6. Click **Change Egg** to confirm

### Step 2: Start Your Server for the First Time

1. Go to the **Console** tab of your server
2. Click the **Start** button to power on your server
3. On first run, you will be prompted to click a link to authenticate your Hytale account
4. Click the link and log in with your Hytale account credentials
5. After logging in, the server will automatically download the necessary files and start up

### Step 3: Configure Authentication

1. Once the server has fully started, you will see a message: `No server tokens configured. Use /auth login to authenticate.`
2. In the console, type:
   ```
   /auth login device
   ```
3. Click the second link that contains the device code
4. Once authorized, run the final command to save your authentication:
   ```
   /auth persistence Encrypted
   ```
   > **Note:** This will save your authentication for future restarts.

5. Restart your server by clicking the **Restart** button in the control panel

🎉 **Your server is now fully set up and ready to play!**