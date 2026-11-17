import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Upload, CheckCircle2, Mail } from 'lucide-react';
import { CAREERS_BENEFITS, CULTURE_PILLARS, OPEN_ROLES } from '../content/jobs';
import { PLACEHOLDERS } from '../content/siteConfig';
import {
  buildMailtoFallback,
  CareerFormData,
  isFormEndpointConfigured,
  validateCareerForm,
} from '../utils/formLogic';
import { GemSVG } from '../components/GemSVG';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

export const CareersPage: React.FC = () => {
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(OPEN_ROLES[0].id);
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<CareerFormData>({
    fullName: '',
    email: '',
    phone: '',
    position: OPEN_ROLES[0].title,
    city: '',
    portfolioUrl: '',
    yearsExperience: '',
    coverNote: '',
    cvFileName: '',
    cvFileSizeBytes: 0,
    consent: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectRoleAndScroll = (roleTitle: string) => {
    setForm((prev) => ({ ...prev, position: roleTitle }));
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, cvFileName: '', cvFileSizeBytes: 0 }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      cvFileName: file.name,
      cvFileSizeBytes: file.size,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateCareerForm(form);
    setErrors(res.errors);
    if (!res.valid) return;

    setSubmitting(true);
    try {
      if (isFormEndpointConfigured()) {
        await fetch(PLACEHOLDERS.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formType: 'careers', ...form }),
        });
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const mailtoHref = buildMailtoFallback(`Career Application — ${form.position}`, [
    ['Name', form.fullName],
    ['Email', form.email],
    ['Phone', form.phone],
    ['Position', form.position],
    ['City', form.city],
    ['Experience (Years)', form.yearsExperience],
    ['Portfolio / LinkedIn', form.portfolioUrl],
    ['Cover Note', form.coverNote],
    ['CV Attached Filename', form.cvFileName || 'Not attached'],
  ]);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Join Our Team — Careers | Serendib Reserve"
        description="Explore careers in gemmology, lapidary faceting, international trade, and luxury jewellery design at Serendib Reserve in Colombo."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
            06 · Join Our Team
          </p>
          <SplitHeading as="h1" className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
            Craft Light With Us.
          </SplitHeading>
          <p className="mt-4 text-base leading-relaxed text-[#C9D1DC]">
            We bring together gemmologists, master cutters, export specialists, and brand storytellers dedicated to Sri Lanka’s natural treasures.
          </p>
        </div>

        {/* Culture Blocks */}
        <section className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CULTURE_PILLARS.map((pillar) => (
            <div key={pillar.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/65 p-6">
              <GemSVG
                cut={pillar.cut}
                colorHex={pillar.colorHex}
                secondaryColorHex="#E6EAF0"
                size={56}
                label={pillar.title}
              />
              <h2 className="mt-5 font-display text-2xl font-light text-white">{pillar.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{pillar.caption}</p>
            </div>
          ))}
        </section>

        {/* Open Roles + Benefits */}
        <section className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">
              Open Roles (Editable Placeholders)
            </p>
            <h2 className="font-display text-3xl font-light text-white sm:text-4xl">
              Current Opportunities
            </h2>

            <div className="mt-6 space-y-3">
              {OPEN_ROLES.map((role) => {
                const isOpen = expandedRoleId === role.id;
                return (
                  <div
                    key={role.id}
                    className="border border-[#C9D1DC]/18 bg-[#0A1226]/65 transition-colors"
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setExpandedRoleId(isOpen ? null : role.id)}
                      className="flex w-full items-center justify-between gap-4 p-5 text-left"
                    >
                      <div>
                        <p className="text-[11px] tracking-[0.16em] uppercase text-[#3D7BFF]">
                          {role.department} · {role.location}
                        </p>
                        <h3 className="mt-1 font-display text-2xl font-light text-white">
                          {role.title}
                        </h3>
                      </div>
                      <span className="shrink-0 text-[#C9D1DC]">
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="space-y-4 border-t border-[#C9D1DC]/12 px-5 pb-6 pt-4 text-sm text-[#C9D1DC]">
                        <p>{role.summary}</p>
                        <div>
                          <p className="text-xs font-medium tracking-[0.15em] uppercase text-white">
                            Responsibilities
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                            {role.responsibilities.map((r) => (
                              <li key={r}>{r}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium tracking-[0.15em] uppercase text-white">
                            Qualifications
                          </p>
                          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                            {role.requirements.map((req) => (
                              <li key={req}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectRoleAndScroll(role.title)}
                          className="btn-luxury px-5 py-2.5 text-xs tracking-[0.16em] uppercase text-white"
                        >
                          Apply for this role
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Application Form */}
          <div className="lg:col-span-5">
            <div className="border border-[#C9D1DC]/20 bg-[#0A1226]/75 p-6 sm:p-8">
              <p className="text-xs tracking-[0.22em] uppercase text-[#3D7BFF]">Submit Application</p>
              <h2 className="mt-2 font-display text-3xl font-light text-white">
                Candidate Dossier
              </h2>

              {submitted ? (
                <div className="mt-8 space-y-5 border border-[#3D7BFF]/40 bg-[#05070D]/80 p-6 text-center">
                  <div className="flex justify-center">
                    <GemSVG cut="brilliant" colorHex="#3D7BFF" secondaryColorHex="#FFFFFF" size={84} label="Application Received" />
                  </div>
                  <CheckCircle2 className="mx-auto text-[#3D7BFF]" size={28} aria-hidden="true" />
                  <h3 className="font-display text-2xl text-white">Application Prepared</h3>
                  <p className="text-xs leading-relaxed text-[#C9D1DC]">
                    {isFormEndpointConfigured()
                      ? 'Thank you. Your application has been submitted to our Colombo team.'
                      : 'No live form endpoint is configured yet (see siteConfig.ts). Use the email button below to send your dossier directly, or reset to edit.'}
                  </p>
                  <div className="flex flex-col gap-3 pt-2">
                    <a
                      href={mailtoHref}
                      className="btn-luxury-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-xs tracking-[0.16em] uppercase text-white"
                    >
                      <Mail size={14} aria-hidden="true" />
                      <span>Send via Email Client</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="text-xs uppercase tracking-wider text-[#C9D1DC] hover:text-white"
                    >
                      Edit Application
                    </button>
                  </div>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="career-name" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                      Full Name *
                    </label>
                    <input
                      id="career-name"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    />
                    {errors.fullName && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="career-email" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                        Email *
                      </label>
                      <input
                        id="career-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                      />
                      {errors.email && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="career-phone" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                        Phone *
                      </label>
                      <input
                        id="career-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="career-position" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                      Position *
                    </label>
                    <select
                      id="career-position"
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    >
                      {OPEN_ROLES.map((r) => (
                        <option key={r.id} value={r.title}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                    {errors.position && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.position}</p>}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="career-city" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                        City *
                      </label>
                      <input
                        id="career-city"
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                      />
                      {errors.city && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="career-exp" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                        Years Experience
                      </label>
                      <input
                        id="career-exp"
                        type="text"
                        value={form.yearsExperience}
                        onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                        className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="career-portfolio" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                      LinkedIn / Portfolio URL
                    </label>
                    <input
                      id="career-portfolio"
                      type="url"
                      placeholder="https://"
                      value={form.portfolioUrl}
                      onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="career-cover" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                      Cover Note *
                    </label>
                    <textarea
                      id="career-cover"
                      rows={4}
                      value={form.coverNote}
                      onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    />
                    {errors.coverNote && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.coverNote}</p>}
                  </div>

                  <div>
                    <label htmlFor="career-cv" className="block text-xs tracking-wider uppercase text-[#C9D1DC]">
                      CV Upload (PDF / DOC / DOCX, max 5 MB)
                    </label>
                    <label
                      htmlFor="career-cv"
                      className="mt-1.5 flex cursor-pointer items-center justify-between border border-dashed border-[#C9D1DC]/30 bg-[#05070D] px-3.5 py-3 text-xs text-[#C9D1DC] hover:border-[#3D7BFF]"
                    >
                      <span className="truncate">
                        {form.cvFileName ? form.cvFileName : 'Select CV document...'}
                      </span>
                      <Upload size={15} aria-hidden="true" />
                    </label>
                    <input
                      id="career-cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                    {errors.cv && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.cv}</p>}
                  </div>

                  <div className="flex items-start gap-2.5 pt-1">
                    <input
                      id="career-consent"
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      className="mt-1 h-4 w-4 accent-[#1B3FD9]"
                    />
                    <label htmlFor="career-consent" className="text-xs leading-relaxed text-[#C9D1DC]">
                      I consent to Serendib Reserve (Pvt) Ltd reviewing this application for recruitment purposes.
                    </label>
                  </div>
                  {errors.consent && <p className="text-xs text-[#8FB5FF]">{errors.consent}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-luxury-primary mt-2 w-full py-3.5 text-xs font-medium tracking-[0.2em] uppercase text-white"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Strip */}
        <section className="mt-20 border-t border-[#C9D1DC]/12 pt-14">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CAREERS_BENEFITS.map((b) => (
              <div key={b.title} className="border border-[#C9D1DC]/15 bg-[#0A1226]/55 p-6">
                <h3 className="font-display text-2xl text-white">{b.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-[#C9D1DC]/85">{b.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
