const puppeteer = require("puppeteer");
const { getDay } = require("date-fns");
const cron = require("node-cron");

const usersData = require("./data-config.json").usersData;
const { lessonsId, dayNames } = require("./static-data");

cron.schedule("21 00 * * *", function () {
  botWork();
});

const botWork = async () => {
  console.log("botWork running");

  /* LUNCH BROWSER */
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
      try {
        await page.waitForFunction(
          `document.querySelector('div[id="loading"]').style.display === "none"`
        );
        await page.click(`span[id=${lessonsId[nextWeekActivity.name]}]`); // FIXME: // Find another waiy to find this spans
        await page.waitForFunction(
          `document.querySelector('div[id="loading"]').style.display === "none"`
        );
      } catch (err) {
        console.log(err);
        throw `Error while selecting lesson kind ${nextWeekActivity.name}`;
      }

      /* CHANGE WEEK */
      try {
        await page.click(".fc-next-button");
        await page.waitForFunction(
          `document.querySelector('div[id="loading"]').style.display === "none"`
        );
      } catch (err) {
        console.log(err);
        throw `Error while changing week in calendar`;
      }

      /* SELECTING LESSON */
      try {
        await page.waitForFunction(
          `document.querySelectorAll('div[class="fc-bg"]').length > 1`
        );
        let i = nextWeekActivity.lessonIndex;
        await page.evaluate((i) => {
          document.querySelectorAll('div[class="fc-bg"]')[i].click();
        }, i);
      } catch (err) {
        console.log(err);
        throw `Error lesson selection`;
      }

      /* BOOKING */
      try {
        await page
          .waitForSelector(".ui-dialog")
          .then(() => page.click("#boutonoptions > div:nth-child(3)"));
      } catch (err) {
        console.log(err);
        throw `Error while booking`;
      }

      /* Validate popup */
      try {
        page.once("dialog", async function (dialog) {
          await dialog.accept();
          console.log(`next week's ${nextWeekActivity.name} class booked`);
        });
      } catch (err) {
        console.log(err);
        throw `Error while closing popup`;
      }
    }

    console.log("bot work done");
  }

  await browser.close();
};
