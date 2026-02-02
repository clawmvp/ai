const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const FULL_DATA_PATH = path.join(__dirname, '../data/program_1_full_data.json');
const TRANSCRIPTS_DIR = path.join(__dirname, '../data/transcripts');
const AUDIO_DIR = path.join(__dirname, '../data/audio');
const FFMPEG_PATH = path.join(__dirname, '../bin/ffmpeg');
const RESULTS_DATA_PATH = path.join(__dirname, '../data/program_1_processed.json');

async function main() {
    if (!fs.existsSync(TRANSCRIPTS_DIR)) fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
    if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });

    const episodes = JSON.parse(fs.readFileSync(FULL_DATA_PATH, 'utf8'));
    console.log(`Processing ${episodes.length} episodes...`);

    const processed = [];

    for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        console.log(`[${i + 1}/${episodes.length}] ${ep.title} (${ep.id})`);

        let transcript = null;
        let transcriptSource = null;

        if (ep.srt_file) {
            try {
                const srtContent = await downloadSrt(ep.srt_file);
                transcript = cleanSrt(srtContent);
                transcriptSource = 'srt';
                console.log(`  - Subtitles downloaded and cleaned.`);
            } catch (err) {
                console.error(`  - Failed to download SRT: ${err.message}`);
            }
        }

        if (!transcript && ep.video_hls) {
            console.log(`  - Missing SRT, falling back to audio extraction...`);
            const audioPath = path.join(AUDIO_DIR, `ep_${ep.id}.mp3`);
            if (!fs.existsSync(audioPath)) {
                try {
                    extractAudio(ep.video_hls, audioPath);
                    console.log(`  - Audio extracted to ${audioPath}`);
                    transcriptSource = 'audio_extracted';
                } catch (err) {
                    console.error(`  - Failed to extract audio: ${err.message}`);
                }
            } else {
                console.log(`  - Audio already exists.`);
                transcriptSource = 'audio_extracted';
            }
        }

        const result = {
            ...ep,
            transcript: transcript,
            transcript_source: transcriptSource,
            transcript_path: transcript ? path.join('transcripts', `ep_${ep.id}.txt`) : null,
            audio_path: (transcriptSource === 'audio_extracted' || !transcript) ? path.join('audio', `ep_${ep.id}.mp3`) : null
        };

        if (transcript) {
            fs.writeFileSync(path.join(TRANSCRIPTS_DIR, `ep_${ep.id}.txt`), transcript);
        }

        processed.push(result);

        // Incremental save
        if (processed.length % 10 === 0) {
            fs.writeFileSync(RESULTS_DATA_PATH, JSON.stringify(processed, null, 2));
        }
    }

    fs.writeFileSync(RESULTS_DATA_PATH, JSON.stringify(processed, null, 2));
    console.log(`Done! Results saved to ${RESULTS_DATA_PATH}`);
}

function downloadSrt(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Status ${res.statusCode}`));
            }
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

function cleanSrt(srt) {
    // Basic SRT cleaner: remove timestamps, indexes, and srt tags
    return srt
        .replace(/\d+\r?\n\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/g, '') // Remove timestamps
        .replace(/<[^>]*>/g, '') // Remove HTML-like tags
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && isNaN(line)) // Remove indices and empty lines
        .join(' ');
}

function extractAudio(hlsUrl, outputPath) {
    // Extract audio using local ffmpeg
    // -y to overwrite, -vn for no video, -acodec mp3
    const cmd = `"${FFMPEG_PATH}" -i "${hlsUrl}" -vn -acodec libmp3lame -q:a 2 -y "${outputPath}"`;
    execSync(cmd, { stdio: 'ignore' });
}

main();
