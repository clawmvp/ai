const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');

async function dumpDom() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();

    try {
        await page.goto('https://web.parents.app/watch/program/1', { waitUntil: 'networkidle' });

        // Wait for potential dynamic content
        await page.waitForTimeout(3000);

        const html = await page.content();
        fs.writeFileSync(path.join(__dirname, '../data/program_1_raw.html'), html);
        console.log('DOM dumped to data/program_1_raw.html');

    } catch (error) {
        console.error('Failed to dump DOM:', error);
    } finally {
        await browser.close();
    }
}

dumpDom();
