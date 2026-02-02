const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');
const PROGRAM_DATA_PATH = path.join(__dirname, '../data/program_1_metadata.json');
const OUTPUT_DATA_PATH = path.join(__dirname, '../data/program_1_full_data.json');

async function extractPlaybackIds() {
    console.log('Starting playback ID extraction for all episodes...');

    const metadata = JSON.parse(fs.readFileSync(PROGRAM_DATA_PATH, 'utf8'));
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ storageState: STORAGE_STATE_PATH });

    // Process episodes one by one or in small batches
    const allEpisodes = [];
    metadata.chapters.forEach(chapter => {
        chapter.episodes.forEach(episode => {
            allEpisodes.push({ ...episode, chapter_title: chapter.chapter_title });
        });
    });

    console.log(`Total episodes to process: ${allEpisodes.length}`);

    const results = [];
    const page = await context.newPage();

    for (let i = 0; i < allEpisodes.length; i++) {
        const episode = allEpisodes[i];
        console.log(`[${i + 1}/${allEpisodes.length}] Processing: ${episode.title}`);

        try {
            const url = `https://web.parents.app/watch/episode/${episode.id}`;
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            // Wait for Video.js tech or generic video
            await page.waitForSelector('video.vjs-tech, video, mux-player', { timeout: 15000 });

            // Small delay to let the src settle (some players rotate src)
            await page.waitForTimeout(2000);

            const playbackData = await page.evaluate(() => {
                const vjs = document.querySelector('video.vjs-tech');
                const generic = document.querySelector('video');
                const mux = document.querySelector('mux-player');

                return {
                    video_src: vjs ? vjs.src : (generic ? generic.src : null),
                    mux_playback_id: mux ? mux.getAttribute('playback-id') : null,
                    html: document.body.innerHTML.substring(0, 1000) // For debugging if failed
                };
            });

            if (!playbackData.video_src && !playbackData.mux_playback_id) {
                // Try to find source in network or hidden attributes
                console.log(`  [WARN] No direct src found for ${episode.id}, checking network/DOM...`);
            }

            results.push({
                ...episode,
                ...playbackData
            });

            // Save periodically
            if (results.length % 10 === 0) {
                fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(results, null, 2));
            }

        } catch (error) {
            console.error(`Failed to process episode ${episode.id}:`, error.message);
            results.push({ ...episode, error: error.message });
        }
    }

    fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(results, null, 2));
    console.log(`Finished. Data saved to ${OUTPUT_DATA_PATH}`);
    await browser.close();
}

extractPlaybackIds();
