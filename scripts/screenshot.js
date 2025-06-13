 Basic Screenshot Capture
const page = await browser.newPage();
await page.goto('httpsexample.com');
await page.screenshot({ 
    path '.outputcustom-screenshot.png',
    fullPage true 
});
console.log('Screenshot saved successfully!');
await page.close();