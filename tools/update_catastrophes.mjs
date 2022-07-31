// Data generated from https://www.donneesquebec.ca/recherche/dataset/evenements-de-securite-civile/resource/8a707be3-2452-43b2-be72-fb5926876c72

import { createInterface } from 'readline';
import { createReadStream, writeFileSync } from 'fs';

const args = process.argv.slice(2);
if (args.length < 2) {
    console.log('Usage: node update_catastrophes.js <source> <destination>');
}

function translateEventCode(code) {
    switch (parseInt(code.replace('"', ''))) {
        case 133:
            return "HURRICANE";
        case 138:
            return "STORM";
        case 139:
            return "TORNADO";
        case 166:
            return "HEAT_WAVE";
        case 171:
            return "SEVERE_WINDS";
        case 39:
            return "FOREST_FIRE";
        case 8:
            return "FLOOD";
        default:
            return undefined;
    }
}
const catastrophes = [];

const file = createReadStream(args[0]);
const rl = createInterface({
    input: file
});

for await (const line of rl) {
    const [code_alea, alea, , , , , , date_signalement, date_debut, , , , coord_x, coord_y] = line.split(',');

    const type = translateEventCode(code_alea);
    if (!type) {
        continue;
    }

    const date = new Date(date_debut ? date_debut : date_signalement);
    const catastrophe = {
        location: [parseFloat(coord_y), parseFloat(coord_x)],
        description: alea,
        type: type,
        date: date.toISOString()
    };
    catastrophes.push(catastrophe);
}

writeFileSync(args[1], JSON.stringify(catastrophes));