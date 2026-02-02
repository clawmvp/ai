const fs = require('fs');
const path = require('path');

const PROCESSED_DATA_PATH = path.join(__dirname, '../data/program_1_processed.json');
const TRANSCRIPTS_DIR = path.join(__dirname, '../data/transcripts');

function main() {
    console.log('Loading data...');
    const episodes = JSON.parse(fs.readFileSync(PROCESSED_DATA_PATH, 'utf8'));
    let count = 0;

    episodes.forEach(ep => {
        if (ep.transcript && ep.transcript.includes('{\\an8}')) {
            // Clean transcript
            ep.transcript = ep.transcript.replace(/\{\\an\d+\}/g, '');
            count++;

            // Update individual file if it exists
            const transcriptPath = path.join(TRANSCRIPTS_DIR, `ep_${ep.id}.txt`);
            if (fs.existsSync(transcriptPath)) {
                fs.writeFileSync(transcriptPath, ep.transcript);
            }
        }
    });

    if (count > 0) {
        console.log(`Cleaned ${count} episodes.`);
        fs.writeFileSync(PROCESSED_DATA_PATH, JSON.stringify(episodes, null, 2));
        console.log('Saved updated data.');
    } else {
        console.log('No artifacts found.');
    }
}

main();
