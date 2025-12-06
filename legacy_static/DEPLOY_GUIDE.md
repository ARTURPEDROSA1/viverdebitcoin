Deploy to Viverdebitcoin.com

This guide will help you push your local project to GitHub and then deploy it to Viverdebitcoin.com using Vercel.

## Prerequisites
- A GitHub account.
- A Vercel account (connected to your GitHub).
- The project files are locally ready (which we just prepared).

## Step 1: Push to GitHub

1.  **Create a New Repository**:
    *   Go to [GitHub.com/new](https://github.com/new).
    *   Name it `viverdebitcoin` (or similar).
    *   **Do NOT** initialize with README, .gitignore, or license (we have local files).
    *   Click "Create repository".

2.  **Push Your Code**:
    *   Copy the commands under "**…or push an existing repository from the command line**". They will look like this:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/viverdebitcoin.git
        git branch -M main
        git push -u origin main
        ```
    *   Paste and run these commands in your terminal **inside the Viverdebitcoin folder**.

## Step 2: Deploy on Vercel

1.  **Import Project**:
    *   Go to [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click "Add New..." -> "Project".
    *   Select "Continue with GitHub".
    *   Find your `viverdebitcoin` repository and click "Import".

2.  **Configure Build**:
    *   Since this is a simple HTML/CSS/JS site, **Vercel will auto-detect everything**. You don't need to change Build Settings.
    *   Click "Deploy".
    *   Wait a moment, and you will get a live URL (e.g., `viverdebitcoin.vercel.app`).

## Step 3: Connect Your Domain

1.  **Add Domain**:
    *   On your Vercel Project Dashboard, click on "Settings" (top menu).
    *   Go to "Domains" (left sidebar).
    *   Enter `viverdebitcoin.com` in the input field and click "Add".

2.  **Update DNS (If needed)**:
    *   **If you bought the domain on Vercel:** It will work automatically.
    *   **If you bought it elsewhere (GoDaddy, Namecheap, etc.):** Vercel will show you nameservers or an A Record/CNAME to add.
        *   Log in to your domain registrar.
        *   Find DNS Settings.
        *   Add the records shown by Vercel (usually a CNAME to `cname.vercel-dns.com` or A record to `76.76.21.21`).

3.  **Wait for Propagation**:
    *   It might take a few minutes to an hour. Once the circles turn green on Vercel, your site is live!
