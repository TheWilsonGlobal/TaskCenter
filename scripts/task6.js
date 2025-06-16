const jsonData = fs.readFileSync("./profiles/profile_from_task_5/config.json", "utf8");
const profileData = JSON.parse(jsonData);
const twitterUsername = profileData.custom_fields?.twitter_account?.username;
const twitterPassword = profileData.custom_fields?.twitter_account?.password;
const twitterEmail = profileData.custom_fields?.twitter_account?.email;
const twitter2FA = profileData.custom_fields?.twitter_account?.["2fa"];
logger.info("twitterUsername" + twitterUsername);

// Log in twitter
await page.goto("https://www.twitter.com");
await pause(2000);
if (await click(page, "//span[text()='Sign in']")) {
    await type(page, "//input[@autocomplete='username']", twitterUsername);
    await click(page, "//span[text()='Next']");
    // await pause(2000);
    await type(page, "//input[@autocomplete='current-password']", twitterPassword);
    await click(page, "//span[text()='Log in']");

    // const speakeasy = require("speakeasy");

    const token = speakeasy.totp({
        secret: twitter2FA,
        encoding: "base32",
    });
    await type(page, "//input[@autocomplete='on']", token);
    await click(page, "//span[text()='Next']");
}

await pause(2000);
await click(page, "//button[@data-testid='like']");
await page.screenshot({
    path: "./output/twitter.png",
    fullPage: true,
});

async function pause(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

async function click(page, xpath) {
    try {
        // Wait for the selector to appear. If it doesn't appear within 5 seconds,
        // it will throw an error, which we catch.
        const element = await page.waitForSelector("::-p-xpath(" + xpath + ")", { timeout: 5000 }); // Wait up to 5 seconds
        await element.click();
        return true;
    } catch (error) {
        console.log("Not present: " + xpath);
        return false;
    }
}

async function type(page, xpath, text) {
    const element = await page.waitForSelector("::-p-xpath(" + xpath + ")", { timeout: 5000 }); // Wait up to 5 seconds
    await element.type(text);
}
