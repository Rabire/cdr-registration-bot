const puppeteer = require("puppeteer");
const { getDay } = require("date-fns");

const usersData = require("./data-config.json").usersData;
const { lessonsId, dayNames } = require("./static-data");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1000,800"],
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(
    `https://www.multiresa.net/sports/club/club-rhone/index.php?mod=membre&action=connexion`,
    {
      waitUntil: "networkidle0",
    }
  );

  for (const user of usersData) {
    /* LOGIN */
    try {
      await page.type("input[name=login]", user.credentials.username);
      await page.type("input[name=password]", user.credentials.password);
      await page.click('input[type="submit"]');
      await page.waitForSelector('div[id="infosSELECT"]');
    } catch (err) {
      console.log(err);
      throw `Error during login user ${user.credentials.username}`;
    }

    const today = new Date();
    const nextWeekActivity = user.lessons[dayNames[getDay(today)]];
    if (!!nextWeekActivity) {
      /* SELECTING LESSON KIND */
      await page.waitForFunction(
        `document.querySelector('div[id="loading"]').style.display === "none"`
      );
      await page.click(`span[id=${lessonsId[nextWeekActivity.name]}]`); // FIXME: // Find another waiy to find this spans
      await page.waitForFunction(
        `document.querySelector('div[id="loading"]').style.display === "none"`
      );

      /* CHANGE WEEK */
      await page.click(".fc-next-button");
      await page.waitForFunction(
        `document.querySelector('div[id="loading"]').style.display === "none"`
      );

      /* TODO: SELECTING LESSON */
      await page.waitForFunction(
        `document.querySelectorAll('div[class="fc-bg"]').length > 1`
      );
      let i = nextWeekActivity.lessonIndex;
      await page.evaluate((i) => {
        document.querySelectorAll('div[class="fc-bg"]')[i].click();
      }, i);

      /* BOOKING */
      await page
        .waitForSelector(".ui-dialog")
        .then(() => page.click("#boutonoptions > div:nth-child(3)"));

      /* Validate popup */
      page.once("dialog", async function (dialog) {
        await dialog.accept();
        console.log(`next week's ${nextWeekActivity.name} class booked`);
      });
    }
  }

  await browser.close();
})();
