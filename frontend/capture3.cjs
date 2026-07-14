
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:4173');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.menu-item'));
    const mandateBtn = buttons.find(b => b.textContent.includes('Mandati'));
    if (mandateBtn) mandateBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const gestisciBtn = buttons.find(b => b.textContent.includes('Gestisci'));
    if (gestisciBtn) {
       console.log('Found Gestisci button, clicking...');
       gestisciBtn.click();
    } else {
       console.log('Gestisci button still not found');
    }
  });
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
