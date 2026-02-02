const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');

async function captureNetwork() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();

    console.log('Capturing network requests...');
    const requests = [];

    page.on('response', async response => {
        const url = response.url();
        const request = response.request();
        const resourceType = request.resourceType();

        if (resourceType === 'fetch' || resourceType === 'xhr') {
            const status = response.status();
            console.log(`[${status}] ${url}`);

            try {
                // Only try to parse JSON if it looks like JSON or if it's a common API status
                const body = await response.json();
                requests.push({
                    url,
                    status,
                    method: request.method(),
                    headers: response.headers(),
                    body
                });
            } catch (e) {
                // Not JSON or error reading body
                requests.push({
                    url,
                    status,
                    method: request.method(),
                    error: 'Could not parse JSON'
                });
            }
        }
    });

    try {
        await page.goto('https://web.parents.app/watch/program/1', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000); // Wait for all requests to finish

        fs.writeFileSync(path.join(__dirname, '../data/network_requests.json'), JSON.stringify(requests, null, 2));
        console.log('Network data saved to data/network_requests.json');

    } catch (error) {
        console.error('Network capture failed:', error);
    } finally {
        await browser.close();
    }
}

captureNetwork();
