interface IItems {
  BACKGROUND: string[];
  SKIN: string[];
  EYES: string[];
  MOUTH: string[];
  NECKLACE: string[];
  VORTEX: string[];
  TRACK: string[];
}
const ITEMS: IItems = {
  BACKGROUND: [
    'Background 13',
    'Background 16',
    'Background 17',
    'Background 3',
    'Background 9',
    'Background 18',
    'Background 11',
    'Background 12',
    'Background 14',
    'Background 4',
    'Background 7',
    'Background 8_1',
    'Background 15',
    'Background 5',
    'Background 2',
    'Background 10',
    'Background 1',
    'Background 6',
  ],
  SKIN: [
    'Cyberpunk / robot',
    'Zombie',
    'Reptile',
    'Leopard Fur',
    'Tattoed',
    'Pierced',
    'Blue Fur',
    'Pink/Magenta Cat Fur',
    'White Fur',
    'Black Fur',
    'Base',
  ],
  EYES: [
    '3rd eye',
    'zipped eyes',
    'robot eyes',
    'terminator eyes',
    'zombie eyes',
    'VR headset',
    'Reptilian',
    'alien eyes',
    'Melting eyes ',
    'elf eyes',
    '3d glasses (in white)',
    'oakley glasses',
    'Black',
    'Glowing',
    'Trippy spiral eyes',
    'Cat Eyes',
    'Base',
  ],
  MOUTH: [
    'Red Pill',
    'Diamond Grills',
    'Robot',
    'Vampire',
    'Reptilian',
    'Gas mask',
    'Zipped',
    'Melting',
    'Joker Mouth',
    'Gas Mask Blask',
    'Gold Grills',
    'Sabertooth',
    'Venom',
    'Black',
    'Neon Mask',
    'Base',
  ],
  NECKLACE: [
    'GM',
    'WAGMI',
    'Charles',
    'Blockchain',
    'Magic Stone',
    'Bandana',
    'Joystick',
    'Diamond Chains',
    'Diamond Choker',
    'Gold Chains',
    'Beads',
    'Spike',
    'Bowtie',
    'Dog Tags',
    'Leather Choker',
    'Base',
  ],
  VORTEX: [
    'Punk',
    'Squiggle',
    'Axie',
    'Doge',
    'Legendary Palm',
    'Mooncat',
    'LandWorks',
    'Unicorn',
    'ETH',
    'Sushi',
    'Ghosts',
    'Mushrooms',
    'Pac',
    'Matrix',
    'Tetris',
    'Corn',
    'Diamond',
    'Butterflies/other insects',
    'Balloons',
  ],
  TRACK: [
    'Track 5',
    'Track 6',
    'Track 2',
    'Track 8',
    'Track 7',
    'Track 10',
    'Track 4',
    'Track 9',
    'Track 3',
    'Track 1',
  ],
};

const GENES_TYPE_COUNT_MAP = {
  BACKGROUND_GENE_COUNT: ITEMS.BACKGROUND.length,
  MOUTH_GENES_COUNT: ITEMS.MOUTH.length,
  SKIN_GENES_COUNT: ITEMS.SKIN.length,
  HAND_GENES_COUNT: ITEMS.NECKLACE.length,
  CLOTHES_GENES_COUNT: ITEMS.VORTEX.length,
  EYES_GENES_COUNT: ITEMS.EYES.length,
  HEAD_GENES_COUNT: ITEMS.TRACK.length,
};

interface IGenePosition {
  BACKGROUND?: number | string;
  SKIN?: number | string;
  EYES?: number | string;
  MOUTH?: number | string;
  NECKLACE?: number | string;
  VORTEX?: number | string;
  TRACK?: number | string;
}
const GENE_POSITIONS_MAP: IGenePosition = {
  BACKGROUND: 0,
  SKIN: 1,
  NECKLACE: 2,
  MOUTH: 3,
  EYES: 4,
  VORTEX: 5,
  TRACK: 6,
};

const BACKGROUND_DISTRIBUTION = [49, 49, 49, 149, 149, 149, 250, 250, 250, 250, 350, 350, 350, 350, 500, 500, 500, 500];

const SKIN_DISITRIBUTION = [200, 200, 240, 300, 503, 503, 504, 504, 600, 600, 840];

const EYES_DISTRIBUTION = [50, 100, 200, 200, 200, 224, 240, 250, 250, 300, 350, 350, 350, 350, 370, 420, 790];

const MOUTH_DISTRIBUTION = [50, 94, 200, 225, 240, 250, 250, 250, 275, 300, 350, 400, 400, 420, 500, 790];

const NECKLACE_DISTRIBUTION = [50, 100, 150, 247, 247, 250, 250, 300, 350, 350, 400, 400, 400, 450, 450, 600];

const VORTEX_DISTRIBUTION = [
  100,
  150,
  200,
  200,
  200,
  200,
  244,
  250,
  250,
  250,
  250,
  250,
  300,
  300,
  300,
  350,
  400,
  400,
  400,
];

const TRACKS_DISTRIBUTION = [44, 150, 250, 360, 450, 550, 660, 750, 840, 940];

class GenesParser {
  splitArrayIntoChunksOfLen = (arr: any, len: number) => {
    const chunks = [];
    let i = 0;
    const n = arr.length;
    while (i < n) {
      chunks.push(arr.slice(i, (i += len)).join());
    }
    return chunks;
  };

  parse = (gene: string) => {
    // let gene = '8578337193583896977622242819238527022510612018955151247142290718548395028898'; // example
    const adjustableGenes = gene.substr(gene.length - 28); // take the last 18 digits
    const groupedGenes: string[] = [];
    // We must take the genes from righ to left for example 9808 -> BACKGROUND code
    // We split them in pair of 4
    for (let i = adjustableGenes.length - 4; i >= 0; i -= 4) {
      const endOfPair = i + 4;
      const genePair = adjustableGenes.substring(i, endOfPair);
      groupedGenes.push(genePair);
    }

    const result: IGenePosition = {};
    Object.keys(GENE_POSITIONS_MAP).forEach((key, index) => {
      let distribution: number[] = [];
      switch (key) {
        case 'BACKGROUND':
          distribution = BACKGROUND_DISTRIBUTION;
          break;
        case 'SKIN':
          distribution = SKIN_DISITRIBUTION;
          break;
        case 'NECKLACE':
          distribution = NECKLACE_DISTRIBUTION;
          break;
        case 'MOUTH':
          distribution = MOUTH_DISTRIBUTION;
          break;
        case 'EYES':
          distribution = EYES_DISTRIBUTION;
          break;
        case 'VORTEX':
          distribution = VORTEX_DISTRIBUTION;
          break;
        case 'TRACK':
          distribution = TRACKS_DISTRIBUTION;
          break;
        default:
          break;
      }

      let geneItemIndex = 0;
      let counter = 0;
      const traitGene = +groupedGenes[index];

      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < distribution.length; i++) {
        const distr = distribution[i];
        counter += distr;
        if (traitGene <= counter) {
          geneItemIndex = i;
          break;
        }
      }

      const prefix = '99';
      const id = `${prefix}${GENE_POSITIONS_MAP[key as keyof IGenePosition]}${geneItemIndex}`;
      if (ITEMS[key as keyof IItems]) {
        result[key as keyof IGenePosition] = id;
      }
    });

    return result;
  };
}

const GeneParser = new GenesParser();
export default GeneParser;
