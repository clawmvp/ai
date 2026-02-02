require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');

async function login(email, password) {
    console.log(`Attempting to login to parents.app with email: ${email}`);

    const browser = await chromium.launch({ headless: false }); // Set to false to see if anything goes wrong
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://web.parents.app/account/sign-in');

        // identified selectors
        await page.fill('input[placeholder="Email"]', email);
        await page.fill('input[placeholder="Parolă"]', password);

        // click 'Continuă'
        await page.click('button.ebs-button');

        // wait for navigation or specific element that indicates success
        // Usually, it redirects to the dashboard or program page
        await page.waitForNavigation({ waitUntil: 'networkidle' });

        // Save storage state for future sessions
        await context.storageState({ path: STORAGE_STATE_PATH });
        console.log(`Login successful. Storage state saved to ${STORAGE_STATE_PATH}`);

    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

module.exports = { login };

// If run directly
if (require.main === module) {
    const email = process.env.PARENTS_EMAIL;
    const password = process.env.PARENTS_PASSWORD;
    if (email && password) {
        login(email, password);
    } else {
        console.error('Environment variables PARENTS_EMAIL and PARENTS_PASSWORD are required');
    }
}
