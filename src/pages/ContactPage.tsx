import React, { useState } from 'react';
import { CheckCircle2, Clock, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { PLACEHOLDERS, SITE_CONFIG } from '../content/siteConfig';
import {
  buildMailtoFallback,
  ContactFormData,
  isFormEndpointConfigured,
  validateContactForm,
} from '../utils/formLogic';
import { Gem3D } from '../components/Gem3D';
import { SplitHeading } from '../components/MotionPrimitives';
import { PageSEO } from '../components/PageSEO';

export const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = validateContactForm(form);
    setErrors(res.errors);
    if (!res.valid) return;

    if (isFormEndpointConfigured()) {
      try {
        await fetch(PLACEHOLDERS.formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formType: 'contact', ...form }),
        });
      } catch {
        // Mailto fallback ready
      }
    }
    setSubmitted(true);
  };

  const mailtoHref = buildMailtoFallback(form.subject || 'Contact — Serendib Reserve', [
    ['Name', form.name],
    ['Email', form.email],
    ['Phone', form.phone],
    ['Message', form.message],
  ]);

  return (
    <div className="min-h-screen bg-[#05070D] pb-24 pt-28">
      <PageSEO
        title="Contact Us — Colombo Headquarters | Serendib Reserve"
        description="Visit or contact Serendib Reserve (Pvt) Ltd at 121 Hunupitiya Lake Rd, Colombo 00200, Sri Lanka. Phone / WhatsApp: +94 71 14 54 935."
      />

      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs tracking-[0.26em] uppercase text-[#3D7BFF]">
            08 · Contact Us
          </p>
          <SplitHeading as="h1" className="mt-3 font-display text-5xl font-light text-white sm:text-6xl">
            Colombo Headquarters
          </SplitHeading>
          <p className="mt-4 text-base text-[#C9D1DC]">
            Private gemstone viewings by appointment in Colombo, or direct consultation via phone, WhatsApp, and email.
          </p>
        </div>

        {/* Split Layout: Left = Animated Sapphire + Details, Right = Compact Contact Form */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col justify-between border border-[#C9D1DC]/18 bg-[#0A1226]/70 p-6 sm:p-8 lg:col-span-6">
            <div className="h-[240px] w-full">
              <Gem3D
                cut="cushion"
                colour="#1B3FD9"
                secondaryColour="#3D7BFF"
                size={1.32}
                rotationSpeed={0.32}
                showCausticPlane
                className="h-full w-full"
                ariaLabel="Animated Ceylon sapphire at Colombo office"
              />
            </div>

            <div className="mt-6 space-y-4 border-t border-[#C9D1DC]/15 pt-6 text-sm">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#C9D1DC]/65">Headquarters</p>
                  <p className="mt-0.5 text-white">{SITE_CONFIG.headquarters.fullAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#C9D1DC]/65">Phone / WhatsApp</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-4">
                    <a href={SITE_CONFIG.phoneHref} className="font-mono-tabular text-white hover:text-[#3D7BFF]">
                      {SITE_CONFIG.phone}
                    </a>
                    <a
                      href={SITE_CONFIG.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#3D7BFF] hover:text-white"
                    >
                      <MessageCircle size={13} aria-hidden="true" />
                      <span>Open WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#C9D1DC]/65">Email</p>
                  <a href={SITE_CONFIG.emailHref} className="mt-0.5 block text-white hover:text-[#3D7BFF]">
                    {SITE_CONFIG.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={18} className="mt-0.5 shrink-0 text-[#3D7BFF]" aria-hidden="true" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#C9D1DC]/65">Business Hours</p>
                  <p className="mt-0.5 font-mono-tabular text-xs text-[#C9D1DC]">
                    {PLACEHOLDERS.businessHours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="border border-[#C9D1DC]/18 bg-[#0A1226]/75 p-6 sm:p-8 lg:col-span-6">
            <p className="text-xs tracking-[0.2em] uppercase text-[#3D7BFF]">Direct Message</p>
            <h2 className="mt-1 font-display text-3xl font-light text-white">Send a Note</h2>

            {submitted ? (
              <div className="mt-8 space-y-4 border border-[#3D7BFF]/40 bg-[#05070D]/80 p-6 text-center">
                <CheckCircle2 size={30} className="mx-auto text-[#3D7BFF]" aria-hidden="true" />
                <h3 className="font-display text-2xl text-white">Message Ready</h3>
                <p className="text-xs text-[#C9D1DC]">
                  Click below to open your email client with this message pre-addressed to {SITE_CONFIG.email}.
                </p>
                <a
                  href={mailtoHref}
                  className="btn-luxury-primary inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-[0.16em] text-white"
                >
                  <Mail size={14} aria-hidden="true" />
                  <span>Send via Email</span>
                </a>
                <div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="text-xs uppercase tracking-wider text-[#C9D1DC] hover:text-white"
                  >
                    Write Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                  />
                  {errors.name && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-email" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    />
                    {errors.email && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                      Phone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                  />
                  {errors.subject && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.subject}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs uppercase tracking-wider text-[#C9D1DC]">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#05070D] px-3.5 py-2.5 text-sm text-white focus:border-[#3D7BFF] focus:outline-none"
                  />
                  {errors.message && <p className="mt-1 text-xs text-[#8FB5FF]">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="btn-luxury-primary w-full py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Dark-Styled Embedded Colombo Map */}
        <section className="mt-14 border border-[#C9D1DC]/18 bg-[#0A1226]/65 p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#3D7BFF]">Location Map</p>
              <p className="font-display text-2xl text-white">{SITE_CONFIG.headquarters.fullAddress}</p>
            </div>
            <a
              href={SITE_CONFIG.headquarters.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-luxury inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-white"
            >
              <span>Get Directions</span>
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          </div>
          <div className="overflow-hidden border border-[#C9D1DC]/15 bg-[#05070D]">
            <iframe
              title="Serendib Reserve Colombo Headquarters Map"
              src={SITE_CONFIG.headquarters.mapsQuery}
              className="dark-map-iframe h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
