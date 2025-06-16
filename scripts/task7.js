// Basic Screenshot Capture
const page = await browser.newPage();
await page.goto("https://facebook.com");
await page.screenshot({
    path: "./output/task7.png",
    fullPage: true,
});
console.log("Screenshot saved successfully!");
await page.close();
