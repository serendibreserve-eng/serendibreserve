/**
 * Centralized image asset registry.
 * REPLACE WITH SERENDIB RESERVE PHOTO: swap any url below with your own licensed photograph.
 */
export interface ImageAsset {
  id: string;
  url: string;
  alt: string;
  caption: string;
  aspect: '16/9' | '4/3' | '1/1';
}

export const GEM_IMAGES: Record<string, ImageAsset> = {
  // REPLACE WITH SERENDIB RESERVE PHOTO
  heroReferenceSapphire: {
    id: 'heroReferenceSapphire',
    url: '/assets/aistudio/Landing_Hero_Full_Widrh_5ccf9b80.jpg',
    alt: 'Deep royal Ceylon blue cushion-cut sapphire reflecting silver and cobalt light',
    caption: 'Ceylon Blue Sapphire — Hero Reference Study',
    aspect: '16/9',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  silkBackdrop: {
    id: 'silkBackdrop',
    url: '/assets/aistudio/images__9__ce93add1.jpg',
    alt: 'Midnight royal blue flowing silk atmosphere',
    caption: 'Midnight Sapphire Silk',
    aspect: '16/9',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  brandCrest: {
    id: 'brandCrest',
    url: '/assets/aistudio/Frame_3680_2963116c.png',
    alt: 'Serendib Reserve emblem pairing a Sri Lankan lion crest with a faceted blue sapphire',
    caption: 'Serendib Reserve House Emblem',
    aspect: '16/9',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  roughCorundum: {
    id: 'roughCorundum',
    url: '/src/assets/images/ceylon_rough_corundum_1794904156509.jpg',
    alt: 'Natural hexagonal Ceylon blue sapphire and padparadscha rough crystals on dark river gravel',
    caption: 'Alluvial Rough Corundum — Ratnapura Gravels',
    aspect: '16/9',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  lapidaryWheel: {
    id: 'lapidaryWheel',
    url: '/src/assets/images/lapidary_faceting_wheel_1794904157379.jpg',
    alt: 'Master Sri Lankan lapidary cutting a deep royal blue sapphire on a precision wheel',
    caption: 'Precision Ceylon Lapidary Craft',
    aspect: '4/3',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  ratnapuraValley: {
    id: 'ratnapuraValley',
    url: '/src/assets/images/ratnapura_gem_valley_1794904156598.jpg',
    alt: 'Misty dawn over the Ratnapura river valley and Highland Complex ridges in Sri Lanka',
    caption: 'Ratna-Dweepa — The Highland Complex',
    aspect: '16/9',
  },
  // REPLACE WITH SERENDIB RESERVE PHOTO
  spectrumTray: {
    id: 'spectrumTray',
    url: '/src/assets/images/gemstone_spectrum_tray_1794904157568.jpg',
    alt: 'Curated Ceylon blue sapphire, padparadscha, ruby, alexandrite, and moonstone on navy velvet',
    caption: 'Curated Ceylon Spectrum',
    aspect: '4/3',
  },
};
