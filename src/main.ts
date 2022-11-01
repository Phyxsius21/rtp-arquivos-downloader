import * as puppeteer from "puppeteer";
import * as readline from "readline-sync";
import youtubedl from "youtube-dl-exec";

(async () => {
    const url = readline.question("[x] Program URL:\n");

    const allEpisodes = await getAllEpisodes(url);
    console.log(`[!] All done! Found ${allEpisodes.urls.length} total episodes. Starting downloads.`);
    console.log("-------------");
    
    for(let i = 0; i < allEpisodes.urls.length; i++) {
        const ep = allEpisodes.urls[i];

        console.log(`[x] Downloading ${i + 1}/${allEpisodes.urls.length}...`);
        await youtubedl.exec(ep.url, { output: `./videos/${allEpisodes.programTitle}/EP${i + 1} - ${ep.date}.%(ext)s` });
        console.log(`[x] Downloaded ${i + 1}/${allEpisodes.urls.length}!`);
    }
})();

async function getAllEpisodes(programURL: string) {
    const browser = await puppeteer.launch();

    let title = null;
    let pageURL = programURL;

    const urls = [];
    while (true) {
        const data = await getPageData(browser, pageURL);

        if (urls.length < 1) {
            title = data.title;

            console.log("-------------");
            console.log(`[!] Found program: ${data.title}.`);
            console.log("-------------\n");
        }

        urls.push(...data.episodes);

        const nextPageIndex = data.pagination?.findIndex(i => i.isCurrent) + 1;
        const nextPage = data.pagination ? data?.pagination[nextPageIndex] : null;
        if (!nextPage)
            break;

        pageURL = nextPage.url;
        console.log(`[x] Found ${urls.length} total episodes! Fetching more...`);
    }

    await browser.close();
    return { programTitle: title, urls };
}

async function getPageData(browser: puppeteer.Browser, url: string) {
    const page = await browser.newPage();
    await page.goto(url);

    const title = await page.$eval(".entry-title", (el: HTMLElement) => el.innerText);

    const episodes = await page.$eval(".grid", (el: HTMLElement) => {
        return Object.keys(el.children).map((k: string) => {
            const epElem = el.children[k];

            const url = epElem.getElementsByTagName("a")[0].href;
            const date = epElem.getElementsByTagName("time")[0].innerText;
            const title = epElem.getElementsByClassName("title")[0].innerText;

            return { date, url, title };
        });
    });

    const pagination = await page.$eval(".pagination", (el: HTMLElement) => {
        const items = el.querySelectorAll("a.page-text");
        return Object.keys(items).map((i: string) => {
            const isNum = /^\d+$/.test(items[i].innerText);
            if (!isNum)
                return null;

            const num = parseInt(items[i].innerText);
            const url = items[i].href;
            const isCurrent = !!items[i].closest(".active");

            return { num, isCurrent, url };
        }).filter(e => e);
    }).catch(() => []);

    return { title, episodes, pagination };
}