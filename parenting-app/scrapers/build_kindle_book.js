const fs = require('fs');
const path = require('path');

const PROCESSED_DATA_PATH = path.join(__dirname, '../data/program_1_processed.json');
const OUTPUT_HTML_PATH = path.join(__dirname, '../output/All_About_Parenting.html');

function main() {
    const episodes = JSON.parse(fs.readFileSync(PROCESSED_DATA_PATH, 'utf8'));

    // Group by Chapter
    const chapters = {};
    const chapterOrder = [];

    episodes.forEach(ep => {
        if (!ep.transcript) return;

        if (!chapters[ep.chapter_title]) {
            chapters[ep.chapter_title] = [];
            chapterOrder.push(ep.chapter_title);
        }
        chapters[ep.chapter_title].push(ep);
    });

    let html = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <title>All About Parenting</title>
    <meta name="author" content="Parents App">
    <style>
        body {
            font-family: "Palatino Linotype", "Book Antiqua", Palatino, serif;
            line-height: 1.6;
            margin: 0;
            padding: 2em;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
            color: #333;
        }
        h1, h2, h3 {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: #2c3e50;
        }
        h1.book-title {
            text-align: center;
            font-size: 3em;
            margin-top: 2em;
            margin-bottom: 0.5em;
        }
        .author {
            text-align: center;
            font-size: 1.2em;
            color: #7f8c8d;
            margin-bottom: 4em;
        }
        .toc {
            margin-bottom: 4em;
            page-break-after: always;
        }
        .toc a {
            text-decoration: none;
            color: #2980b9;
        }
        .toc ul {
            list-style-type: none;
            padding-left: 0;
        }
        .toc > ul > li {
            margin-top: 1em;
            font-weight: bold;
        }
        .toc ul ul {
            padding-left: 1.5em;
            font-weight: normal;
        }
        .chapter {
            page-break-before: always;
            margin-top: 2em;
        }
        .episode {
            margin-bottom: 3em;
        }
        .description {
            font-style: italic;
            color: #555;
            background: #f9f9f9;
            padding: 1em;
            border-left: 4px solid #bdc3c7;
            margin-bottom: 1.5em;
        }
        p {
            text-align: justify;
            margin-bottom: 1em;
        }
    </style>
</head>
<body>

    <h1 class="book-title">All About Parenting</h1>
    <p class="author">Generated from Parents App Course</p>

    <div class="toc">
        <h2>Cuprins</h2>
        <ul>
`;

    // Generate TOC
    chapterOrder.forEach((chapTitle, i) => {
        html += `<li><a href="#chapter-${i + 1}">${i + 1}. ${chapTitle}</a>
            <ul>`;
        chapters[chapTitle].forEach((ep, j) => {
            html += `<li><a href="#episode-${ep.id}">${ep.title}</a></li>`;
        });
        html += `</ul></li>`;
    });

    html += `
        </ul>
    </div>
    `;

    // Generate Content
    chapterOrder.forEach((chapTitle, i) => {
        html += `<div class="chapter" id="chapter-${i + 1}">
            <h1>Capitolul ${i + 1}: ${chapTitle}</h1>`;

        chapters[chapTitle].forEach((ep, j) => {
            // Split transcript into paragraphs
            const paragraphs = ep.transcript.split(/\n+/).map(p => `<p>${p.trim()}</p>`).join('');

            html += `
            <div class="episode" id="episode-${ep.id}">
                <h2>${ep.title}</h2>
                ${ep.description ? `<div class="description">${ep.description}</div>` : ''}
                <div class="content">
                    ${paragraphs}
                </div>
                <hr style="margin-top: 2em; border: 0; border-top: 1px solid #eee;">
            </div>`;
        });

        html += `</div>`;
    });

    html += `
</body>
</html>`;

    fs.writeFileSync(OUTPUT_HTML_PATH, html);
    console.log(`Kindle-ready HTML generated at ${OUTPUT_HTML_PATH}`);
}

main();
