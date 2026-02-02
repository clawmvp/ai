
import { pipeline, env } from '@xenova/transformers';

// Skip local checks for browser
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor: any = null;
let embeddings: any[] = [];

// Cosine similarity function
function cosineSimilarity(a: number[], b: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

self.onmessage = async (event: MessageEvent) => {
    const { type, query } = event.data;

    try {
        if (type === 'init') {
            if (!extractor) {
                // Load data first
                const response = await fetch('/data/embeddings.json'); // Adjusted path for public access? No, Next.js serving from local?
                // Actually, we need to serve embeddings.json publicly or import it.
                // For Client Component, putting it in public/data is best.
                // We will move embeddings.json to public/data later.
                embeddings = await response.json();

                // Load model
                extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
            }
            self.postMessage({ type: 'ready' });
        } else if (type === 'search') {
            if (!extractor) throw new Error('Model not initialized');

            const output = await extractor(query, { pooling: 'mean', normalize: true });
            const queryEmbedding = Array.from(output.data) as number[];

            const scored = embeddings.map(item => ({
                ...item,
                score: cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Sort by score
            scored.sort((a, b) => b.score - a.score);

            // Return top 20
            self.postMessage({ type: 'results', data: scored.slice(0, 20) });
        }
    } catch (error: any) {
        self.postMessage({ type: 'error', data: error.message });
    }
};
