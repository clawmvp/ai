const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../data/program_1_processed.json');
const OUTPUT_FILE = path.join(__dirname, '../app/public/data/content_glossary.json');

// Terms/Phrases to filter out entirely (Marketing/Intro/Outro)
const BLOCKLIST = [
    "bun venit", "bine ai venit", "echipa", "programul nostru", "modulul 1", "modulul 2",
    "lecția", "episodul", "următorul video", "vă mulțumesc", "înscrie-te", "link în descriere",
    "click pe", "apasa pe", "abonează-te", "share", "like", "comment",
    "all rights reserved", "copyright", "marca înregistrată"
];

// Heuristics to keep a paragraph
function isInformational(text) {
    if (!text || text.length < 20) return false; // Too short
    const lower = text.toLowerCase();

    // Check blocklist
    if (BLOCKLIST.some(term => lower.includes(term))) return false;

    // Check density: Must contain verbs/nouns, not just fluff
    // Simple check: does it likely contain a sentence?
    // In Romanian, look for punctuation or length.
    return true;
}

function cleanText(text) {
    if (!text) return "";
    return text.split('\n')
        .map(line => line.trim())
        .filter(line => isInformational(line))
        .join('\n');
}

function main() {
    console.log("Starting Semantic Cleaning...");
    if (!fs.existsSync(INPUT_FILE)) {
        console.error("Input file not found:", INPUT_FILE);
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const cleanData = rawData.map(episode => {
        const cleanedTranscript = cleanText(episode.transcript);

        // Also clean description if needed
        const cleanedDescription = cleanText(episode.description);

        // Keep simplified structure
        return {
            id: episode.id || episode.video_id,
            title: episode.title || episode.episode_title,
            // Use cleaned text or fallback to description if transcript is empty after cleaning
            text: cleanedTranscript || cleanedDescription,
            // Keep original for reference if needed, or drop to save space
            // original_transcript: episode.transcript 
        };
    }).filter(ep => ep.text.length > 50); // Drop empty episodes

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanData, null, 2));
    console.log(`Cleaned data saved to ${OUTPUT_FILE}. Processed ${rawData.length} -> ${cleanData.length} items.`);
}

main();
