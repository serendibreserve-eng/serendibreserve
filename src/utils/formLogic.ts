import { GemCut } from '../content/gems';
import { PLACEHOLDERS, SITE_CONFIG } from '../content/siteConfig';

export interface InquiryFormData {
  inquiryType: string;
  gemType: string;
  shape: GemCut;
  caratRange: string;
  colourPreference: string;
  budgetRange: string;
  quantity: string;
  treatmentPreference: string;
  name: string;
  company: string;
  country: string;
  email: string;
  phone: string;
  preferredContact: string;
  message: string;
  honeypot?: string;
}

export interface CareerFormData {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  city: string;
  portfolioUrl: string;
  yearsExperience: string;
  coverNote: string;
  cvFileName: string;
  cvFileSizeBytes: number;
  consent: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInquiryStep(step: number, data: InquiryFormData): ValidationResult {
  const errors: Record<string, string> = {};

  if (data.honeypot && data.honeypot.trim().length > 0) {
    errors.honeypot = 'Automated submission rejected.';
    return { valid: false, errors };
  }

  if (step === 1) {
    if (!data.inquiryType.trim()) {
      errors.inquiryType = 'Please select an inquiry type.';
    }
  } else if (step === 2) {
    if (!data.gemType.trim()) {
      errors.gemType = 'Please select a gemstone type.';
    }
    if (!data.caratRange.trim()) {
      errors.caratRange = 'Please indicate an approximate carat range.';
    }
  } else if (step === 3 || step === 4) {
    if (!data.name.trim()) errors.name = 'Full name is required.';
    if (!data.country.trim()) errors.country = 'Country is required.';
    if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Please enter a valid email address.';
    if (!data.phone.trim()) errors.phone = 'Phone or WhatsApp number is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCareerForm(data: CareerFormData): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Valid email address is required.';
  if (!data.phone.trim()) errors.phone = 'Phone number is required.';
  if (!data.position.trim()) errors.position = 'Please choose a position.';
  if (!data.city.trim()) errors.city = 'City is required.';
  if (!data.coverNote.trim() || data.coverNote.trim().length < 20) {
    errors.coverNote = 'Please include a brief cover note (at least 20 characters).';
  }
  if (data.cvFileName) {
    const ext = data.cvFileName.toLowerCase().split('.').pop() || '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      errors.cv = 'CV must be a PDF, DOC, or DOCX file.';
    } else if (data.cvFileSizeBytes > 5 * 1024 * 1024) {
      errors.cv = 'CV file size must not exceed 5 MB.';
    }
  }
  if (!data.consent) {
    errors.consent = 'Please confirm consent to review your application.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Name is required.';
  if (!EMAIL_RE.test(data.email.trim())) errors.email = 'Valid email address is required.';
  if (!data.subject.trim()) errors.subject = 'Subject is required.';
  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Please enter a message (at least 10 characters).';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildMailtoFallback(subject: string, lines: Array<[string, string]>): string {
  const body = lines.map(([k, v]) => `${k}: ${v}`).join('\n');
  return `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function isFormEndpointConfigured(): boolean {
  return (
    PLACEHOLDERS.formEndpoint.startsWith('https://') &&
    !PLACEHOLDERS.formEndpoint.includes('PLACEHOLDER')
  );
}

export function buildInquiryPrefillQuery(params: {
  gem?: string;
  shape?: GemCut;
  type?: string;
  carat?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.gem) sp.set('gem', params.gem);
  if (params.shape) sp.set('shape', params.shape);
  if (params.type) sp.set('type', params.type);
  if (params.carat) sp.set('carat', params.carat);
  const qs = sp.toString();
  return qs ? `/inquiries?${qs}` : '/inquiries';
}
