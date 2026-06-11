# Bodystrands Admin Panel — Setup Guide

The admin panel lives at `/admin` and lets you manage products, edit details, reorder images, upload/delete images, add new products, and toggle products active/inactive. Every save commits directly to GitHub so Vercel auto-deploys within ~1 minute.

---

## 1. Create a GitHub Personal Access Token (PAT)

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. Give it a name like `bodystrands-admin`
4. Set expiration as desired (90 days or no expiration)
5. Under **Scopes**, check `repo` (full control of private repositories)
6. Click **Generate token**
7. Copy the token — you will only see it once. It starts with `ghp_`

---

## 2. Configure Environment Variables

Create or edit `.env.local` at the project root:

```
ADMIN_PASSWORD=your-secret-password-here
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_REPO=BodyStrandEU/bodystrands-website
```

**On Vercel (production):**

1. Go to your Vercel project → Settings → Environment Variables
2. Add each of the three variables above
3. Make sure they apply to **Production** (and Preview if desired)
4. Redeploy after adding them

---

## 3. Access the Admin Panel

- **Local development:** http://localhost:3000/admin
- **Production:** https://www.bodystrands.com/admin

You will be redirected to `/admin/login` automatically. Enter your `ADMIN_PASSWORD` to log in.

---

## What the Admin Panel Can Do

| Feature | How |
|---|---|
| View all products | Dashboard at `/admin/dashboard` |
| Edit a product | Click **Edit** on any product card |
| Add a new product | Click **+ Add New Product** |
| Toggle active/inactive | Click **Deactivate / Activate** on product card |
| Edit name, price, description | Product editor form |
| Reorder images | Drag thumbnails in the image sections |
| Upload new images | Drop files or click the upload zone (jpg, png, webp, mp4, mov) |
| Delete images | Click the × button on any thumbnail |
| Edit specs | Add/remove spec rows in the product editor |

---

## How It Works

- Product data is stored in `data/products.json` in the GitHub repo
- Images are stored in `public/images/products/`
- Every save via the admin panel commits directly to the `main` branch via the GitHub REST API
- Vercel detects the push and deploys automatically (~1 minute)

---

## Security Notes

- The admin panel is protected by an httpOnly cookie set at login
- The cookie contains an HMAC-SHA256 of your password using Node.js built-in crypto — no external auth libraries
- All admin API routes re-validate the cookie on every request
- Never commit `.env.local` to Git (it is already in `.gitignore`)
