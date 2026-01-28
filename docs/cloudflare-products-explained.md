# Understanding Cloudflare Products

This guide explains Cloudflare's developer products in plain English. Use this to understand what each product does and whether you need it.

## How This Template Works

Before diving into products, it helps to understand how this template is structured:

**Your website has two parts:**

1. **The React app** - This is what visitors see and interact with. It runs in their browser.
2. **The Worker** - This handles "behind the scenes" tasks like saving data, talking to databases, or calling AI services. It runs on Cloudflare's servers.

When someone visits your website:
1. Their browser downloads your React app
2. The React app runs in their browser
3. When the app needs data (like submitting a form), it asks the Worker
4. The Worker does the work and sends back the answer

This is called a "client-side" architecture - the browser (client) does the rendering. It's simpler to understand than "server-side" alternatives where the server generates the pages.

> 💡 **Why does this matter?** If SEO is a priority (blogs, marketing sites), a "server-side" template like React Router v7 gives you faster indexing and working social media previews. For dashboards, apps, and tools behind a login, this template's simpler architecture is a better fit.

---

## The Basics

When you build a website, you might need:

1. **Something to run your code** (like a server)
2. **Somewhere to store data** (like a database)
3. **Somewhere to store files** (like images users upload)

Cloudflare offers products for each of these needs. All have generous free tiers.

---

## Workers (Compute) - Included by Default

**What it is:** A place to run your code, like a server - but better because it runs in 300+ locations worldwide, close to your visitors.

**In plain English:** When someone visits your website and clicks a button that needs to "do something" (like submit a form or fetch data), Workers handles that.

**Free tier:**

- 100,000 requests per day
- Plenty for most personal projects and small businesses

**You already have this.** It's included with this template - no extra setup needed.

---

## KV (Key-Value Store)

**What it is:** Simple storage for small pieces of data that don't change often.

**In plain English:** Think of it like a dictionary or lookup table. You store something with a name (key), and you can quickly look it up later using that name.

**Good for:**

- **User sessions** - remembering who's logged in
- **Caching** - storing API responses so you don't fetch them repeatedly
- **Feature flags** - "show the new design to 10% of users"
- **Rate limiting** - "this user has made 5 requests today"

**Not good for:**

- Complex queries like "find all users in Australia"
- Data that changes constantly
- Large files

**Free tier:**

- 100,000 reads per day
- 1,000 writes per day
- 1 GB storage

**You probably need this if:** Your website has user logins or you want to remember things between visits.

---

## D1 (SQL Database)

**What it is:** A proper database for structured data. Uses SQL, the most common database language.

**In plain English:** A spreadsheet on steroids. You can store rows of data (like a list of users or products) and ask complex questions like "show me all orders over $50 from last week".

**Good for:**

- **User accounts** - storing usernames, emails, preferences
- **Content** - blog posts, comments, products
- **Orders and transactions** - e-commerce, bookings
- **Anything with relationships** - "this user has these orders"

**Not good for:**

- Storing files (use R2 instead)
- Temporary data that expires (use KV instead)

**Free tier:**

- 5 million rows read per day
- 100,000 rows written per day
- 5 GB storage

**You probably need this if:** Users will create accounts, submit content, or you need to store and query structured data.

---

## R2 (Object Storage)

**What it is:** Storage for files of any size - images, videos, documents, PDFs.

**In plain English:** Like Dropbox or Google Drive, but for your website. Users can upload files and your website can serve them.

**Important distinction:**

- Your website's own images (logo, hero images, icons) are already served by your static build - you don't need R2 for those
- R2 is for files that **users upload** or that **change over time**

**Good for:**

- **User uploads** - profile pictures, documents
- **E-commerce** - product images uploaded by sellers
- **File sharing** - "download this PDF"
- **Media** - videos, podcasts, large files

**Not good for:**

- Your website's static images (already handled)
- Small amounts of text data (use D1 or KV)

**Free tier:**

- 10 GB storage per month
- 1 million writes per month
- 10 million reads per month
- **Zero egress fees** - data transfer out is always free

**You probably need this if:** Users will upload files to your website.

---

## Quick Decision Guide

### "I'm building a portfolio or marketing website"

**You need:** Workers only (already included)

No database, no file storage. Just a website that shows information.

### "I'm building a website with a contact form"

**You need:** Workers + D1

The form submissions need to be stored somewhere. D1 is perfect for this.

### "I'm building a website where users create accounts"

**You need:** Workers + D1 + KV

- D1 stores user accounts and their data
- KV stores login sessions (who's currently logged in)

### "I'm building a website where users upload files"

**You need:** Workers + D1 + R2

- D1 stores information about the files (who uploaded it, when, etc.)
- R2 stores the actual files

### "I'm not sure yet"

**Start with:** Workers only

You can add D1, KV, or R2 later using the `/add-binding` command. It's easy to add what you need when you need it.

---

## Comparison Table

| Product | Best For | Free Tier | Think of it as... |
|---------|----------|-----------|-------------------|
| Workers | Running code | 100k requests/day | Your server |
| KV | Sessions, caching | 100k reads/day | A dictionary |
| D1 | User data, content | 5M rows read/day | A spreadsheet |
| R2 | User uploads | 10 GB storage | Dropbox for your app |

---

## Can I Add Products Later?

Absolutely! You don't need to decide everything upfront.

- Start simple with just Workers
- Use `/add-binding` when you need storage
- The wizard will help you set up each product

It's much easier to add features when you know you need them than to set up everything "just in case".

---

## Pricing Beyond Free Tier

All products have generous free tiers. If you grow beyond them:

- **Workers:** $5/month for 10 million requests
- **KV:** Included with Workers paid plan
- **D1:** $0.75 per million reads beyond free tier
- **R2:** $0.015 per GB stored beyond free tier

Most small-to-medium projects never exceed the free tiers.

---

## Still Confused?

During the `/start` wizard, choose the option that describes what you're building (like "portfolio" or "app with user accounts"), and we'll set up the right products for you automatically.
