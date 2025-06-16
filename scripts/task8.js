await new Promise((resolve) => setTimeout(resolve, 9000)); //pause 9 seconds
Basic Screenshot Capture
const page = await browser.newPage();
await page.goto("https://facebook.com");
await page.screenshot({ 
    path: './output/task8.png',
    fullPage: true 
});
console.log('Screenshot saved successfully!');
await page.close();