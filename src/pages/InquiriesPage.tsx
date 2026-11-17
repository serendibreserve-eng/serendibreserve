import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { INQUIRY_FAQS } from '../content/faqs';
import { GEMS_DATA, GemCut } from '../content/gems';
import { PLACEHOLDERS } from '../content/siteConfig';
import { ALL_GEM_CUTS } from '../utils/gemGeometryFactory';
import {
  buildMailtoFallback,
  InquiryFormData,
  isFormEndpointConfigured,
  validateInquiryStep,
} from '../utils/formLogic';
import { Gem3D } from '../components/Gem3D';
import { GemSVG } from '../components/GemSVG';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

const INQUIRY_TYPES = [
  'Buy loose gems',
  'Wholesale & trade',
  'Custom jewellery',
  'Certification',
  'Partnership',
  'Other',
];

export const InquiriesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [openFaq, setOpenFaq] = useState<string | null>(INQUIRY_FAQS[0].id);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<InquiryFormData>({
    inquiryType: 'Buy loose gems',
    gemType: 'Ceylon Blue Sapphire',
    shape: 'cushion',
    caratRange: '2.0 – 4.0 ct',
    colourPreference: 'Royal / Cornflower Blue',
    budgetRange: 'To be discussed',
    quantity: '1 stone',
    treatmentPreference: 'Unheated preferred',
    name: '',
    company: '',
    country: '',
    email: '',
    phone: '',
    preferredContact: 'Email / WhatsApp',
    message: '',
    honeypot: '',
  });

  useEffect(() => {
    const gem = searchParams.get('gem');
    const shape = searchParams.get('shape') as GemCut | null;
    const type = searchParams.get('type');
    const carat = searchParams.get('carat');

    setForm((prev) => ({
      ...prev,
      gemType: gem || prev.gemType,
      shape: shape && ALL_GEM_CUTS.includes(shape) ? shape : prev.shape,
      inquiryType: type || prev.inquiryType,
      caratRange: carat || prev.caratRange,
    }));
  }, [searchParams]);

  const matchedGemSpec =
    GEMS_DATA.find((g) => g.name.toLowerCase() === form.gemType.toLowerCase()) || GEMS_DATA[0];

  const handleNext = () => {
    const res = validateInquiryStep(step, form);
    setErrors(res.errors);
    if (res.valid) setStep((s) => Math.min(4, s + 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateInquiryStep(4, form);
    setErrors(res.errors);
    if (!res.valid) return;

    if (isFormEndpointConfigured()) {
      try {
        await fetch(PLACEHOLDERS.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formType: 'inquiry', ...form }),
        });
      } catch {
        // Fallback mailto remains available
      }
    }
    setSubmitted(true);
  };

  const mailtoHref = buildMailtoFallback(`Gemstone Inquiry — ${form.gemType}`, [
    ['Inquiry Type', form.inquiryType],
    ['Gemstone', form.gemType],
    ['Cut / Shape', form.shape],
    ['Carat Range', form.caratRange],
    ['Colour Preference', form.colourPreference],
    ['Treatment Preference', form.treatmentPreference],
    ['Quantity', form.quantity],
    ['Budget Range', form.budgetRange],
    ['Client Name', form.name],
    ['Company', form.company],
    ['Country', form.country],
    ['Email', form.email],
    ['Phone / WhatsApp', form.phone],
    ['Preferred Contact', form.preferredContact],
    ['Notes', form.message],
  ]);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Gemstone Inquiries — Request a Stone | Serendib Reserve"
        description="Submit a bespoke loose gemstone, wholesale parcel, or custom jewellery inquiry directly to Serendib Reserve in Colombo."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
            07 · Inquiries
          </p>
          <SplitHeading as="h1" className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
            Tell Us What You’re Looking For.
          </SplitHeading>
          <p className="mt-4 text-base text-[#C9D1DC]">
            Configure your desired species and cut below. Our live stone preview adapts as you refine your specifications.
          </p>
        </div>

        {/* Multi-Step Form + Live 3D Gem Preview */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Live 3D Gem Preview */}
          <div className="flex flex-col justify-between border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 lg:col-span-5">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Live Stone Preview</p>
              <h2 className="mt-1 font-display text-3xl font-light text-white">{form.gemType}</h2>
              <p className="mt-1 text-xs uppercase tracking-wider text-[#C9D1DC]">
                Cut: {form.shape} · {form.caratRange}
              </p>
            </div>

            <div className="my-4 h-[290px] w-full sm:h-[340px]">
              <Gem3D
                cut={form.shape}
                colour={matchedGemSpec.colorHex}
                secondaryColour={matchedGemSpec.secondaryColorHex}
                effect={matchedGemSpec.effect}
                ior={matchedGemSpec.ior}
                size={1.4}
                interactive
                showCausticPlane
                className="h-full w-full"
                ariaLabel={`Live preview of ${form.gemType} in ${form.shape} cut`}
              />
            </div>

            {/* 4-Facet Progress Indicator */}
            <div className="border-t border-[#C9D1DC]/15 pt-4">
              <div className="flex items-center justify-between text-[11px] tracking-[0.18em] uppercase text-[#C9D1DC]/75">
                <span>Step {step} of 4</span>
                <span>{form.inquiryType}</span>
              </div>
              <div className="mt-3 flex items-center gap-3" aria-label="Form progress">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex flex-1 items-center gap-2">
                    <span
                      className={`h-3 w-3 rotate-45 border transition-colors ${
                        n <= step
                          ? 'border-[#3D7BFF] bg-[#3D7BFF]'
                          : 'border-[#C9D1DC]/30 bg-transparent'
                      }`}
                    />
                    <span className="h-[1px] flex-1 bg-[#C9D1DC]/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: 4-Step Interactive Wizard */}
          <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/75 p-6 sm:p-8 lg:col-span-7">
            {submitted ? (
              <div className="space-y-6 py-8 text-center">
                <div className="flex justify-center">
                  <GemSVG
                    cut={form.shape}
                    colorHex={matchedGemSpec.colorHex}
                    secondaryColorHex="#FFFFFF"
                    size={96}
                    label="Inquiry Confirmed"
                  />
                </div>
                <CheckCircle2 size={32} className="mx-auto text-[#3D7BFF]" aria-hidden="true" />
                <h2 className="font-display text-4xl font-light text-white">
                  Inquiry Dossier Ready
                </h2>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-[#C9D1DC]">
                  {isFormEndpointConfigured()
                    ? 'Thank you. Your gemstone inquiry has been transmitted to our Colombo desk.'
                    : 'Your inquiry summary is compiled below. Because the form endpoint placeholder in siteConfig.ts is not yet linked to a live relay, click below to dispatch it directly via email.'}
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-2">
                  <a
                    href={mailtoHref}
                    className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs tracking-[0.18em] uppercase text-white"
                  >
                    <Mail size={14} aria-hidden="true" />
                    <span>Send Inquiry via Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setStep(1);
                    }}
                    className="btn-luxury px-6 py-3 text-xs tracking-[0.18em] uppercase text-[#C9D1DC]"
                  >
                    New Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Hidden honeypot field */}
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.honeypot}
                  onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                  className="hidden"
                  aria-hidden="true"
                />

                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="font-display text-3xl font-light text-white">
                      01. Select Inquiry Type
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {INQUIRY_TYPES.map((t) => {
                        const selected = form.inquiryType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setForm({ ...form, inquiryType: t })}
                            className={`border p-4 text-left text-sm transition-all ${
                              selected
                                ? 'border-[#3D7BFF] bg-[#1B3FD9]/25 text-white'
                                : 'border-[#C9D1DC]/20 bg-[#05070D]/70 text-[#C9D1DC] hover:border-[#C9D1DC]/50'
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    {errors.inquiryType && <p className="text-xs text-[#8FB5FF]">{errors.inquiryType}</p>}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-3xl font-light text-white">
                      02. Gemstone Specifications
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="inq-gem" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Gem Type *
                        </label>
                        <select
                          id="inq-gem"
                          value={form.gemType}
                          onChange={(e) => {
                            const nextName = e.target.value;
                            const spec = GEMS_DATA.find((g) => g.name === nextName);
                            setForm({
                              ...form,
                              gemType: nextName,
                              shape: spec ? spec.cut : form.shape,
                            });
                          }}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        >
                          {GEMS_DATA.map((g) => (
                            <option key={g.id} value={g.name}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="inq-shape" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Shape / Cut
                        </label>
                        <select
                          id="inq-shape"
                          value={form.shape}
                          onChange={(e) => setForm({ ...form, shape: e.target.value as GemCut })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm capitalize text-white focus:border-[#3D7BFF] focus:outline-none"
                        >
                          {ALL_GEM_CUTS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="inq-carat" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Approx. Carat Range *
                        </label>
                        <input
                          id="inq-carat"
                          type="text"
                          value={form.caratRange}
                          onChange={(e) => setForm({ ...form, caratRange: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                        {errors.caratRange && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.caratRange}</p>}
                      </div>

                      <div>
                        <label htmlFor="inq-colour" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Colour Preference
                        </label>
                        <input
                          id="inq-colour"
                          type="text"
                          value={form.colourPreference}
                          onChange={(e) => setForm({ ...form, colourPreference: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="inq-budget" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Budget Range (Optional)
                        </label>
                        <input
                          id="inq-budget"
                          type="text"
                          value={form.budgetRange}
                          onChange={(e) => setForm({ ...form, budgetRange: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label htmlFor="inq-qty" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Quantity
                        </label>
                        <input
                          id="inq-qty"
                          type="text"
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="inq-treatment" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Treatment Preference
                        </label>
                        <select
                          id="inq-treatment"
                          value={form.treatmentPreference}
                          onChange={(e) => setForm({ ...form, treatmentPreference: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        >
                          <option value="Unheated preferred">Unheated / Untreated Preferred</option>
                          <option value="Standard thermal heating acceptable">Standard Thermal Heating Acceptable (Disclosed)</option>
                          <option value="Open to options with certificate">Open to Options with Lab Report</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="font-display text-3xl font-light text-white">
                      03. Your Contact Details
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="inq-name" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Full Name *
                        </label>
                        <input
                          id="inq-name"
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                        {errors.name && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="inq-company" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Company / Atelier
                        </label>
                        <input
                          id="inq-company"
                          type="text"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="inq-country" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Country *
                        </label>
                        <input
                          id="inq-country"
                          type="text"
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                        {errors.country && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.country}</p>}
                      </div>
                      <div>
                        <label htmlFor="inq-email" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Email *
                        </label>
                        <input
                          id="inq-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                        {errors.email && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="inq-phone" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Phone / WhatsApp *
                        </label>
                        <input
                          id="inq-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                        {errors.phone && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.phone}</p>}
                      </div>
                      <div>
                        <label htmlFor="inq-pref" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Preferred Contact Method
                        </label>
                        <select
                          id="inq-pref"
                          value={form.preferredContact}
                          onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        >
                          <option value="Email / WhatsApp">Email / WhatsApp</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Email">Email</option>
                          <option value="Phone Call">Phone Call</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="inq-msg" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                          Additional Notes
                        </label>
                        <textarea
                          id="inq-msg"
                          rows={3}
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="font-display text-3xl font-light text-white">
                      04. Review & Send
                    </h2>
                    <dl className="grid grid-cols-1 gap-3 border border-[#C9D1DC]/15 bg-[#05070D]/75 p-5 text-xs sm:grid-cols-2">
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Inquiry Type</dt>
                        <dd className="mt-0.5 text-white">{form.inquiryType}</dd>
                      </div>
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Gemstone & Cut</dt>
                        <dd className="mt-0.5 capitalize text-white">{form.gemType} · {form.shape}</dd>
                      </div>
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Carat & Treatment</dt>
                        <dd className="mt-0.5 text-white">{form.caratRange} · {form.treatmentPreference}</dd>
                      </div>
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Client</dt>
                        <dd className="mt-0.5 text-white">{form.name} ({form.country})</dd>
                      </div>
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Email & Phone</dt>
                        <dd className="mt-0.5 text-white">{form.email} · {form.phone}</dd>
                      </div>
                      <div>
                        <dt className="text-[#C9D1DC]/65 uppercase">Preferred Contact</dt>
                        <dd className="mt-0.5 text-white">{form.preferredContact}</dd>
                      </div>
                    </dl>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[#C9D1DC]/15 pt-5">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn-luxury inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider text-[#C9D1DC]"
                    >
                      <ArrowLeft size={14} aria-hidden="true" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {step < 4 ? (
                    <button
                      key="inquiry-continue-btn"
                      type="button"
                      onClick={handleNext}
                      className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white"
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      key="inquiry-submit-btn"
                      type="submit"
                      className="btn-luxury-primary inline-flex items-center gap-2 px-7 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white"
                    >
                      <span>Submit Inquiry</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>

        {/* 10-Question FAQ Accordion */}
        <section className="mt-24 border-t border-[#C9D1DC]/12 pt-16">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.24em] uppercase text-[#3D7BFF]">Frequently Asked</p>
            <SplitHeading className="mt-2 font-display text-4xl font-light text-white">
              Provenance, Testing & Trade Questions
            </SplitHeading>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2">
            {INQUIRY_FAQS.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div key={faq.id} className="border border-[#C9D1DC]/15 bg-[#0A1226]/60">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  >
                    <span className="text-sm font-medium text-white">{faq.question}</span>
                    <span className="shrink-0 text-[#C9D1DC]">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="border-t border-[#C9D1DC]/12 px-5 pb-5 pt-3 text-xs leading-relaxed text-[#C9D1DC]/90">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
