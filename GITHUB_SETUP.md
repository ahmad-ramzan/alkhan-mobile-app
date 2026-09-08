# GitHub Setup Guide 🚀

This guide will help you push your AlKhan Restaurant Expo App to GitHub.

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and log in
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Fill in the details:
   - **Repository name**: `alkhan-restaurant-app` (or any name you prefer)
   - **Description**: `AlKhan Restaurant - Cross-platform ordering app built with Expo`
   - **Public/Private**: Choose public to share with others
   - **Initialize repository**: Leave unchecked (we already have code)
5. Click **Create repository**

## Step 2: Initialize Git Locally

Open PowerShell and navigate to your project:

```powershell
cd C:\Users\DELL\Desktop\TodoApp
```

Check if git is already initialized:

```powershell
git status
```

If you get an error, initialize git:

```powershell
git init
```

## Step 3: Configure Git

Set your name and email:

```powershell
git config user.name "Your Full Name"
git config user.email "your-email@example.com"
```

## Step 4: Add All Files

Add all project files to git:

```powershell
git add .
```

Verify what will be committed:

```powershell
git status
```

## Step 5: Create Initial Commit

```powershell
git commit -m "Initial commit: AlKhan Restaurant Expo App with 6 screens

- Menu screen with dishes and categories
- Item detail with customization options
- Cart and checkout flow
- Live order tracking
- Table reservation system
- Branch directory
- Dark theme with Expo Router"
```

## Step 6: Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

Verify the remote was added:

```powershell
git remote -v
```

## Step 7: Rename Default Branch (if needed)

```powershell
git branch -M main
```

## Step 8: Push to GitHub

```powershell
git push -u origin main
```

If you're pushing for the first time, you may be asked to authenticate. Use your GitHub Personal Access Token or password.

## Alternative: Using GitHub CLI

If you have GitHub CLI installed, you can use this shortcut:

```powershell
gh repo create alkhan-restaurant-app --source=. --public --push
```

## Verify Upload

1. Go to your GitHub repository URL
2. Verify all files are there
3. Check the commit history

## Add .gitignore (if not already configured)

Your `.gitignore` should already exclude:

```
node_modules/
.expo/
.vscode/
.env
.DS_Store
```

## Future Updates

After making changes locally:

```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

## Troubleshooting

### "fatal: not a git repository"
- Run `git init` first, then continue from Step 3

### "fatal: Could not read from remote repository"
- Check your GitHub username and repository name are correct
- Make sure you have internet connection
- Verify your GitHub credentials/token

### "Branch 'main' does not have upstream tracking information"
- Run: `git push -u origin main`

### Large Files Error
- Your `node_modules/` might be included. Make sure it's in `.gitignore`
- Run: `git rm -r --cached node_modules`

## Next Steps

After pushing to GitHub:

1. **Add a License**: Your project already has a LICENSE file
2. **Add GitHub Actions**: Create CI/CD workflows for testing
3. **Add Contributing Guide**: Create CONTRIBUTING.md for collaborators
4. **Enable GitHub Pages**: For hosting documentation
5. **Add Topics**: Add tags like `expo`, `react-native`, `restaurant-app`

## Questions?

- [GitHub Docs](https://docs.github.com)
- [Git Documentation](https://git-scm.com/doc)
- [Expo Docs](https://docs.expo.dev)
