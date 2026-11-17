import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { AnimatePresence, motion } from 'motion/react';
import { prefersReducedMotion } from './utils/webglHelpers';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GemSVG } from './components/GemSVG';
import { CustomCursor, GemLoadingScreen } from './components/MotionPrimitives';

// Lazy-loaded page routes for optimal bundle splitting
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const GemTypesPage = lazy(() => import('./pages/GemTypesPage').then((m) => ({ default: m.GemTypesPage })));
const GemsInSriLankaPage = lazy(() => import('./pages/GemsInSriLankaPage').then((m) => ({ default: m.GemsInSriLankaPage })));
const GemIndustryPage = lazy(() => import('./pages/GemIndustryPage').then((m) => ({ default: m.GemIndustryPage })));
const GlobalMarketPage = lazy(() => import('./pages/GlobalMarketPage').then((m) => ({ default: m.GlobalMarketPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const CareersPage = lazy(() => import('./pages/CareersPage').then((m) => ({ default: m.CareersPage })));
const InquiriesPage = lazy(() => import('./pages/InquiriesPage').then((m) => ({ default: m.InquiriesPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const ScrollProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-gradient-to-r from-[#1B3FD9] via-[#3D7BFF] to-[#E6EAF0]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#05070D]">
    <GemSVG cut="cushion" size={64} label="Loading view" />
    <p className="text-xs tracking-[0.26em] uppercase text-[#C9D1DC]/70">Loading</p>
  </div>
);

const AppShell: React.FC = () => {
  const location = useLocation();
  const reduced = prefersReducedMotion();

  // Scroll to top & initialize smooth Lenis scrolling
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [reduced]);

  return (
    <div className="relative min-h-screen bg-[#05070D] text-[#E6EAF0]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:border focus:border-[#3D7BFF] focus:bg-[#05070D] focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-wider focus:text-white"
      >
        Skip to content
      </a>

      {/* Subtle 3.5% film grain overlay */}
      <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[70] opacity-70" />

      <ScrollProgressBar />
      <GemLoadingScreen />
      <CustomCursor />
      <Header />

      {/* Sapphire Light-Sweep Route Transition */}
      <AnimatePresence mode="wait">
        <motion.main
          id="main-content"
          key={location.pathname}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/gem-types" element={<GemTypesPage />} />
              <Route path="/gems-of-sri-lanka" element={<GemsInSriLankaPage />} />
              <Route path="/gem-industry" element={<GemIndustryPage />} />
              <Route path="/global-market" element={<GlobalMarketPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/inquiries" element={<InquiriesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  );
}
