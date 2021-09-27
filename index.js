const puppeteer = require("puppeteer");
const { getDay } = require("date-fns");

const usersData = [
  {
    credentials: {
      username: "rabireh@outlook.fr",
      password: "rabire",
    },
    lessons: {
      monday: [{ name: "BOXE ANGLAISE", lessonIndex: 1 }],
      tuesday: [{ name: "KICK BOXING", lessonIndex: 1 }],
      wednesday: [],
      thursday: [{ name: "BOXE ANGLAISE", lessonIndex: 6 }],
      friday: [{ name: "KICK BOXING", lessonIndex: 2 }],
      saturaday: [],
      sunday: [],
    },
  },
];

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturaday",
];

const lessonsId = {
  "BOXE ANGLAISE": "MENUa-92",
  "BOXE THAILANDAISE": "MENUa-93",
  "JUJITSU BRESILIEN": "MENUa-106",
  "BOXE FRANCAISE": "MENUa-94",
  "BOXE AMERICAINE": "MENUa-95",
  "CROSS TRAINING": "MENUa-97",
  "KICK BOXING": "MENUa-103",
  "KRAV MAGA": "MENUa-105",
  "MMA FREE FIGHT": "MENUa-107",
  GRAPPLING: "MENUa-98",
  "JEET KUNE DO": "MENUa-99",
  "KALI ESKRIMA": "MENUa-100",
  CAPOEIRA: "MENUa-96",
  JUDO: "MENUa-102",
  "SELF DEFENSE CIVIL": "MENUa-108",
};

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

    /* SELECTING LESSON KIND */
    const today = new Date();
    const nextWeekActivities = user.lessons[dayNames[getDay(today)]];
    const activity = nextWeekActivities[0];
    // for (const activity of nextWeekActivities) {

    await page.screenshot({ path: "wtf-screenshot.png" }); // FIXME: wtf should I wait screenshot to be able to click
    await page.click(`span[id=${lessonsId[activity.name]}]`); // FIXME: // Find another waiy to find this spans
    await page.waitForFunction(
      `document.querySelector('div[id="loading"]').style.display === "none"`
    );

    /* CHANGE WEEK */
    await page.click(
      "button[class='fc-next-button fc-button fc-state-default fc-corner-left fc-corner-right']"
    );
    await page.waitForFunction(
      `document.querySelector('div[id="loading"]').style.display === "none"`
    );

    /* SELECTING LESSON */
    await page.evaluate(() => {
      document.querySelectorAll('div[class="fc-bg"]')[1].click();
    });

    /* BOOKING */
    await page
      .waitForSelector(
        'div[class="ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-draggable ui-resizable"]'
      )
      .then(() => page.click("#boutonoptions > div:nth-child(3)"));

    // } // end for
  }
})();
