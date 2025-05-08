import { chromium, firefox } from 'playwright';
import fs from 'fs';
import path from 'path';

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const browsers = [
  { name: 'chromium', launcher: chromium },
  { name: 'firefox', launcher: firefox },
];

const pagesConfig = JSON.parse(fs.readFileSync('./config/pages.json', 'utf-8'));
const authConfig = JSON.parse(fs.readFileSync('./config/auth.json', 'utf-8'));
const { pages, baseUrl } = pagesConfig;

const storageFilePath = path.join('auth', 'storageState.json');

// Clean up previous auth state
if (fs.existsSync(storageFilePath)) {
  fs.unlinkSync(storageFilePath);
  console.log(`🧹 Deleted existing auth file: ${storageFilePath}`);
}

async function loginAndSaveStorageState(browser) {
  console.log(`🔐 Logging in to ${baseUrl}${authConfig.loginPath}...`);
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${baseUrl}${authConfig.loginPath}`, { waitUntil: 'networkidle' });

  await page.fill(authConfig.usernameSelector, authConfig.username);
  await page.fill(authConfig.passwordSelector, authConfig.password);
  await page.click(authConfig.submitSelector);
  await page.waitForLoadState('networkidle');

  await context.storageState({ path: storageFilePath });
  await context.close();
  console.log("✅ Login successful. Storage state saved.\n");
}

(async () => {
  try {
    console.log("🚀 Starting Snapshotter...\n");
    fs.mkdirSync('screenshots', { recursive: true });

    const needsAuth = pages.some(p => p.auth);
    if (needsAuth && !fs.existsSync(storageFilePath)) {
      const tempBrowser = await chromium.launch();
      await loginAndSaveStorageState(tempBrowser);
      await tempBrowser.close();
    }

    const savedStorage = needsAuth
      ? JSON.parse(fs.readFileSync(storageFilePath, 'utf-8'))
      : null;

    for (const { name: browserName, launcher } of browsers) {
      console.log(`🌐 Launching ${browserName}...`);
      const browser = await launcher.launch();

      for (const { name: viewportName, ...viewport } of viewports) {
        for (const { path: pagePath, auth } of pages) {
          const context = await browser.newContext({ viewport });
          if (auth && savedStorage) {
            await context.addCookies(savedStorage.cookies);
          }

          const page = await context.newPage();
          const url = `${baseUrl}${pagePath}`;
          await page.goto(url, { waitUntil: 'networkidle' });

          const safePath = pagePath.replace(/\//g, '_') || 'home';
          const fileName = path.join(
            'screenshots',
            `${browserName}_${viewportName}_${safePath}.png`
          );

          await page.screenshot({ path: fileName, fullPage: true });
          console.log(`📸 Captured: ${fileName}`);

          await context.close();
        }
      }

      await browser.close();
      console.log(`✅ Done with ${browserName}\n`);
    }

    console.log("🎉 All screenshots captured.");
  } catch (err) {
    console.error("❌ Error occurred:", err);
  }
})();
