import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  // find first hotel card
  await page.waitForSelector('.group.cursor-pointer', { timeout: 5000 }).catch(() => {});
  try {
    await page.click('.group.cursor-pointer');
    console.log('Clicked hotel card');
  } catch (e) {
    console.log('Could not click hotel card');
  }
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
