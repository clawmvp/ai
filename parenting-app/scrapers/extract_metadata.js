const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');
const PROGRAM_DATA_PATH = path.join(__dirname, '../data/program_1_metadata.json');

async function extractProgramMetadata(programId = 1) {
    console.log(`Starting metadata extraction for Program ${programId}...`);

    if (!fs.existsSync(STORAGE_STATE_PATH)) {
        console.error('No storage state found. Please run auth.js first.');
        return;
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });
    const page = await context.newPage();

    try {
        const url = `https://web.parents.app/watch/program/${programId}`;
        await page.goto(url, { waitUntil: 'networkidle' });

        console.log('Fetching chapters and episodes via API...');

        const metadata = await page.evaluate(async (programId) => {
            const chaptersResp = await fetch(`https://api.parentsapp.co/education/programs/${programId}/chapters/`);
            const chaptersData = await chaptersResp.json();
            const chapters = chaptersData.results || chaptersData;

            const curriculum = [];
            for (const chapter of chapters) {
                const episodesResp = await fetch(`https://api.parentsapp.co/education/chapters/${chapter.id}/episodes/?page_size=1000`);
                const episodesData = await episodesResp.json();
                const episodes = episodesData.results || episodesData;

                curriculum.push({
                    chapter_id: chapter.id,
                    chapter_title: chapter.title,
                    chapter_slug: chapter.slug,
                    episodes: episodes.map(e => ({
                        id: e.id,
                        title: e.title,
                        slug: e.slug,
                        duration: e.duration,
                        description: e.description,
                        sort_order: e.sort_order
                    }))
                });
            }

            return {
                program_id: programId,
                program_name: "All About Parenting",
                chapters: curriculum
            };
        }, programId);

        console.log(`Extracted metadata for: ${metadata.program_name}`);
        fs.writeFileSync(PROGRAM_DATA_PATH, JSON.stringify(metadata, null, 2));
        console.log(`Metadata saved to ${PROGRAM_DATA_PATH}`);

    } catch (error) {
        console.error('Extraction failed:', error);
    } finally {
        await browser.close();
    }
}

module.exports = { extractProgramMetadata };

if (require.main === module) {
    extractProgramMetadata(1);
}
