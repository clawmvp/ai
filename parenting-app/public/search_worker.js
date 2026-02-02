
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js';

// Configuration
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor = null;
let generator = null;
let embeddings = [];

// Cosine similarity
function cosineSimilarity(a, b) {
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

self.onmessage = async (event) => {
    const { type, query } = event.data;

    try {
        if (type === 'init') {
            if (!extractor) {
                // Load data (New V2 Embeddings)
                const response = await fetch('/data/embeddings_v2.json');
                if (!response.ok) throw new Error('Failed to load embeddings v2');
                embeddings = await response.json();

                // Load models
                // Feature extraction for search (Multilingual V2)
                extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');

                // Text generation for RAG
                // Using a small but capable model for browser usage
                generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-248M');
            }
            self.postMessage({ type: 'ready' });
        } else if (type === 'search') {
            if (!extractor || !generator) throw new Error('Models not initialized');

            // 1. Search
            const output = await extractor(query, { pooling: 'mean', normalize: true });
            const queryEmbedding = Array.from(output.data);

            const scored = embeddings.map(item => ({
                ...item,
                score: cosineSimilarity(queryEmbedding, item.embedding)
            }));

            // Sort
            scored.sort((a, b) => b.score - a.score);
            const topResults = scored.slice(0, 8); // Take top 8 for context

            // 2. Generate Answer (RAG)
            const context = topResults.map(r => r.text).join(' ');

            // Simplified prompt to encourage Romanian
            const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nSummarize the answer in Romanian language:`;

            // 3. Smart Extracts (Deterministic "List of Causes")
            // Split context into sentences to find specific "causes"
            const sentences = context.match(/[^.!?]+[.!?]+/g) || [];
            const sentenceScores = [];

            // Re-embed/score sentences would be slow without the embedding model separate.
            // Heuristic approaches:
            // Find sentences containing keywords related to "cause" (Romanian) + query terms
            const keywords = ['pentru ca', 'deoarece', 'cauza', 'motiv', 'nevoie'];

            sentences.forEach(s => {
                let score = 0;
                keywords.forEach(k => { if (s.toLowerCase().includes(k)) score += 2; });
                // Simple term match with query
                const queryTerms = query.toLowerCase().split(' ').filter(w => w.length > 3);
                queryTerms.forEach(t => { if (s.toLowerCase().includes(t)) score += 1; });

                if (score > 0) sentenceScores.push({ text: s.trim(), score });
            });

            // Sort by score
            sentenceScores.sort((a, b) => b.score - a.score);
            const keyPoints = sentenceScores.slice(0, 3).map(s => s.text);

            // Return results immediately
            self.postMessage({ type: 'results', data: scored.slice(0, 50), keyPoints: keyPoints });

            // Generate answer
            const generationOutput = await generator(prompt, {
                max_new_tokens: 150,
                temperature: 0.5,
                repetition_penalty: 1.2
            });

            self.postMessage({ type: 'answer', data: generationOutput[0].generated_text });
        }
    } catch (error) {
        self.postMessage({ type: 'error', data: error.message });
    }
};
