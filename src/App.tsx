import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { motion } from 'motion/react';
import { prefersReducedMotion } from './utils/webglHelpers';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { GeminiChatWidget } from './components/GeminiChatWidget';
import { GemSVG } from './components/GemSVG';
import { CustomCursor, GemLoadingScreen } from './components/MotionPrimitives';

// Lazy-loaded existing brand pages
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

// Lazy-loaded Auction Platform pages
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })));
const AuctionsDirectoryPage = lazy(() => import('./pages/AuctionsDirectoryPage').then((m) => ({ default: m.AuctionsDirectoryPage })));
const AuctionDetailPage = lazy(() => import('./pages/AuctionDetailPage').then((m) => ({ default: m.AuctionDetailPage })));
const AccountDashboardPage = lazy(() => import('./pages/AccountDashboardPage').then((m) => ({ default: m.AccountDashboardPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const LoginPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.RegisterPage })));
const VerifyEmailPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.VerifyEmailPage })));
const CompleteProfilePage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.CompleteProfilePage })));
const ForgotPasswordPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.ResetPasswordPage })));

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
        className="h-full origin-left bg-gradient-to-r from-[#1B3FD9] via-[#3D7BFF] to-[#D9AE61]"
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

      <div aria-hidden="true" className="film-grain pointer-events-none fixed inset-0 z-[70] opacity-70" />

      <ScrollProgressBar />
      <GemLoadingScreen />
      <CustomCursor />
      <Header />

      <ErrorBoundary>
        <motion.main
          id="main-content"
          key={location.pathname}
          initial={reduced ? false : { opacity: 0.01 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<RouteFallback />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />

              {/* Auction Platform Routes */}
              <Route path="/auctions" element={<AuctionsDirectoryPage initialMode="all" />} />
              <Route path="/auctions/live" element={<AuctionsDirectoryPage initialMode="live" />} />
              <Route path="/auctions/upcoming" element={<AuctionsDirectoryPage initialMode="upcoming" />} />
              <Route path="/auctions/completed" element={<AuctionsDirectoryPage initialMode="completed" />} />
              <Route path="/auction/:auctionId" element={<AuctionDetailPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/complete-profile" element={<CompleteProfilePage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* User Account Dashboard */}
              <Route path="/account" element={<AccountDashboardPage />} />
              <Route path="/account/profile" element={<AccountDashboardPage />} />
              <Route path="/account/my-bids" element={<AccountDashboardPage />} />
              <Route path="/account/watchlist" element={<AccountDashboardPage />} />
              <Route path="/account/reminders" element={<AccountDashboardPage />} />
              <Route path="/account/notifications" element={<AccountDashboardPage />} />

              {/* Protected Admin Panel */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/auctions" element={<AdminDashboardPage />} />
              <Route path="/admin/auctions/create" element={<AdminDashboardPage />} />
              <Route path="/admin/auctions/edit/:auctionId" element={<AdminDashboardPage />} />
              <Route path="/admin/bids" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminDashboardPage />} />
              <Route path="/admin/subscribers" element={<AdminDashboardPage />} />
              <Route path="/admin/results" element={<AdminDashboardPage />} />
              <Route path="/admin/notifications" element={<AdminDashboardPage />} />
              <Route path="/admin/settings" element={<AdminDashboardPage />} />

              {/* Preserved House & Heritage Pages */}
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
      </ErrorBoundary>

      <Footer />
      <GeminiChatWidget />
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </HashRouter>
  );
}
