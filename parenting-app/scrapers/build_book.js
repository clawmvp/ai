const fs = require('fs');
const path = require('path');

const PROCESSED_DATA_PATH = path.join(__dirname, '../data/program_1_processed.json');
const OUTPUT_BOOK_PATH = path.join(__dirname, '../output/All_About_Parenting.md');

function main() {
    const episodes = JSON.parse(fs.readFileSync(PROCESSED_DATA_PATH, 'utf8'));

    // Group by Chapter
    const chapters = {};
    const chapterOrder = [];

    episodes.forEach(ep => {
        if (!ep.transcript) return; // Skip quizzes/empty

        if (!chapters[ep.chapter_title]) {
            chapters[ep.chapter_title] = [];
            chapterOrder.push(ep.chapter_title);
        }
        chapters[ep.chapter_title].push(ep);
    });

    let bookContent = `# All About Parenting\n\n_Generated Book based on Video Course Transcripts_\n\n---\n\n## Table of Contents\n`;

    // Generate TOC
    chapterOrder.forEach((chapTitle, i) => {
        bookContent += `${i + 1}. [${chapTitle}](#chapter-${i + 1})\n`;
        chapters[chapTitle].forEach((ep, j) => {
            bookContent += `    - [${ep.title}](#episode-${ep.id})\n`;
        });
    });

    bookContent += `\n---\n\n`;

    // Generate Content
    chapterOrder.forEach((chapTitle, i) => {
        bookContent += `<a name="chapter-${i + 1}"></a>\n# Chapter ${i + 1}: ${chapTitle}\n\n`;

        chapters[chapTitle].forEach((ep, j) => {
            bookContent += `<a name="episode-${ep.id}"></a>\n## ${ep.title}\n\n`;
            if (ep.description) {
                bookContent += `> *${ep.description}*\n\n`;
            }
            bookContent += `${ep.transcript}\n\n`;
            bookContent += `---\n\n`;
        });
    });

    fs.writeFileSync(OUTPUT_BOOK_PATH, bookContent);
    console.log(`Book generated at ${OUTPUT_BOOK_PATH}`);
    console.log(`Total Chapters: ${chapterOrder.length}`);
    console.log(`Total Episodes Included: ${episodes.filter(e => e.transcript).length}`);
}

main();
