const fs = require('fs');
const path = require('path');
const https = require('https');

const STORAGE_STATE_PATH = path.join(__dirname, '../data/storage_state.json');
const PROGRAM_DATA_PATH = path.join(__dirname, '../data/program_1_metadata.json');
const OUTPUT_DATA_PATH = path.join(__dirname, '../data/program_1_full_data.json');

async function main() {
    const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf8'));
    const jwtCookie = storageState.cookies.find(c => c.name === 'jwt-token');

    if (!jwtCookie) {
        console.error('JWT token not found in storage state.');
        return;
    }

    const token = jwtCookie.value;
    const metadata = JSON.parse(fs.readFileSync(PROGRAM_DATA_PATH, 'utf8'));
    const allEpisodes = [];
    metadata.chapters.forEach(chapter => {
        chapter.episodes.forEach(episode => {
            allEpisodes.push({ ...episode, chapter_title: chapter.chapter_title });
        });
    });

    console.log(`Processing ${allEpisodes.length} episodes via API...`);

    const results = [];

    for (let i = 0; i < allEpisodes.length; i++) {
        const episode = allEpisodes[i];
        console.log(`[${i + 1}/${allEpisodes.length}] Fetching data for: ${episode.title} (${episode.id})`);

        try {
            const data = await fetchEpisodeData(episode.id, token);

            // Extract relevant fields
            const enriched = {
                ...episode,
                video_hls: data.video_hls,
                video_mp4: data.video,
                audio: data.audio,
                srt_file: data.srt_file,
                media_attributes: data.media_attributes,
                duration_seconds: data.duration,
                access_status: data.access_status
            };

            results.push(enriched);

            // Save periodically
            if (results.length % 20 === 0) {
                fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(results, null, 2));
                console.log(`  Saved progress to ${OUTPUT_DATA_PATH}`);
            }

        } catch (error) {
            console.error(`  Failed to fetch ${episode.id}:`, error.message);
            results.push({ ...episode, error: error.message });
        }

        // Rate limiting / courtesy delay
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    fs.writeFileSync(OUTPUT_DATA_PATH, JSON.stringify(results, null, 2));
    console.log(`Finished. Full data saved to ${OUTPUT_DATA_PATH}`);
}

function fetchEpisodeData(id, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.parentsapp.co',
            path: `/education/episodes/${id}/`,
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ro',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error(`Failed to parse JSON for ${id}`));
                    }
                } else {
                    reject(new Error(`API returned status ${res.statusCode} for ${id}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
}

main();
