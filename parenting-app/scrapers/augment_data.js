const fs = require('fs');
const path = require('path');

const GLOSSARY_FILE = path.join(__dirname, '../app/public/data/content_glossary.json');

// New curated content from external search
const NEW_CONTENT = [
    {
        id: "ext-1",
        title: "Ghid Conectare: Sfaturi Esențiale",
        text: `Conectarea cu copilul reprezintă un aspect fundamental al parentingului, esențial pentru dezvoltarea armonioasă a micuțului. Aceasta depășește simpla prezență fizică, implicând o interacțiune profundă, bazată pe atenție, empatie și înțelegere reciprocă.
Importanța Conectării: O relație solidă părinte-copil contribuie semnificativ la dezvoltarea fizică, emoțională și socială. Copiii conectați au o stimă de sine mai ridicată și gestionează mai bine emoțiile.

Sfaturi pentru o Conectare Eficientă:
1. Ascultare Activă: Oferă atenție deplină atunci când copilul vorbește. Coboară la nivelul său vizual.
2. Timp de Calitate: Fiecare moment poate fi o oportunitate de conectare.
3. Validarea Emoțiilor: Acceptă și validează emoțiile, chiar și pe cele dificile.
4. Fii un Model Pozitiv: Copiii învață prin imitație.
5. Atașament Securizant: Ofer dragoste și stabilitate pentru a crea siguranță.`
    }
];

function main() {
    if (!fs.existsSync(GLOSSARY_FILE)) {
        console.error("Glossary file not found!");
        return;
    }

    const glossary = JSON.parse(fs.readFileSync(GLOSSARY_FILE, 'utf8'));

    // Check for duplicates (simple title check)
    const existingTitles = new Set(glossary.map(i => i.title));
    let addedCount = 0;

    NEW_CONTENT.forEach(item => {
        if (!existingTitles.has(item.title)) {
            glossary.push(item);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        fs.writeFileSync(GLOSSARY_FILE, JSON.stringify(glossary, null, 2));
        console.log(`Deeply augmented glossary with ${addedCount} new items.`);
    } else {
        console.log("No new items needed (already exist).");
    }
}

main();
