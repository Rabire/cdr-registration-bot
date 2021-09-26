const puppeteer = require("puppeteer");

const usersData = [
  {
    credentials: {
      username: "rabireh@outlook.fr",
      password: "rabire",
    },
    lessons: {
      monday: [{ name: "BoxeAnglaise", startHour: "17h45" }],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturaday: [],
      sunday: [],
    },
  },
];

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
    await page.type("input[name=login]", user.credentials.username);
    await page.type("input[name=password]", user.credentials.password);
    await page.click('input[type="submit"]');
  }

  // await page.click('button[class="aOOlW  bIiDR  "]'); // accept button
})();
