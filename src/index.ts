import puppeteer from 'puppeteer';
import { esportsClubBenefits, sportsClubBenefits } from './reason';

function delay(time: number) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}
// Random delay 
function randomDelay(min: number, max: number) {
    return delay(Math.floor(Math.random() * (max - min + 1)) + min);
}

const userAgents: string[] = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
];

async function fillForm(gen: number, activities: string[], reason: string, attempt:number) {
    const browser = await puppeteer.launch({
        headless: true, // Set to true for prod
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: '/home/sliden/Development/chrome/linux-135.0.7049.42/chrome-linux64/chrome'
    });
    
    try {
        const page = await browser.newPage();
        
        // Set user agent to avoid detection
        // await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setUserAgent(userAgents[Math.floor(Math.random()*userAgents.length)])   

        await page.goto(`https://docs.google.com/forms/d/e/1FAIpQLSe-3Qhi_2K14Rg1jmCSejK1zrXJyphBGkaR6y9qXh2JSVWqcg/viewform?usp=header`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await page.waitForSelector(`div[role="radio"][aria-label="Generation ${gen}"]`);
        await page.click(`div[role="radio"][aria-label="Generation ${gen}"]`);     
          
        await randomDelay(50, 200);

        for(let i = 0; i<activities.length; i++){
            await page.waitForSelector(`div[role="checkbox"][aria-label="${activities[i]}"]`);
            await page.click(`div[role="checkbox"][aria-label="${activities[i]}"]`);
            await randomDelay(100, 200);
        }

        await randomDelay(100, 200);

        await page.waitForSelector(`textarea[aria-label="ចម្លើយ​របស់​អ្នក"]`)
        await page.type('textarea[aria-label="ចម្លើយ​របស់​អ្នក"]', reason);

        await randomDelay(100, 200);
        
        await page.click('div[role="button"][aria-label="Submit"]');

        await delay(2000);

        console.log(`✅ Submitted form #${attempt + 1} with reason: "${reason.substring(0, 30)}..."`);
        return 0;
    } catch (error) {
        console.error(`❌ Failed submission #${attempt + 1}:`, error);
        return 1;
    } finally {
        await browser.close();
    }
}

(async () => {
    const gen: number = 11;
    const activities: string[] = ['Basketball', 'Badminton'];
    // const activities: string[] = ['Esports'];
    const totalSubmissions = 100;

    let successCount = 0;
    let failCount = 0;


    for (let i = 0; i < totalSubmissions; i++) {
        const reason = sportsClubBenefits[i % sportsClubBenefits.length];
        const status = await fillForm(gen, activities, reason, i);
        
        if (status === 0) successCount++;
        else failCount++;

        // Random delay between submissions (0.3-0.5 seconds)
        await randomDelay(100, 200);
    }
    console.log(`\n📊 Results:`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

})();