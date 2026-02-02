
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from '@xenova/transformers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateEmbeddings() {
    const contentPath = path.join(__dirname, '../data/content.json');
    const embeddingsPath = path.join(__dirname, '../data/embeddings.json');

    const episodes = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    console.log(`Loaded ${episodes.length} episodes.`);

    console.log('Loading extraction pipeline...');
    // Use a quantized model for speed
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

    const chunks = [];

    for (let i = 0; i < episodes.length; i++) {
        const ep = episodes[i];
        if (!ep.transcript) continue;

        // Split by newlines to get paragraphs
        const paragraphs = ep.transcript.split(/\n+/).filter(p => p.trim().length > 30); // Filter short lines

        for (let j = 0; j < paragraphs.length; j++) {
            const text = paragraphs[j].trim();
            // Log less frequently to avoid spam
            if (j % 5 === 0) console.log(`Processing Ep ${ep.id} - Para ${j + 1}/${paragraphs.length}`);

            try {
                const output = await extractor(text, { pooling: 'mean', normalize: true });
                const embedding = Array.from(output.data);

                chunks.push({
                    id: `${ep.id}-${j}`,
                    episodeId: ep.id,
                    episodeTitle: ep.title,
                    chapterTitle: ep.chapter_title,
                    text: text,
                    embedding: embedding
                });
            } catch (err) {
                console.error(`Error processing chunk: ${err.message}`);
            }
        }
    }

    fs.writeFileSync(embeddingsPath, JSON.stringify(chunks));
    console.log(`Saved ${chunks.length} embeddings to ${embeddingsPath}`);
}

generateEmbeddings();
