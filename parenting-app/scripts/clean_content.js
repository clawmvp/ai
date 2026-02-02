
const fs = require('fs');
const path = require('path');

const glossaryPath = '/Volumes/500GB-BK/antigravity/parenting/app/public/data/content_glossary.json';

try {
    let content = fs.readFileSync(glossaryPath, 'utf8');

    // Define replacements
    // Order matters: specific phrases first, then general words
    const replacements = [
        { regex: /acest video/gi, replacement: 'această lecție' },
        { regex: /în acest video/gi, replacement: 'în această lecție' },
        { regex: /videoul următor/gi, replacement: 'lecția următoare' },
        { regex: /video-ul următor/gi, replacement: 'lecția următoare' },
        { regex: /următorul video/gi, replacement: 'următoarea lecție' },
        { regex: /următorul video-ul/gi, replacement: 'următoarea lecție' },
        { regex: /sub acest video/gi, replacement: 'sub această lecție' },
        { regex: /sub video/gi, replacement: 'mai jos' },
        { regex: /videoului/gi, replacement: 'lecției' },
        { regex: /video-ului/gi, replacement: 'lecției' },
        { regex: /videoul/gi, replacement: 'lecția' },
        { regex: /video-ul/gi, replacement: 'lecția' },
        { regex: /videourile/gi, replacement: 'lecțiile' },
        { regex: /video-urile/gi, replacement: 'lecțiile' },
        { regex: /videouri/gi, replacement: 'lecții' },
        { regex: /video-uri/gi, replacement: 'lecții' },
        { regex: /într-un video/gi, replacement: 'într-o lecție' },
        { regex: /un video/gi, replacement: 'o lecție' },
        { regex: /urmărește video/gi, replacement: 'parcurge lecția' },
        { regex: /urmărește/gi, replacement: 'parcurge' }, // General watch -> go through
        { regex: /vezi în video/gi, replacement: 'găsești în lecție' },
        { regex: /ai văzut în video/gi, replacement: 'ai aflat în lecție' },
        { regex: /vizionare/gi, replacement: 'lectură' },
        { regex: /ascultă/gi, replacement: 'citește' }, // General listen -> read
        { regex: /ascultat/gi, replacement: 'citit' },
        { regex: /clipul/gi, replacement: 'episodul' },
        { regex: /înregistrarea/gi, replacement: 'lecția' },
    ];

    let modifiedContent = content;

    replacements.forEach(({ regex, replacement }) => {
        modifiedContent = modifiedContent.replace(regex, replacement);
    });

    // Additional cleanup for potential grammar issues from direct replacement
    // e.g. "această lecție te invit" -> "în această lecție te invit" (context dependent)
    // But strictly replacing nouns should work reasonably well for Romanian gender change video (n) -> lectie (f)
    // "acest video" (n) -> "această lecție" (f) - Handled
    // "un video" (n) -> "o lecție" (f) - Handled
    // "videoul" (n) -> "lecția" (f) - Handled

    // Checking for "video" word standing alone
    modifiedContent = modifiedContent.replace(/ video /gi, ' lecție ');
    modifiedContent = modifiedContent.replace(/ video,/gi, ' lecție,');
    modifiedContent = modifiedContent.replace(/ video\./gi, ' lecție.');


    fs.writeFileSync(glossaryPath, modifiedContent, 'utf8');
    console.log('Successfully cleaned content_glossary.json');

} catch (err) {
    console.error('Error processing file:', err);
}
