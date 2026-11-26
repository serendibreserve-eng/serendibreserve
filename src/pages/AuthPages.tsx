import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageSEO } from '../components/PageSEO';
import { isValidEmailAddress } from '../utils/auctionLogic';

const GoogleMark: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const { signInWithEmail, signInWithGoogle, firebaseUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (firebaseUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [firebaseUser, navigate, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmailAddress(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await signInWithEmail({ email, password, rememberMe });
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      if (res.needsProfileCompletion) {
        navigate(`/complete-profile?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[82vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Sign In — Serendib Reserve Auctions" description="Sign in to bid on certified Ceylon gemstone auctions." />
      <div className="mx-auto max-w-md border border-[#D9AE61]/30 bg-[#05070D]/90 p-7 sm:p-9">
        <p className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#D9AE61]">
          Collector Access
        </p>
        <h1 className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
          Sign In to Your Vault
        </h1>
        <p className="mt-2 text-xs text-[#C9D1DC]/80">
          Authenticate to place live bids, manage upcoming auction reminders, and track your active offers.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogle()}
          className="mt-6 flex w-full items-center justify-center gap-2.5 border border-[#C9D1DC]/30 bg-[#0A1226] py-3 text-xs font-medium tracking-[0.16em] uppercase text-white transition-colors hover:border-[#D9AE61] disabled:opacity-60"
        >
          <GoogleMark />
          <span>Continue with Google</span>
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-[#C9D1DC]/15" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9D1DC]/60">OR</span>
          <div className="h-[1px] flex-1 bg-[#C9D1DC]/15" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex cursor-pointer items-center gap-2 text-[#C9D1DC]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 accent-[#244DCE]"
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-[#D9AE61] hover:underline">
              Forgot Password?
            </Link>
          </div>

          {error && (
            <div className="flex items-start gap-2 border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-luxury-primary flex w-full items-center justify-center gap-2 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:opacity-60"
          >
            <Lock size={14} aria-hidden="true" />
            <span>{busy ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#C9D1DC]/80">
          New to Serendib Reserve Auctions?{' '}
          <Link to="/register" className="font-medium text-[#D9AE61] hover:underline">
            Create Verified Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { registerWithEmail, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [nationality, setNationality] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Full name is required.');
      return;
    }
    if (!isValidEmailAddress(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (contactNumber.trim().length < 6) {
      setError('A valid phone or WhatsApp number is required for bidder verification.');
      return;
    }
    if (nationality.trim().length < 2) {
      setError('Nationality / Country is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      await registerWithEmail({
        fullName,
        email,
        password,
        contactNumber,
        nationality,
        companyName,
      });
      navigate('/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to register account.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await signInWithGoogle();
      navigate(res.needsProfileCompletion ? '/complete-profile' : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google registration failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Create Account — Serendib Reserve Auctions" description="Register for verified live gemstone auction participation." />
      <div className="mx-auto max-w-lg border border-[#D9AE61]/30 bg-[#05070D]/90 p-7 sm:p-9">
        <p className="text-[11px] font-medium tracking-[0.24em] uppercase text-[#D9AE61]">
          Bidder Registration
        </p>
        <h1 className="mt-2 font-display text-3xl font-light text-white sm:text-4xl">
          Register for Live Bidding
        </h1>
        <p className="mt-2 text-xs text-[#C9D1DC]/80">
          Verified contact details protect auction integrity across all global buyers.
        </p>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handleGoogle()}
          className="mt-5 flex w-full items-center justify-center gap-2.5 border border-[#C9D1DC]/30 bg-[#0A1226] py-3 text-xs font-medium tracking-[0.16em] uppercase text-white transition-colors hover:border-[#D9AE61] disabled:opacity-60"
        >
          <GoogleMark />
          <span>Sign Up with Google</span>
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-[#C9D1DC]/15" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#C9D1DC]/60">OR EMAIL</span>
          <div className="h-[1px] flex-1 bg-[#C9D1DC]/15" />
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Contact / WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+94 71 ..."
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Nationality / Country *
            </label>
            <input
              type="text"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="Sri Lanka, Switzerland, etc."
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Company / Atelier (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Password * (8+ chars)
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Confirm Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          {error && (
            <div className="sm:col-span-2 flex items-start gap-2 border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-luxury-primary sm:col-span-2 mt-1 flex items-center justify-center gap-2 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:opacity-60"
          >
            <span>{busy ? 'Creating Account...' : 'Create Account & Send Verification'}</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#C9D1DC]/80">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-[#D9AE61] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const { firebaseUser, resendVerificationEmail, refreshVerificationStatus } = useAuth();
  const [statusMsg, setStatusMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCheck = async () => {
    setBusy(true);
    setStatusMsg('');
    try {
      const verified = await refreshVerificationStatus();
      if (verified) {
        navigate('/account');
      } else {
        setStatusMsg('Email not verified yet. Please click the verification link in your inbox, then check again.');
      }
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Unable to check status.');
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    setStatusMsg('');
    try {
      await resendVerificationEmail();
      setStatusMsg('Verification email sent. Check your inbox and spam folder.');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : 'Failed to resend email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Verify Email — Serendib Reserve" description="Verify your email address to unlock live bidding." />
      <div className="mx-auto max-w-md border border-[#D9AE61]/30 bg-[#05070D]/90 p-8 text-center">
        <Mail size={32} className="mx-auto text-[#D9AE61]" aria-hidden="true" />
        <h1 className="mt-4 font-display text-3xl font-light text-white">Verify Your Email</h1>
        <p className="mt-3 text-sm text-[#C9D1DC]/85">
          {firebaseUser?.email
            ? `A verification link has been dispatched to ${firebaseUser.email}. Email verification is required before placing bids.`
            : 'Please sign in and verify your email address to activate live bidding.'}
        </p>

        {statusMsg && (
          <p className="mt-4 border border-[#3D7BFF]/35 bg-[#102D69]/50 p-3 text-xs text-[#E6EAF0]">
            {statusMsg}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy || !firebaseUser}
            onClick={() => void handleCheck()}
            className="btn-luxury-primary inline-flex items-center justify-center gap-2 py-3 text-xs tracking-[0.18em] uppercase text-white disabled:opacity-50"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>I Have Verified My Email</span>
          </button>
          <button
            type="button"
            disabled={busy || !firebaseUser}
            onClick={() => void handleResend()}
            className="btn-luxury py-3 text-xs tracking-[0.18em] uppercase text-[#E6EAF0] disabled:opacity-50"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    </div>
  );
};

export const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const { firebaseUser, profile, completeOrUpdateProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.fullName || firebaseUser?.displayName || '');
  const [contactNumber, setContactNumber] = useState(profile?.contactNumber || '');
  const [nationality, setNationality] = useState(profile?.nationality || '');
  const [companyName, setCompanyName] = useState(profile?.companyName || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName((prev) => prev || profile.fullName);
      setContactNumber((prev) => prev || profile.contactNumber);
      setNationality((prev) => prev || profile.nationality);
      setCompanyName((prev) => prev || profile.companyName);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !contactNumber.trim() || !nationality.trim()) {
      setError('Full name, contact number, and nationality are required to unlock bidding.');
      return;
    }
    setBusy(true);
    try {
      await completeOrUpdateProfile({
        fullName,
        contactNumber,
        nationality,
        companyName,
      });
      navigate(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Complete Bidder Profile — Serendib Reserve" description="Complete contact and nationality details to participate in live gemstone auctions." />
      <div className="mx-auto max-w-md border border-[#D9AE61]/30 bg-[#05070D]/90 p-8">
        <UserCheck size={28} className="text-[#D9AE61]" aria-hidden="true" />
        <h1 className="mt-3 font-display text-3xl font-light text-white">
          Complete Your Bidder Profile
        </h1>
        <p className="mt-2 text-xs text-[#C9D1DC]/80">
          One final step before you can place bids on Serendib Reserve lots.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Phone / WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+94 71 ..."
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Nationality / Country *
            </label>
            <input
              type="text"
              required
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
              Company / Jewellery House (Optional)
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
            />
          </div>

          {error && (
            <p className="border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-luxury-primary w-full py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:opacity-60"
          >
            {busy ? 'Saving Profile...' : 'Save & Activate Bidding'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const { sendResetEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isValidEmailAddress(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setBusy(true);
    try {
      await sendResetEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to dispatch reset link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Reset Password — Serendib Reserve" description="Request a secure password reset link." />
      <div className="mx-auto max-w-md border border-[#D9AE61]/30 bg-[#05070D]/90 p-8">
        <KeyRound size={28} className="text-[#D9AE61]" aria-hidden="true" />
        <h1 className="mt-3 font-display text-3xl font-light text-white">Forgot Password</h1>
        <p className="mt-2 text-xs text-[#C9D1DC]/80">
          Enter your registered email address and we will send a secure password recovery link.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4 border border-[#D9AE61]/40 bg-[#102D69]/40 p-4 text-xs text-[#F5F3EF]">
            <p className="flex items-center gap-2 font-medium text-[#D9AE61]">
              <CheckCircle2 size={15} aria-hidden="true" />
              Reset Link Dispatched
            </p>
            <p>Check your inbox for instructions to choose a new password.</p>
            <Link to="/login" className="btn-luxury block py-2.5 text-center uppercase tracking-widest text-white">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>

            {error && (
              <p className="border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="btn-luxury-primary w-full py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-white disabled:opacity-60"
            >
              {busy ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode') || '';
  const { verifyResetCode, confirmReset } = useAuth();

  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [codeError, setCodeError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setCodeError('Missing password reset token. Request a fresh link from Forgot Password.');
      return;
    }
    void verifyResetCode(oobCode)
      .then((email) => setVerifiedEmail(email))
      .catch(() => setCodeError('This password reset link is invalid or has expired.'));
  }, [oobCode, verifyResetCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setCodeError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setCodeError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setCodeError('');
    try {
      await confirmReset(oobCode, password);
      setDone(true);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : 'Unable to update password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[75vh] bg-[#07152F] px-4 pb-20 pt-32 sm:px-8">
      <PageSEO title="Set New Password — Serendib Reserve" description="Set a new password for your Serendib Reserve account." />
      <div className="mx-auto max-w-md border border-[#D9AE61]/30 bg-[#05070D]/90 p-8">
        <ShieldCheck size={28} className="text-[#D9AE61]" aria-hidden="true" />
        <h1 className="mt-3 font-display text-3xl font-light text-white">Reset Password</h1>

        {done ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[#D9AE61]">Your password has been updated securely.</p>
            <Link to="/login" className="btn-luxury-primary block py-3 text-center text-xs uppercase tracking-widest text-white">
              Sign In Now
            </Link>
          </div>
        ) : codeError && !verifiedEmail ? (
          <div className="mt-6 space-y-4">
            <p className="border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">{codeError}</p>
            <Link to="/forgot-password" className="btn-luxury block py-3 text-center text-xs uppercase tracking-widest text-white">
              Request New Reset Link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {verifiedEmail && (
              <p className="text-xs text-[#C9D1DC]">Updating password for {verifiedEmail}</p>
            )}
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                New Password (8+ chars)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-[0.16em] uppercase text-[#C9D1DC]">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full border border-[#C9D1DC]/25 bg-[#0A1226]/75 px-3.5 py-2.5 text-sm text-white focus:border-[#D9AE61] focus:outline-none"
              />
            </div>
            {codeError && (
              <p className="border border-rose-400/40 bg-rose-950/40 p-3 text-xs text-rose-200">{codeError}</p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="btn-luxury-primary w-full py-3.5 text-xs uppercase tracking-[0.18em] text-white"
            >
              {busy ? 'Updating...' : 'Save New Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
