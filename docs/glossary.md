# Glossary: Developer Terms in Plain English

This glossary explains technical terms you might encounter during setup and development.

---

## A

### API (Application Programming Interface)

A way for different programs to talk to each other. When your website fetches data from somewhere else, it's using an API.

**Example:** Your website calls the weather API to show today's forecast.

### API Key / API Token

A secret password that proves your website has permission to use a service.

**Important:** Keep these secret. Never share them publicly or commit them to GitHub.

---

## B

### Backend

The "behind the scenes" part of your website that users don't see. Handles things like databases, authentication, and processing.

**Opposite of:** Frontend (what users see and interact with)

### Branch

A separate version of your code. Like a "save point" you can experiment with.

**Main branch:** The primary version that becomes your live website.

### Build

The process of converting your source code into files that can run on a server.

**Example:** `npm run build` creates production-ready files from your React code.

---

## C

### Cache / Caching

Storing a copy of data so you don't have to fetch it again. Makes things faster.

**Example:** Caching API responses so you don't call the API every time.

### CI/CD (Continuous Integration / Continuous Deployment)

Automatic testing and deployment. When you push code to GitHub, it automatically goes live.

### Client-side Rendering

When your website runs in the visitor's browser. The browser downloads your code, then builds the page.

**This template uses client-side rendering** - simpler to understand, great for apps and dashboards.

**Opposite of:** Server-side rendering (where the server builds the page first)

Automatic testing and deployment. When you push code to GitHub, it automatically goes live.

### CLI (Command Line Interface)

A text-based way to interact with your computer. The terminal or command prompt.

### Commit

A saved snapshot of your code changes, with a message describing what you changed.

**Example:** `git commit -m "Add contact form"`

### Credentials

Secret information (like API keys and passwords) that prove you have permission to access something.

---

## D

### Database

Organised storage for your website's data. Like a very sophisticated spreadsheet.

### Deploy / Deployment

Copying your code to a server so people can visit your website.

### Dependencies

Other people's code that your project uses. Installed via `npm install`.

### Dev / Development

The process of writing and testing code, or a non-live version of your website.

**Development server:** A version running on your computer for testing.

### DNS (Domain Name System)

Translates website names (like example.com) into IP addresses that computers understand.

---

## E

### Edge

Servers located close to users around the world. Cloudflare Workers run "at the edge" for faster response times.

### Environment Variables

Settings stored outside your code, often containing secrets. Examples: `.env`, `.dev.vars`.

---

## F

### Frontend

The part of your website users see and interact with. HTML, CSS, JavaScript, React.

---

## G

### Git

A system for tracking changes to your code over time.

### GitHub

A website for storing and sharing code using Git. Also hosts your code and can deploy your website.

### GitHub Actions

GitHub's system for running automatic tasks when you push code. Often used for testing and deployment.

---

## H

### HTTPS

Secure web browsing. The padlock icon in your browser. All Cloudflare sites get this automatically.

---

## K

### Kebab-case

Naming style using hyphens: `my-project-name`. Common for URLs and file names.

### Key-Value Store (KV)

Simple database storing pairs: a name (key) and its value. Fast for reading, slower for writing.

---

## L

### Localhost

Your own computer. `localhost:5173` means a website running on your machine at port 5173.

---

## M

### Main Branch

The primary version of your code. Changes here become your live website (if CI/CD is enabled).

---

## N

### Node.js

A program that runs JavaScript outside a web browser. Used for building and running your website.

### npm (Node Package Manager)

Tool for installing JavaScript libraries and running project commands.

**Common commands:**

- `npm install` - download dependencies
- `npm run dev` - start development server
- `npm run build` - create production files

---

## P

### Package

A reusable piece of code someone else wrote. Installed via npm.

### Production

The live version of your website that real users visit.

### Push

Upload your code changes to GitHub.

**Example:** `git push origin main`

---

## R

### Repository (Repo)

A folder containing your project's code, tracked by Git. Usually stored on GitHub.

### Route / Routing

How your website decides what to show for different URLs.

**Example:** `/about` shows the about page, `/contact` shows the contact form.

---

## S

### Secret

Sensitive information (passwords, API keys) that shouldn't be in your code or public.

### Server

A computer that runs your website and responds to visitors.

### Serverless

You don't manage the server - Cloudflare handles it. Your code just runs when needed.

### Server-side Rendering (SSR)

When the server builds your web page before sending it to the browser. Provides faster indexing, working social media previews, and better performance scores - but adds complexity.

**Used by:** React Router v7, TanStack Start, Next.js

**Opposite of:** Client-side rendering (what this template uses)

### SPA (Single Page Application)

A website that loads once and updates without refreshing the whole page. This template creates an SPA.

**How it works:** The browser downloads your app once, then updates parts of the page as needed.

**Example:** Gmail, Twitter, most modern web apps

### SQL

A language for talking to databases. Used by D1.

**Example:** `SELECT * FROM users WHERE country = 'Australia'`

### Static

Content that doesn't change based on who's viewing it. HTML files, images, CSS.

**Opposite of:** Dynamic (changes based on user, time, etc.)

---

## T

### Terminal

The text-based interface where you type commands. Also called command line, console, or shell.

### Token

See "API Token" above.

### TypeScript

JavaScript with added type checking. Catches errors before your code runs.

---

## U

### URL (Uniform Resource Locator)

A web address. `https://example.com/about`

---

## W

### Worker (Cloudflare Worker)

Cloudflare's serverless code execution. Runs your backend code at the edge.

### Wrangler

Cloudflare's CLI tool for managing Workers. Used for deployment and local development.

---

## Y

### YAML

A file format for configuration. Used in GitHub Actions workflows.

**Example:** `.github/workflows/deploy.yml`

---

## Common File Names

| File | What it's for |
|------|---------------|
| `package.json` | Project settings and dependencies |
| `wrangler.jsonc` | Cloudflare Worker configuration |
| `.env` | Local environment variables (secrets) |
| `.dev.vars` | Local secrets for Cloudflare development |
| `tsconfig.json` | TypeScript configuration |
| `.gitignore` | Files Git should ignore (not upload) |

---

## Common Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Download all project dependencies |
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run deploy` | Deploy to Cloudflare |
| `git status` | See what files have changed |
| `git add .` | Stage all changes for commit |
| `git commit -m "message"` | Save changes with a description |
| `git push` | Upload changes to GitHub |

---

## Need More Help?

If you encounter a term not listed here, try:

1. Asking Claude: "What does [term] mean?"
2. Searching the Cloudflare documentation
3. Using the `/help` command
