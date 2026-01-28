# Choosing How to Deploy Your Website

When you make changes to your website, those changes need to go "live" so visitors can see them. This is called **deployment**.

Think of it like this: your code lives on your computer, but for people to visit your website, the code needs to be copied to Cloudflare's servers around the world.

## Your Options

### Option 1: Automatic Updates (Recommended)

**How it works:**

1. You make changes to your code
2. You save those changes to GitHub (like saving to the cloud)
3. Your website automatically updates - no extra steps needed

**This is called "CI/CD" or "Continuous Deployment"** - fancy terms that just mean "automatic updates".

**Best for:**

- Most projects
- Teams working together
- Anyone who wants a "set it and forget it" approach

**What you'll need:**

- A GitHub account (free)
- To add some secret codes (credentials) to GitHub once during setup

### Option 2: Manual Updates

**How it works:**

1. You make changes to your code
2. You run a command in your terminal: `npm run deploy`
3. Your website updates

**Best for:**

- Learning how deployment works
- Testing changes before making them public
- Projects where you want full control over when updates go live

**What you'll need:**

- Cloudflare credentials saved on your computer

### Option 3: Both Methods

**How it works:**

- Automatic updates are enabled (so pushing to GitHub deploys)
- You can also run `npm run deploy` manually when needed

**Best for:**

- Maximum flexibility
- Testing locally before pushing to GitHub
- Having a backup way to deploy if needed

## Which Should I Choose?

| If you... | Choose... |
|-----------|-----------|
| Are new to all this | **Automatic** - fewer steps once set up |
| Want the simplest ongoing experience | **Automatic** |
| Want to understand each step | **Manual** |
| Are working with a team | **Automatic** |
| Want maximum flexibility | **Both** |

## Glossary

| Term | Plain English |
|------|---------------|
| Deploy | Copy your code to Cloudflare so visitors can see your website |
| CI/CD | Automatic deployment - your website updates when you save to GitHub |
| GitHub Actions | GitHub's system for running automatic tasks (like deployment) |
| Push | Upload your code changes to GitHub |
| Main branch | The primary version of your code that becomes your live website |

## Can I Change This Later?

Yes! You can always:

- Add automatic deployment later if you started with manual
- Disable automatic deployment if you want to switch to manual
- The `/start` wizard can help you set up either approach

## Still Have Questions?

During the `/start` wizard, you can always choose "Help me understand" for more detailed explanations of any option.
