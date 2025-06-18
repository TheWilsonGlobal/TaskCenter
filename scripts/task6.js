const configData = fs.readFileSync("./profiles/profile_from_task_6/config.json", "utf8");
const outputPath = "./profiles/profile_from_task_6/output.json";
const profileData = JSON.parse(configData);

cookies = profileData.custom_fields?.twitter_account?.cookies;
await page.setCookie(...cookies);
await page.goto("https://www.twitter.com");
await twitterComment();

async function twitterComment() {
    console.log("Comment...");
    await pause(2000);
    await click(page, "//div[@data-testId='tweetText']");
    await pause(2000);
    await type(page, "//div[@data-testid='tweetTextarea_0']", "👍");
    await pause(2000);
    await click(page, "//button/div/span/span[text()='Reply']");
    await pause(3000);
    const commentURL = await getAttribute(
        page,
        "//a[contains(@href,'0xDavidOlsen') and time]",
        "href"
    );
    const outputInfo = {
        commentURL: commentURL,
    };

    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, JSON.stringify(outputInfo, null, 2));
}

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
    const element = await page.waitForSelector("::-p-xpath(" + xpath + ")");
    await element.type(text);
}

async function getAttribute(page, xpath, attributeName) {
    try {
        // 1. Wait for the element to appear on the page
        const element = await page.waitForSelector("::-p-xpath(" + xpath + ")");
        const propertyHandle = await element.getProperty(attributeName);
        const propertyValue = await propertyHandle.jsonValue();
        return propertyValue;
    } catch (error) {
        // Handle cases where selector might not be found within timeout
        if (error.name === "TimeoutError") {
            console.warn(`Timeout waiting for element with selector "${xpath}".`);
            return null;
        }
        console.error(`Error getting attribute "${attributeName}" for "${xpath}":`, error);
        return null;
    }
}
