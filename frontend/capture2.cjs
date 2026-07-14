
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('response', response => {
    if (!response.ok()) console.log('PAGE RESPONSE ERROR:', response.status(), response.url());
  });
  await page.goto('http://localhost:4173');
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on the first 'Gestisci' button
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const gestisciBtn = buttons.find(b => b.textContent.includes('Gestisci'));
    if (gestisciBtn) {
       console.log('Found Gestisci button, clicking...');
       gestisciBtn.click();
    } else {
       console.log('Gestisci button not found');
    }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
