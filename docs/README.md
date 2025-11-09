# Promotional Website Documentation

This directory contains the promotional landing page for the Cloudflare Workers + React Boilerplate template, served via GitHub Pages.

## 📂 Directory Structure

```
/docs/
├── index.html          # Main landing page
├── 404.html            # Custom 404 error page
├── .nojekyll           # Disables Jekyll processing on GitHub Pages
├── css/
│   └── main.css       # All styles (gradients, responsive, animations)
├── js/
│   └── main.js        # Smooth scrolling and animations
└── README.md          # This file
```

## 🌐 Live Website

After enabling GitHub Pages, the site will be available at:

**https://henkisdabro.github.io/cloudflare-workers-react-boilerplate/**

## 🚀 Enabling GitHub Pages

Follow these steps to publish the website:

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** (in the top menu)
3. Scroll down to the **Pages** section in the left sidebar

### 2. Configure Source

1. Under **Source**, select **Deploy from a branch**
2. Set **Branch** to `main`
3. Set **Folder** to `/docs`
4. Click **Save**

### 3. Wait for Deployment

- GitHub will automatically build and deploy your site
- This typically takes 1-2 minutes
- You'll see a green checkmark when deployment is complete
- The live URL will be displayed at the top of the Pages section

### 4. Optional: Enable HTTPS

1. In the same Pages section, scroll down
2. Check **Enforce HTTPS** (recommended)
3. Save changes

## ✏️ Editing the Website

The website uses pure HTML, CSS, and JavaScript with **no build process**. Simply edit the files and push to GitHub - the changes will be live within minutes.

### Editing Content (index.html)

To update text content, headings, or structure:

1. Open `docs/index.html` in your editor
2. Find the section you want to edit (sections are clearly commented)
3. Modify the HTML content
4. Save the file
5. Commit and push to GitHub

**Example: Changing the hero title**

```html
<!-- Find this in index.html -->
<h1 class="hero-title">Cloudflare Workers + React Boilerplate</h1>

<!-- Change to: -->
<h1 class="hero-title">Your New Title Here</h1>
```

### Editing Styles (css/main.css)

The CSS uses custom properties (CSS variables) for easy theming:

1. Open `docs/css/main.css`
2. Modify variables in the `:root` section at the top
3. Save and push

**Example: Changing colours**

```css
/* Find these variables in main.css */
:root {
    --colour-cloudflare: #F38020;   /* Change primary colour */
    --colour-react: #61DAFB;        /* Change accent colour */
    --colour-claude: #5436DA;       /* Change secondary colour */
}
```

### Editing Behaviour (js/main.js)

To modify animations or interactions:

1. Open `docs/js/main.js`
2. Modify the relevant function
3. Save and push

All JavaScript is vanilla (no frameworks), making it easy to understand and modify.

## 🎨 Design System

### Colour Palette

The website uses a gradient theme based on the technology stack:

- **Cloudflare Orange**: `#F38020` - Primary CTA buttons
- **React Blue**: `#61DAFB` - Accents and highlights
- **Claude Purple**: `#5436DA` - Secondary elements
- **Gradient**: `linear-gradient(135deg, #F38020 0%, #61DAFB 50%, #5436DA 100%)`

### Typography

- **Font Family**: System font stack (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif`)
- **Headings**: Bold, tight line-height
- **Body**: 16px base size, 1.5 line-height

### Spacing

- **Small**: 0.5rem (8px)
- **Medium**: 1.5rem (24px)
- **Large**: 2rem (32px)
- **Extra Large**: 4rem (64px)

All spacing uses CSS custom properties (`var(--spacing-md)`), making it easy to adjust globally.

## 📱 Responsive Design

The website is fully responsive with breakpoints at:

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px - 1400px+

All sections adapt automatically using CSS Grid and Flexbox.

## ♿ Accessibility Features

The site includes:

- ✅ Semantic HTML5 elements (`<main>`, `<section>`, `<article>`)
- ✅ ARIA labels for interactive elements
- ✅ Skip-to-content link for keyboard navigation
- ✅ Sufficient colour contrast (WCAG AA compliant)
- ✅ Focus visible states for keyboard users
- ✅ Responsive font sizes (minimum 16px)

## 🔍 SEO Optimisation

Included meta tags:

- ✅ Title and description
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Canonical URL
- ✅ Language declaration (`lang="en-GB"`)

## 🚨 Important Notes

### British English Spelling

All content uses **British English** spelling:

- ✅ colour (not color)
- ✅ optimise (not optimize)
- ✅ analyse (not analyze)

Maintain this convention when editing content.

### Relative Paths

All asset paths are **relative** (not absolute):

```html
✅ <link href="css/main.css">
❌ <link href="/css/main.css">
```

This ensures the site works correctly on GitHub Pages.

### .nojekyll File

The `.nojekyll` file **must remain** in the `/docs` directory. It prevents GitHub Pages from processing the site with Jekyll, which would break custom folder structures.

## 🧪 Testing Locally

To test the website locally before pushing:

### Option 1: Python

```bash
cd docs
python3 -m http.server 8000
# Visit http://localhost:8000
```

### Option 2: Node.js (npx)

```bash
cd docs
npx serve
# Visit http://localhost:3000
```

### Option 3: VS Code Extension

Install "Live Server" extension and right-click `index.html` → "Open with Live Server"

## 📝 Making Changes

### Standard Workflow

```bash
# 1. Edit files in /docs directory
nano docs/index.html

# 2. Test locally (optional)
cd docs && python3 -m http.server 8000

# 3. Commit changes
git add docs/
git commit -m "Update promotional website content"

# 4. Push to GitHub
git push origin main

# 5. Wait 1-2 minutes for GitHub Pages to update
# Visit https://henkisdabro.github.io/cloudflare-workers-react-boilerplate/
```

### Quick Edit via GitHub Web Interface

For small text changes:

1. Navigate to `docs/index.html` on GitHub
2. Click the **pencil icon** (Edit this file)
3. Make your changes
4. Scroll down and click **Commit changes**
5. GitHub Pages will automatically update

## 🔗 Important Links

- **Live Site**: https://henkisdabro.github.io/cloudflare-workers-react-boilerplate/
- **Repository**: https://github.com/henkisdabro/cloudflare-workers-react-boilerplate
- **GitHub Pages Settings**: Repository → Settings → Pages

## 🐛 Troubleshooting

### Site Not Updating After Push

1. Check GitHub Actions tab - deployment may be in progress
2. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
3. Clear browser cache
4. Wait 2-3 minutes for CDN propagation

### 404 Error on GitHub Pages

1. Verify **Settings → Pages** shows `/docs` folder
2. Ensure `index.html` exists in `/docs` directory
3. Check branch is set to `main`

### CSS/JS Not Loading

1. Verify paths are **relative** (not absolute)
2. Check file names are **lowercase** and match exactly
3. Ensure files are committed and pushed

### Changes Not Visible

1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Try incognito/private browsing window
3. Add cache-busting query parameter: `main.css?v=2`

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Cloudflare Workers Docs](https://workers.cloudflare.com/)
- [React Documentation](https://react.dev/)
- [Claude Code](https://claude.com/claude-code)

## 📄 License

This promotional website is part of the Cloudflare Workers + React Boilerplate template, licensed under the MIT License.
