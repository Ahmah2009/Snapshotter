# Snapshotter 📸

Snapshotter is a Playwright-based automation tool to capture screenshots of multiple pages across different browsers and viewports. Useful for visual testing and UI consistency checks.

## ✅ Features

- Multiple browsers: Chromium, Firefox
- Responsive viewports: desktop, tablet, mobile
- Page-level auth support
- Config-driven: JSON for routes, auth, env for credentials
- Automatically saves screenshots into `/screenshots`

## 📦 Installation

```bash
git clone https://github.com/ahmah2009/Snapshotter.git
cd Snapshotter
npm install
```

## ⚙️ Configuration

### `config/pages.json`
Define pages and auth requirement:

```json
{
  "baseUrl": "https://yourdomain.com",
  "pages": [
    { "path": "/", "auth": false },
    { "path": "/dashboard", "auth": true }
  ]
}
```

### `config/auth.json`
Optional selectors and credentials:

```json
{
  "username": "yourUsername",
  "password": "yourPassword",
  "usernameSelector": "#username",
  "passwordSelector": "#password",
  "submitSelector": "button[type=submit]",
  "loginPath": "/login"
}
```

## 🚀 Run the Script

```bash
npm start
```

Screenshots are saved to `screenshots/`.

