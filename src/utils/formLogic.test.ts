import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInquiryPrefillQuery,
  buildMailtoFallback,
  validateCareerForm,
  validateContactForm,
  validateInquiryStep,
  type InquiryFormData,
} from './formLogic';

const baseInquiry: InquiryFormData = {
  inquiryType: 'Buy loose gems',
  gemType: 'Ceylon Blue Sapphire',
  shape: 'cushion',
  caratRange: '2.0 - 3.5 ct',
  colourPreference: 'Royal Blue',
  budgetRange: '$5,000 - $15,000',
  quantity: '1',
  treatmentPreference: 'Unheated preferred',
  name: 'Amaya Perera',
  company: 'Colombo Atelier',
  country: 'Switzerland',
  email: 'amaya@example.com',
  phone: '+94 71 14 54 935',
  preferredContact: 'Email',
  message: 'Looking for an unheated cushion Ceylon sapphire.',
};

test('inquiry validation catches empty fields and honeypot spam', () => {
  const emptyStep1 = validateInquiryStep(1, { ...baseInquiry, inquiryType: '' });
  assert.equal(emptyStep1.valid, false);
  assert.ok(emptyStep1.errors.inquiryType);

  const badEmail = validateInquiryStep(3, { ...baseInquiry, email: 'invalid-email' });
  assert.equal(badEmail.valid, false);
  assert.ok(badEmail.errors.email);

  const spam = validateInquiryStep(1, { ...baseInquiry, honeypot: 'http://spam.bot' });
  assert.equal(spam.valid, false);
  assert.ok(spam.errors.honeypot);

  const ok = validateInquiryStep(3, baseInquiry);
  assert.equal(ok.valid, true);
});

test('career validation enforces CV extension, size limit, and consent', () => {
  const badExt = validateCareerForm({
    fullName: 'Kasun Silva',
    email: 'kasun@example.com',
    phone: '+94711111111',
    position: 'Gemmologist',
    city: 'Colombo',
    portfolioUrl: '',
    yearsExperience: '4',
    coverNote: 'Experienced FGA gemmologist with ratnapura field background.',
    cvFileName: 'resume.exe',
    cvFileSizeBytes: 1024,
    consent: true,
  });
  assert.equal(badExt.valid, false);
  assert.ok(badExt.errors.cv);

  const tooLarge = validateCareerForm({
    fullName: 'Kasun Silva',
    email: 'kasun@example.com',
    phone: '+94711111111',
    position: 'Gemmologist',
    city: 'Colombo',
    portfolioUrl: '',
    yearsExperience: '4',
    coverNote: 'Experienced FGA gemmologist with ratnapura field background.',
    cvFileName: 'cv.pdf',
    cvFileSizeBytes: 6 * 1024 * 1024,
    consent: true,
  });
  assert.equal(tooLarge.valid, false);
  assert.ok(tooLarge.errors.cv);

  const valid = validateCareerForm({
    fullName: 'Kasun Silva',
    email: 'kasun@example.com',
    phone: '+94711111111',
    position: 'Gemmologist',
    city: 'Colombo',
    portfolioUrl: '',
    yearsExperience: '4',
    coverNote: 'Experienced FGA gemmologist with ratnapura field background.',
    cvFileName: 'cv.pdf',
    cvFileSizeBytes: 512 * 1024,
    consent: true,
  });
  assert.equal(valid.valid, true);
});

test('contact validation and prefill query builder work accurately', () => {
  const invalid = validateContactForm({
    name: '',
    email: 'bad',
    phone: '',
    subject: '',
    message: 'hi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.subject);
  assert.ok(invalid.errors.message);

  const prefill = buildInquiryPrefillQuery({
    gem: 'Padparadscha Sapphire',
    shape: 'oval',
    type: 'Buy loose gems',
  });
  assert.equal(
    prefill,
    '/inquiries?gem=Padparadscha+Sapphire&shape=oval&type=Buy+loose+gems',
  );

  const mailto = buildMailtoFallback('Inquiry', [['Stone', 'Blue Sapphire']]);
  assert.ok(mailto.startsWith('mailto:info@serendibreserve.com?subject=Inquiry'));
});
