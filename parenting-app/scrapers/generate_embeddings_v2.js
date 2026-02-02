
const fs = require('fs');
const path = require('path');

// Ensure you have: npm install @xenova/transformers
// Run from: /Volumes/500GB-BK/antigravity/parenting
// Node: node scrapers/generate_embeddings_v2.js

async function main() {
    const { pipeline } = await import('@xenova/transformers'); // Dynamic import for ESM

    const INPUT_FILE = path.join(__dirname, '../app/public/data/content_glossary.json');
    const OUTPUT_FILE = path.join(__dirname, '../app/public/data/embeddings_v2.json');

    if (!fs.existsSync(INPUT_FILE)) {
        console.error("Glossary file not found:", INPUT_FILE);
        return;
    }

    const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    console.log(`Loaded ${data.length} items. Loading extractor...`);

    // Use a better multilingual model
    // 'Xenova/paraphrase-multilingual-MiniLM-L12-v2' is typical for semantic search.
    const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
    console.log("Model loaded.");

    const chunks = [];
    let processed = 0;

    for (const item of data) {
        // Simple Chunking: split by paragraphs, then combine if too short
        // For glossary, paragraphs are usually good units.
        const paragraphs = item.text.split('\n').filter(p => p.length > 50);

        for (const p of paragraphs) {
            // Embed
            const output = await extractor(p, { pooling: 'mean', normalize: true });

            chunks.push({
                id: item.id,
                title: item.title,
                text: p, // The chunk text
                embedding: Array.from(output.data) // Convert to standard array
            });
        }
        processed++;
        if (processed % 10 === 0) console.log(`Processed ${processed}/${data.length}...`);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunks));
    console.log(`Saved ${chunks.length} chunks to ${OUTPUT_FILE}`);
}

main().catch(console.error);
