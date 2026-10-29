# 🚀 నేటిభారతం (Neti Bharatam) — Hostinger Deployment Guide
### Complete Step-by-Step Instructions & Supporting Files for Hostinger Hosting

This document provides complete, production-tested instructions for uploading and running your **నేటిభారతం (Neti Bharatam)** news portal on Hostinger (Shared Web Hosting, Cloud Hosting, WordPress Hosting, or VPS/Node.js).

---

## 📁 1. Supporting Files Provided In This Project

The project now includes all essential files required by Hostinger servers:

| File Name | Purpose | Location in Project |
| :--- | :--- | :--- |
| **`hostinger-dist.zip`** | **Ready-to-upload archive** containing the complete production build, `.htaccess`, PWA files, assets, and sitemap. | `/hostinger-dist.zip` |
| **`.htaccess`** | Handles Single Page App (SPA) URL rewrites, prevents 404 errors on page reload, enables Gzip compression, sets PWA Cache-Control headers, and provides security headers. | `/public/.htaccess` and inside `/dist/.htaccess` |
| **`robots.txt`** | Guides Googlebot and search crawlers while keeping the admin dashboard safe. | `/public/robots.txt` |
| **`sitemap.xml`** | Pre-configured SEO sitemap covering Home, Mandal News, YouTube Bulletins, Reporter Registration, and Private Advertising. | `/public/sitemap.xml` |
| **`server.cjs`** | Production Node/Express server (for users with Hostinger VPS or Hostinger Node.js Web App). | `/server.cjs` |
| **`ecosystem.config.cjs`** | PM2 cluster configuration file for 24/7 background uptime on VPS. | `/ecosystem.config.cjs` |
| **`scripts/create-hostinger-bundle.py`** | Automated script to package the compiled `dist/` directory into `hostinger-dist.zip`. | `/scripts/create-hostinger-bundle.py` |

---

## 🌟 METHOD 1: Hostinger Web / Cloud / Shared Hosting (Most Popular & Easiest)

> **Estimated time:** 3 to 5 minutes  
> **Hostinger Plans:** Single, Premium, Business, Cloud Startup, or Cloud Professional.

### Step 1: Generate or Download the Production Bundle
If you have access to the terminal, run:
```bash
npm run build:hostinger
```
This produces `hostinger-dist.zip` (around 1 MB) in your main project folder.

### Step 2: Open Hostinger hPanel File Manager
1. Log in to your **Hostinger Account** (`hpanel.hostinger.com`).
2. Go to **Websites** and click **Manage** next to your domain name (e.g. `yournewsdomain.com`).
3. In the sidebar or search bar, open **File Manager** (or click **Access files of [your domain]**).
4. Double-click to open the **`public_html`** folder.

### Step 3: Clean up public_html (First-Time Setup)
- If you see a default Hostinger `default.php` or placeholder `index.php`, you can delete it or move it into a backup folder so your news portal opens cleanly.

### Step 4: Upload and Extract `hostinger-dist.zip`
1. Click the **Upload** icon (arrow pointing up) at the top-right of Hostinger File Manager.
2. Select **File**, choose `hostinger-dist.zip` from your computer, and let it upload (takes just a few seconds).
3. Once uploaded, **Right-Click** on `hostinger-dist.zip` and select **Extract**.
4. Choose the extract destination as `.` (or current directory `public_html`) and click **Extract**.
5. Once extracted, verify that the following files are directly inside `public_html`:
   - `index.html`
   - `.htaccess` *(make sure "Show hidden files" is enabled in Hostinger File Manager settings if you don't see dotfiles)*
   - `manifest.webmanifest`
   - `sw.js` and `registerSW.js`
   - `robots.txt`
   - `sitemap.xml`
   - `assets/` folder (containing JS and CSS chunks)
6. You can now delete `hostinger-dist.zip` from `public_html` to save storage.

### Step 5: Verify Your Domain in Hostinger
Open your domain in your browser:
```
https://yourdomain.com
```
Your Neti Bharatam news portal is live! Try clicking on **Mandal News (మండలాల వార్తలు)**, refresh the page, and verify that the page loads instantly without 404 errors (thanks to `.htaccess`).

---

## 🔒 2. CRITICAL: Add Your Domain to Firebase Authorized Domains

Because this portal uses Firebase Firestore for live cloud synchronization and Google Sign-In for Admin authentication, you must authorize your Hostinger domain in Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **`sixth-forest-zf6jr`** (or your custom Firebase project).
3. In the left navigation, go to **Build** → **Authentication**.
4. Click on the **Settings** tab at the top.
5. Click on **Authorized domains** in the submenu.
6. Click **Add domain**.
7. Enter your Hostinger domain without `https://` (for example: `netibharatam.com` or `news.yourdomain.com`).
8. Click **Add**.

*Now Admin Google Login, live news publishing, and reporter verification will work seamlessly on your live domain!*

---

## ⚙️ 3. What Does `.htaccess` Do on Hostinger?

If you ever need to inspect or recreate `.htaccess`, here is the exact configuration that is now installed in your project:

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Serve existing static files & folders directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Redirect all other URLs to index.html for React SPA
  RewriteRule ^ index.html [L]
</IfModule>

# Correct MIME Types for PWA and Modern Web
<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType application/json .json
  AddType image/svg+xml .svg .svgz
  AddType font/woff2 .woff2
  AddType text/javascript .js .mjs
  AddType text/css .css
</IfModule>

# Gzip Compression for Fast Mobile Loading
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript
  AddOutputFilterByType DEFLATE application/javascript application/json image/svg+xml
  AddOutputFilterByType DEFLATE font/woff2 application/manifest+json
</IfModule>

# Cache-Control: Don't cache Service Worker; Cache hashed assets
<IfModule mod_headers.c>
  <FilesMatch "(sw\.js|registerSW\.js|manifest\.webmanifest)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
  </FilesMatch>

  <FilesMatch "\.(js|mjs|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>

  <FilesMatch "index\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
  </FilesMatch>

  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

Options -Indexes
```

---

## 🖥️ 4. METHOD 2: Hostinger VPS or Hostinger Node.js Application

If you have a **Hostinger VPS** (Ubuntu/Debian) or Hostinger's **Node.js Application Manager**:

1. Clone or upload the repository to your VPS directory (e.g. `/var/www/netibharatam`).
2. Install dependencies and build:
   ```bash
   npm install --production=false
   npm run build
   ```
3. Test running the production server:
   ```bash
   npm start
   ```
   *(This starts `server.cjs` on port 3000)*
4. Keep it running 24/7 with PM2:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.cjs
   pm2 save
   pm2 startup
   ```
5. Configure Nginx or Hostinger reverse proxy to forward domain traffic to `http://localhost:3000`.

---

## 📱 5. PWA (Progressive Web App) on Mobile

Because the portal is fully configured as an installable PWA:
- Mobile visitors will automatically see the **"యాప్ ఇన్‌స్టాల్ చేసుకోండి (Install App)"** prompt.
- The web app works offline and caches essential news, icons, and fonts via Workbox Service Worker.
- When added to the Android/iOS home screen, it opens full-screen like a native Google Play app with the Neti Bharatam icon and theme color (`#0B1D3A`).

---

## ❓ Frequently Asked Questions (FAQ)

### Q: Why do I get a 404 Not Found error when refreshing sub-pages?
**A:** This happens if `.htaccess` was not extracted into `public_html`. Ensure `.htaccess` exists in `public_html` and that rewrite rules are active. In Hostinger File Manager, click the gear icon (Settings) and make sure **"Show Hidden Files (dotfiles)"** is turned on.

### Q: Does Google AdSense work on Hostinger?
**A:** Yes! Once your custom domain is approved by Google AdSense, go to the **Admin Dashboard (అడ్మిన్ డాష్‌బోర్డ్)** → **Google AdSense Control** tab in your app, enter your Publisher ID (`ca-pub-XXXXXXXXXXXXX`) and Ad Slot ID, and toggle "Active".

### Q: How do I change the domain in sitemap.xml and robots.txt?
**A:** Open `sitemap.xml` and `robots.txt` in Hostinger File Manager (or in `public/` before running `npm run build:hostinger`) and replace `https://netibharatam.com/` with your actual domain name.
