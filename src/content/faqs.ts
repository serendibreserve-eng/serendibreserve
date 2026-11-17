import { PLACEHOLDERS } from './siteConfig';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const INQUIRY_FAQS: FaqItem[] = [
  {
    id: 'natural',
    question: 'Are all Serendib Reserve gemstones natural?',
    answer:
      'Yes. We deal exclusively in natural earth-mined gemstones. Synthetic, lab-grown, or glass-imitation materials are never offered as natural stones.',
  },
  {
    id: 'treatment-disclosure',
    question: 'What is your policy on treatment disclosure?',
    answer:
      'Every stone is accompanied by full written disclosure stating whether it is unheated/untreated or has undergone standard thermal enhancement. We do not conceal treatments.',
  },
  {
    id: 'lab-certificates',
    question: 'Do you provide independent gemmological lab certificates?',
    answer:
      `Yes. Independent laboratory reports confirming species, origin, and treatment status can be arranged through recognised gemmological laboratories (${PLACEHOLDERS.certificationPartner}) prior to shipment.`,
  },
  {
    id: 'international-shipping',
    question: 'Can you ship gemstones internationally?',
    answer:
      'Yes. We export worldwide from Colombo following National Gem and Jewellery Authority (NGJA) export clearance, delivering to Europe, North America, the Middle East, and Asia.',
  },
  {
    id: 'insurance',
    question: 'How are consignments insured in transit?',
    answer:
      'International shipments travel in tamper-evident security packaging via specialist insured couriers, covered for full declared invoice value until signed delivery.',
  },
  {
    id: 'custom-cutting',
    question: 'Do you offer custom cutting or re-cutting services?',
    answer:
      'Yes. Our Sri Lankan lapidary partners can calibrate parcels to exact millimeter tolerances, execute bespoke silhouettes, or re-cut existing stones to improve brilliance.',
  },
  {
    id: 'moq',
    question: 'What are your minimum order quantities?',
    answer:
      'Single certified loose gemstones have no minimum parcel requirement. Calibrated wholesale parcels are quoted by millimeter size and total carat weight upon inquiry.',
  },
  {
    id: 'payments',
    question: 'How do payments work?',
    answer:
      `${PLACEHOLDERS.paymentTerms}. Formal pro-forma invoices with full stone details and bank coordinates are issued once a selection is confirmed.`,
  },
  {
    id: 'returns',
    question: 'Can I return a gemstone if it does not suit my project?',
    answer:
      `${PLACEHOLDERS.returnPolicy}. All terms are clearly stated in writing on your pro-forma invoice before dispatch.`,
  },
  {
    id: 'verify-authenticity',
    question: 'How can I verify the authenticity of a stone and its report?',
    answer:
      'Every certified stone carries a unique laboratory report number verifiable directly through the issuing laboratory’s online database, along with dimensional and weight specifications.',
  },
];
