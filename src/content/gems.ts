export type GemCut =
  | 'brilliant'
  | 'cushion'
  | 'oval'
  | 'emerald'
  | 'pear'
  | 'marquise'
  | 'cabochon'
  | 'rough';

export type GemCategory =
  | 'Corundum'
  | 'Chrysoberyl'
  | 'Spinel'
  | 'Garnet'
  | 'Beryl'
  | 'Quartz'
  | 'Tourmaline'
  | 'Feldspar'
  | 'Others';

export type GemEffect =
  | 'standard'
  | 'star'
  | 'cats-eye'
  | 'alexandrite'
  | 'moonstone'
  | 'dispersion';

export interface GemSpec {
  id: string;
  name: string;
  subtitle: string;
  category: GemCategory;
  cut: GemCut;
  colorHex: string;
  secondaryColorHex: string;
  glowHex: string;
  ior: number;
  effect?: GemEffect;
  species: string;
  colourRange: string;
  hardnessMohs: string;
  refractiveIndex: string;
  sriLankanSources: string;
  whatMakesAFineOne: string;
  oneLineCaption: string;
  photoUrl: string;
  matteTolerance?: number;
  featuredInCarousel?: boolean;
  featuredInGallery?: boolean;
}

export const GEM_CATEGORIES: Array<'All' | GemCategory> = [
  'All',
  'Corundum',
  'Chrysoberyl',
  'Spinel',
  'Garnet',
  'Beryl',
  'Quartz',
  'Tourmaline',
  'Feldspar',
  'Others',
];

export const GEMS_DATA: GemSpec[] = [
  {
    id: 'blue-sapphire',
    name: 'Ceylon Blue Sapphire',
    subtitle: 'Corundum — The Island’s Signature Stone',
    category: 'Corundum',
    cut: 'cushion',
    colorHex: '#1B3FD9',
    secondaryColorHex: '#3D7BFF',
    glowHex: '#3D7BFF',
    ior: 1.77,
    effect: 'standard',
    species: 'Corundum (Al₂O₃)',
    colourRange: 'Cornflower blue, velvety royal blue, twilight indigo',
    hardnessMohs: '9.0',
    refractiveIndex: '1.762 – 1.770',
    sriLankanSources: 'Ratnapura, Elahera, Balangoda, Pelmadulla',
    whatMakesAFineOne:
      'Pure vivid royal-to-cornflower saturation without grey or green zoning, lively brilliance across the table, eye-clean clarity, balanced pavilion proportions, and full disclosure of heat or unheated status.',
    oneLineCaption: 'Velvety royal light, born in Ceylon river gravels.',
    photoUrl: '/assets/aistudio/Royal_Blue_Sapphire_from_Sri_Lanka__Ceylon__1d3f139f.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'padparadscha',
    name: 'Padparadscha Sapphire',
    subtitle: 'Corundum — Named After the Sacred Lotus',
    category: 'Corundum',
    cut: 'oval',
    colorHex: '#FF7B72',
    secondaryColorHex: '#FF9E7D',
    glowHex: '#FF7B72',
    ior: 1.77,
    effect: 'standard',
    species: 'Corundum (Al₂O₃)',
    colourRange: 'Delicate marriage of lotus pink and warm sunset orange',
    hardnessMohs: '9.0',
    refractiveIndex: '1.762 – 1.770',
    sriLankanSources: 'Ratnapura, Kahawatta, Balangoda',
    whatMakesAFineOne:
      'True equilibrium between pink and orange — neither purely pink nor purely orange — paired with luminous transparency, minimal colour zoning, and documented unheated or gentle thermal provenance.',
    oneLineCaption: 'A delicate marriage of lotus pink and sunset orange.',
    photoUrl: '/assets/aistudio/Padparadscha_Sapphire_556bee04.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'star-sapphire',
    name: 'Star Sapphire',
    subtitle: 'Corundum — Six-Rayed Asterism',
    category: 'Corundum',
    cut: 'cabochon',
    colorHex: '#2045C8',
    secondaryColorHex: '#8FB5FF',
    glowHex: '#3D7BFF',
    ior: 1.76,
    effect: 'star',
    species: 'Corundum with oriented rutile silk',
    colourRange: 'Cornflower blue, slate blue, lavender-grey, midnight blue',
    hardnessMohs: '9.0',
    refractiveIndex: '1.762 – 1.770',
    sriLankanSources: 'Ratnapura, Rakwana, Okkampitiya',
    whatMakesAFineOne:
      'Six crisp, straight rays intersecting cleanly at the apex of a symmetrical dome cabochon, gliding effortlessly under a single pinpoint light source against rich, even body colour.',
    oneLineCaption: 'Six silver rays gliding across a domed sapphire sky.',
    photoUrl: '/assets/aistudio/Star_Sapphire_64800eb8.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'fancy-sapphire',
    name: 'Yellow, Pink, White & Colour-Change Sapphire',
    subtitle: 'Corundum — Chromatic Diversity',
    category: 'Corundum',
    cut: 'emerald',
    colorHex: '#F5C518',
    secondaryColorHex: '#FF5C9E',
    glowHex: '#F5C518',
    ior: 1.77,
    effect: 'dispersion',
    species: 'Corundum (Al₂O₃)',
    colourRange: 'Canary yellow, pastel-to-vivid pink, colourless white, blue-to-violet shift',
    hardnessMohs: '9.0',
    refractiveIndex: '1.762 – 1.770',
    sriLankanSources: 'Ratnapura, Elahera, Nivithigala',
    whatMakesAFineOne:
      'Crisp clarity (especially in white and yellow stones), lively step or brilliant faceting, strong shift intensity in colour-change varieties, and verified treatment transparency.',
    oneLineCaption: 'Sunlight, blossom, pure ice, and twilight in one mineral family.',
    photoUrl: '/assets/aistudio/Yellow__Pink__White___Colour-Change_Sapphire_432bce40.png',
    matteTolerance: 36,
    featuredInCarousel: false,
    featuredInGallery: true,
  },
  {
    id: 'ruby',
    name: 'Ceylon Ruby',
    subtitle: 'Corundum — Crimson Fire',
    category: 'Corundum',
    cut: 'oval',
    colorHex: '#C2102E',
    secondaryColorHex: '#FF385C',
    glowHex: '#C2102E',
    ior: 1.77,
    effect: 'standard',
    species: 'Corundum (Al₂O₃)',
    colourRange: 'Bright raspberry-red to deep crimson with natural fluorescence',
    hardnessMohs: '9.0',
    refractiveIndex: '1.762 – 1.770',
    sriLankanSources: 'Ratnapura, Elahera, Balangoda',
    whatMakesAFineOne:
      'Pure red saturation with lively chromium fluorescence, clean crystal transparency, symmetrical cutting without windowing, and transparent disclosure of any heat treatment.',
    oneLineCaption: 'Glowing crimson heart tempered in Sri Lankan earth.',
    photoUrl: '/assets/aistudio/Ceylon_Ruby_3abdaceb.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'alexandrite',
    name: 'Ceylon Alexandrite',
    subtitle: 'Chrysoberyl — Daylight to Candlelight',
    category: 'Chrysoberyl',
    cut: 'cushion',
    colorHex: '#158467',
    secondaryColorHex: '#8E2464',
    glowHex: '#28B88C',
    ior: 1.75,
    effect: 'alexandrite',
    species: 'Chrysoberyl (BeAl₂O₄)',
    colourRange: 'Olive or forest green in daylight shifting to plum-raspberry in incandescent light',
    hardnessMohs: '8.5',
    refractiveIndex: '1.746 – 1.755',
    sriLankanSources: 'Ratnapura, Morawaka, Deniyaya',
    whatMakesAFineOne:
      'Dramatic 80–100% chromatic shift between cool daylight and warm candlelight, vibrant saturation in both lighting states, high clarity, and complete absence of treatment.',
    oneLineCaption: 'One crystal, two worlds: green at noon, plum by candlelight.',
    photoUrl: '/assets/aistudio/Ceylon_Alexandrite_ebedf34a.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'cats-eye',
    name: "Cat's Eye Chrysoberyl",
    subtitle: 'Chrysoberyl — Chatoyant Honey Light',
    category: 'Chrysoberyl',
    cut: 'cabochon',
    colorHex: '#D99B26',
    secondaryColorHex: '#FFE08A',
    glowHex: '#E5AE3B',
    ior: 1.75,
    effect: 'cats-eye',
    species: 'Chrysoberyl (BeAl₂O₄)',
    colourRange: 'Honey-gold, milk-and-honey, chartreuse green-gold',
    hardnessMohs: '8.5',
    refractiveIndex: '1.746 – 1.755',
    sriLankanSources: 'Ratnapura, Matugama, Morawaka',
    whatMakesAFineOne:
      'A razor-sharp, bright chatoyant band cutting cleanly down the centre of the cabochon dome, displaying the classic "milk and honey" contrast under directional light.',
    oneLineCaption: 'A living silver slit of light across honey-gold stone.',
    photoUrl: '/assets/aistudio/Cat_s_Eye_Chrysoberyl_e0d77568.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'spinel',
    name: 'Ceylon Spinel',
    subtitle: 'Spinel — Cobalt Blue & Scarlet',
    category: 'Spinel',
    cut: 'brilliant',
    colorHex: '#1E4CE0',
    secondaryColorHex: '#D1193E',
    glowHex: '#3D7BFF',
    ior: 1.72,
    effect: 'standard',
    species: 'Spinel (MgAl₂O₄)',
    colourRange: 'Cobalt blue, crimson red, lavender, dusty rose, violet-grey',
    hardnessMohs: '8.0',
    refractiveIndex: '1.712 – 1.736',
    sriLankanSources: 'Elahera, Okkampitiya, Ratnapura',
    whatMakesAFineOne:
      'Singly refractive brilliance that never sleeps, electric cobalt or vivid red hues, naturally unheated status (spinel is rarely treated), and crisp octahedral-inspired faceting.',
    oneLineCaption: 'Unheated singly refractive fire in cobalt and scarlet.',
    photoUrl: '/assets/aistudio/Ceylon_Spinel_a5fd65e6.png',
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'garnet',
    name: 'Ceylon Garnets',
    subtitle: 'Rhodolite, Hessonite & Almandine',
    category: 'Garnet',
    cut: 'pear',
    colorHex: '#9C1C4B',
    secondaryColorHex: '#D96B27',
    glowHex: '#C23564',
    ior: 1.76,
    effect: 'standard',
    species: 'Garnet Group (Pyrope-Almandine, Grossular, Spessartine)',
    colourRange: 'Raspberry rhodolite, cinnamon-honey hessonite, deep wine almandine, mandarin orange',
    hardnessMohs: '7.0 – 7.5',
    refractiveIndex: '1.730 – 1.810',
    sriLankanSources: 'Ratnapura, Matara, Elahera, Embilipitiya',
    whatMakesAFineOne:
      'High refractive sparkle without dark extinction, warm cinnamon clarity in traditional Sri Lankan hessonite ("Gomed"), or bright raspberry-violet tone in rhodolite.',
    oneLineCaption: 'From cinnamon hessonite to deep raspberry rhodolite.',
    photoUrl: '/assets/aistudio/Ceylon_Garnets_7556a118.png',
    featuredInCarousel: false,
    featuredInGallery: true,
  },
  {
    id: 'tourmaline',
    name: 'Ceylon Tourmaline',
    subtitle: 'Tourmaline — Pleochroic Spectrum',
    category: 'Tourmaline',
    cut: 'emerald',
    colorHex: '#1F7A6E',
    secondaryColorHex: '#E04D7A',
    glowHex: '#2FA697',
    ior: 1.63,
    effect: 'standard',
    species: 'Borosilicate Group (Elbaite / Dravite)',
    colourRange: 'Lagoon green, golden brown, cognac, rose pink, bi-colour',
    hardnessMohs: '7.0 – 7.5',
    refractiveIndex: '1.616 – 1.652',
    sriLankanSources: 'Ratnapura, Uva, Elahera',
    whatMakesAFineOne:
      'Clean orientation of the c-axis during cutting to bring out the brightest open hue rather than dark closed ends, combined with strong internal lustre.',
    oneLineCaption: 'Sharp architectural step cuts revealing deep pleochroic tone.',
    photoUrl: '/assets/aistudio/Ceylon_Tourmaline_23b94a4d.png',
    featuredInCarousel: false,
    featuredInGallery: true,
  },
  {
    id: 'aquamarine-beryl',
    name: 'Aquamarine & Fine Beryl',
    subtitle: 'Beryl — Sea-Glass Clarity',
    category: 'Beryl',
    cut: 'emerald',
    colorHex: '#48A9D6',
    secondaryColorHex: '#9FE2FF',
    glowHex: '#48A9D6',
    ior: 1.58,
    effect: 'standard',
    species: 'Beryl (Be₃Al₂Si₆O₁₈)',
    colourRange: 'Glacial sky blue, seafoam blue-green, golden heliodor, pale morganite',
    hardnessMohs: '7.5 – 8.0',
    refractiveIndex: '1.565 – 1.590',
    sriLankanSources: 'Ratnapura, Horana, Matale, Balangoda',
    whatMakesAFineOne:
      'Pure pastel-to-medium blue tone free of muddy grey, pristine eye-clean transparency, and elongated step or scissor cuts that amplify water-clear brilliance.',
    oneLineCaption: 'Oceanic clarity faceted into tranquil light.',
    photoUrl: '/assets/aistudio/Aquamarine___Fine_Beryl_257c3df3.png',
    matteTolerance: 14,
    featuredInCarousel: false,
    featuredInGallery: true,
  },
  {
    id: 'topaz',
    name: 'Ceylon White & Imperial-Tone Topaz',
    subtitle: 'Topaz — Crisp Mineral Fire',
    category: 'Others',
    cut: 'marquise',
    colorHex: '#DCE8F5',
    secondaryColorHex: '#E5B45B',
    glowHex: '#9EC5FF',
    ior: 1.62,
    effect: 'dispersion',
    species: 'Topaz (Al₂SiO₄(F,OH)₂)',
    colourRange: 'Pure colourless, champagne, pale sky blue, warm sherry',
    hardnessMohs: '8.0',
    refractiveIndex: '1.609 – 1.643',
    sriLankanSources: 'Ratnapura, Matale, Kurunegala',
    whatMakesAFineOne:
      'Flawless internal clarity, high polish on sharp facet junctions, and rich natural sherry or crisp ice-white brilliance without artificial surface coatings.',
    oneLineCaption: 'Glass-clear Ceylon white and warm champagne brilliance.',
    photoUrl: '/assets/aistudio/Ceylon_White___Imperial-Tone_Topaz_06d5bfc3.png',
    matteTolerance: 18,
    featuredInCarousel: false,
    featuredInGallery: false,
  },
  {
    id: 'amethyst-citrine',
    name: 'Amethyst & Citrine',
    subtitle: 'Quartz — Violet & Golden Warmth',
    category: 'Quartz',
    cut: 'brilliant',
    colorHex: '#7A3EC8',
    secondaryColorHex: '#E5A128',
    glowHex: '#965CE5',
    ior: 1.55,
    effect: 'standard',
    species: 'Crystalline Quartz (SiO₂)',
    colourRange: 'Royal violet, lilac, warm honey citrine, smoky quartz',
    hardnessMohs: '7.0',
    refractiveIndex: '1.544 – 1.553',
    sriLankanSources: 'Ratnapura, Kandy, Nuwara Eliya',
    whatMakesAFineOne:
      'Even colour distribution without harsh banding, precision Portuguese or concave brilliant cuts that awaken internal flashes, and verified natural origin.',
    oneLineCaption: 'Precision-cut violet and amber quartz of pure clarity.',
    photoUrl: '/assets/aistudio/Amethyst___Citrine_5464b270.png',
    featuredInCarousel: false,
    featuredInGallery: false,
  },
  {
    id: 'moonstone',
    name: 'Ceylon Blue Moonstone',
    subtitle: 'Feldspar — Floating Adularescence',
    category: 'Feldspar',
    cut: 'cabochon',
    colorHex: '#8CB8FF',
    secondaryColorHex: '#E6F0FF',
    glowHex: '#70A8FF',
    ior: 1.52,
    effect: 'moonstone',
    species: 'Orthoclase Feldspar (KAlSi₃O₈)',
    colourRange: 'Nearly transparent colourless body with electric blue-silver sheen',
    hardnessMohs: '6.0 – 6.5',
    refractiveIndex: '1.518 – 1.526',
    sriLankanSources: 'Meetiyagoda (Southern Sri Lanka), Balangoda',
    whatMakesAFineOne:
      'Water-clear transparency paired with a vivid electric-blue adularescent billow floating cleanly across the dome as the stone tilts in soft light.',
    oneLineCaption: 'Liquid blue moonlight captured beneath a satin dome.',
    photoUrl: '/assets/aistudio/Ceylon_Blue_Moonstone_27dccc4d.png',
    matteTolerance: 22,
    featuredInCarousel: true,
    featuredInGallery: true,
  },
  {
    id: 'zircon',
    name: 'Ceylon Zircon',
    subtitle: 'Zircon — Historic Brilliance & Double Refraction',
    category: 'Others',
    cut: 'brilliant',
    colorHex: '#3399CC',
    secondaryColorHex: '#D8A24A',
    glowHex: '#4BB8E8',
    ior: 1.95,
    effect: 'dispersion',
    species: 'Zircon (ZrSiO₄)',
    colourRange: 'Cambodian-style sky blue, warm cinnamon, honey yellow, colourless ("Matara diamond")',
    hardnessMohs: '7.5',
    refractiveIndex: '1.925 – 1.984',
    sriLankanSources: 'Matara, Ratnapura, Okkampitiya',
    whatMakesAFineOne:
      'Diamond-like fire and strong double refraction visible as crisp doubled facet edges under a loupe, paired with lively saturation and gentle handling.',
    oneLineCaption: 'High-dispersion fire that rivals the brilliance of diamond.',
    photoUrl: '/assets/aistudio/Ceylon_Zircon_74259b9d.png',
    featuredInCarousel: false,
    featuredInGallery: false,
  },
  {
    id: 'rare-species',
    name: 'Peridot, Sphene, Kyanite, Apatite & Iolite',
    subtitle: 'Collector Rarities — Lesser-Known Treasures',
    category: 'Others',
    cut: 'oval',
    colorHex: '#6DB33F',
    secondaryColorHex: '#3F63C8',
    glowHex: '#6DB33F',
    ior: 1.67,
    effect: 'dispersion',
    species: 'Olivine, Titanite, Aluminosilicate, Phosphate, Cordierite',
    colourRange: 'Olive-lime peridot, fiery green-gold sphene, sapphire-blue kyanite, neon-teal apatite, indigo iolite',
    hardnessMohs: '5.0 – 7.5',
    refractiveIndex: '1.54 – 2.09 (Sphene)',
    sriLankanSources: 'Ratnapura, Elahera, Okkampitiya, Matale',
    whatMakesAFineOne:
      'Distinctive optical phenomena — such as sphene’s extraordinary rainbow dispersion or iolite’s dramatic pleochroism — curated for specialist collectors and bespoke designers.',
    oneLineCaption: 'Collector curiosities of high dispersion and pleochroism.',
    photoUrl: '/assets/aistudio/Peridot__Sphene__Kyanite__Apatite___Iolite_b3d264ab.png',
    featuredInCarousel: false,
    featuredInGallery: false,
  },
  {
    id: 'serendibite',
    name: 'Serendibite',
    subtitle: 'Aenigmatite Group — Born of Sri Lanka’s Ancient Name',
    category: 'Others',
    cut: 'rough',
    colorHex: '#0E4B5A',
    secondaryColorHex: '#1B3FD9',
    glowHex: '#1A7B8E',
    ior: 1.7,
    effect: 'standard',
    species: 'Serendibite (Ca₂(Mg,Al)₆(Si,Al,B)₆O₂₀)',
    colourRange: 'Deep midnight teal, slate blue-green, velvety dark cyan',
    hardnessMohs: '6.5 – 7.0',
    refractiveIndex: '1.700 – 1.706',
    sriLankanSources: 'Gangapitiya near Kandy (type locality, 1902), Ratnapura',
    whatMakesAFineOne:
      'First identified in Sri Lanka in 1902 and named after Serendib itself. Faceted transparent stones over half a carat are among the rarest collector minerals on Earth.',
    oneLineCaption: 'One of the rarest minerals on Earth, named for Sri Lanka.',
    photoUrl: '/assets/aistudio/Serendibite_5a52e44c.png',
    featuredInCarousel: false,
    featuredInGallery: true,
  },
];

export const FOUR_CS_GUIDE = [
  {
    id: 'colour',
    title: '01. Colour',
    subtitle: 'Hue, Tone & Saturation',
    description:
      'In coloured gemstones, colour carries the greatest weight. Fine Ceylon sapphires prize pure royal or cornflower blue with even saturation and minimal secondary grey.',
    cut: 'cushion' as GemCut,
    colorHex: '#1B3FD9',
  },
  {
    id: 'clarity',
    title: '02. Clarity',
    subtitle: 'Eye-Clean Depth & Natural Silk',
    description:
      'Unlike diamonds, coloured stones are graded with the unaided eye. Delicate rutile silk needles can verify natural Ceylon origin and even soften light into a velvety glow.',
    cut: 'emerald' as GemCut,
    colorHex: '#3D7BFF',
  },
  {
    id: 'cut',
    title: '03. Cut',
    subtitle: 'Proportion & Return of Light',
    description:
      'Sri Lankan master lapidaries orient rough crystals to preserve weight while angling pavilion facets to bounce light cleanly back through the table without central windowing.',
    cut: 'brilliant' as GemCut,
    colorHex: '#C9D1DC',
  },
  {
    id: 'carat',
    title: '04. Carat',
    subtitle: 'Weight vs. Density',
    description:
      'Gem species differ in specific gravity. A 2-carat ruby appears slightly smaller in diameter than a 2-carat emerald, while rarity rises steeply above whole-carat milestones.',
    cut: 'oval' as GemCut,
    colorHex: '#FF7B72',
  },
  {
    id: 'origin-treatment',
    title: '05. Origin & Treatment',
    subtitle: 'Provenance & Full Disclosure',
    description:
      'Unheated natural stones command a collector premium, while gentle thermal treatment is disclosed transparently on every Serendib Reserve dossier and lab certificate.',
    cut: 'rough' as GemCut,
    colorHex: '#158467',
  },
];

export interface SriLankaRegion {
  id: string;
  name: string;
  title: string;
  depositType: string;
  coords: { x: number; y: number }; // coordinate in Frame_3646_1_fb372d20.svg canvas (2065 x 2023)
  gems: string[];
  description: string;
  featuredGemCut: GemCut;
  featuredGemColor: string;
}

export const SRI_LANKA_REGIONS: SriLankaRegion[] = [
  {
    id: 'ratnapura',
    name: 'Ratnapura',
    title: 'The City of Gems',
    depositType: 'Alluvial river gravels (Illama)',
    coords: { x: 885, y: 1545 },
    gems: ['Blue Sapphire', 'Padparadscha', 'Star Sapphire', 'Ruby', 'Alexandrite', "Cat's Eye"],
    description:
      'The historic gem capital of Sri Lanka, where ancient riverbeds carry water-worn crystals washed down from the central Highland Complex over millennia.',
    featuredGemCut: 'cushion',
    featuredGemColor: '#1B3FD9',
  },
  {
    id: 'elahera',
    name: 'Elahera',
    title: 'Central-North Gem Field',
    depositType: 'Eluvial & alluvial gravels',
    coords: { x: 1085, y: 925 },
    gems: ['Blue Sapphire', 'Spinel', 'Chrysoberyl', 'Garnet', 'Tourmaline'],
    description:
      'Renowned along the Amban Ganga basin for richly saturated sapphires, bright red and cobalt spinels, chrysoberyls, and fine garnet crystals.',
    featuredGemCut: 'brilliant',
    featuredGemColor: '#3D7BFF',
  },
  {
    id: 'okkampitiya',
    name: 'Okkampitiya',
    title: 'South-Eastern Frontier',
    depositType: 'Residual & shallow alluvial beds',
    coords: { x: 1295, y: 1415 },
    gems: ['Blue Sapphire', 'Spinel', 'Hessonite Garnet', 'Zircon'],
    description:
      'Located in Moneragala District, noted for residual gem-bearing layers yielding sharp sapphire crystals, star stones, and vivid spinels.',
    featuredGemCut: 'oval',
    featuredGemColor: '#9C1C4B',
  },
  {
    id: 'matale-balangoda',
    name: 'Matale & Balangoda',
    title: 'Highland Complex Belt',
    depositType: 'Highland metamorphic & valley gravels',
    coords: { x: 995, y: 1235 },
    gems: ['Padparadscha', 'Blue Sapphire', 'Ruby', 'Moonstone', 'Topaz'],
    description:
      'Spanning central highland ridges and southern foothills, home to rare lotus-hued padparadscha finds and historic metamorphic mineral occurrences.',
    featuredGemCut: 'oval',
    featuredGemColor: '#FF7B72',
  },
  {
    id: 'kalutara-beruwala',
    name: 'Kalutara – Beruwala Belt',
    title: 'Coastal Trading & Lapidary Corridor',
    depositType: 'Coastal alluvial & historic trading hub',
    coords: { x: 655, y: 1495 },
    gems: ['Moonstone (Meetiyagoda)', 'Blue Sapphire', 'Chrysoberyl', 'Spinel'],
    description:
      'Sri Lanka’s western coastal belt links traditional gem pits with Beruwala’s renowned gem markets and cutting workshops stretching toward Meetiyagoda.',
    featuredGemCut: 'cabochon',
    featuredGemColor: '#8CB8FF',
  },
];

export const FAMOUS_CEYLON_STONES = [
  {
    name: 'Logan Blue Sapphire',
    weight: '422.99 ct',
    note: 'Cushion-cut deep royal blue Ceylon sapphire preserved at the Smithsonian National Museum of Natural History.',
  },
  {
    name: 'Star of India',
    weight: '563.35 ct',
    note: 'Celebrated double-sided greyish-blue star sapphire mined in Sri Lanka, housed at the American Museum of Natural History.',
  },
  {
    name: 'Blue Belle of Asia',
    weight: '392.52 ct',
    note: 'One of the largest faceted cushion-cut Ceylon blue sapphires recorded, discovered in Pelmadulla, Ratnapura.',
  },
  {
    name: 'Rosser Reeves Star Ruby',
    weight: '138.72 ct',
    note: 'Notable Sri Lankan star ruby admired for its crisp six-ray asterism and luminous crimson tone.',
  },
];
