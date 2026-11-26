import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../services/firebase';
import {
  DEFAULT_PLATFORM_SETTINGS,
  mapUserDoc,
  subscribePlatformSettings,
  subscribePublicAuctions,
  subscribeUserNotifications,
  subscribeUserReminders,
} from '../services/auctionService';
import {
  AUCTION_SCHEMA_LIMITS,
  BOOTSTRAP_ADMIN_EMAIL,
  type AppNotification,
  type Auction,
  type AuctionReminder,
  type NotificationPreferences,
  type PlatformSettings,
  type UserProfile,
} from '../types/auction';
import { getEffectiveAuctionStatus } from '../utils/auctionLogic';
import { getAuthoritativeNowMs, useServerClock } from '../hooks/useServerClock';
import { buildDemoSeedDocuments } from '../content/demoSeedAuctions';

interface RegisterParams {
  fullName: string;
  email: string;
  password: string;
  contactNumber: string;
  nationality: string;
  companyName?: string;
}

interface AuthContextValue {
  authReady: boolean;
  firebaseUser: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  publicAuctions: Auction[];
  auctionsLoaded: boolean;
  isDemoPreviewCatalog: boolean;
  demoPreviewAnchorMs: number;
  liveAuctionsCount: number;
  platformSettings: PlatformSettings;
  demoModeEnabled: boolean;
  userReminders: AuctionReminder[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  serverNowMs: number;
  signInWithGoogle: () => Promise<{ needsProfileCompletion: boolean }>;
  registerWithEmail: (params: RegisterParams) => Promise<void>;
  signInWithEmail: (params: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshVerificationStatus: () => Promise<boolean>;
  sendResetEmail: (email: string) => Promise<void>;
  verifyResetCode: (oobCode: string) => Promise<string>;
  confirmReset: (oobCode: string, newPassword: string) => Promise<void>;
  completeOrUpdateProfile: (data: {
    fullName: string;
    contactNumber: string;
    nationality: string;
    companyName?: string;
    notificationPreferences?: NotificationPreferences;
  }) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const serverNowMs = useServerClock(1000);
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allPublicAuctions, setAllPublicAuctions] = useState<Auction[]>([]);
  const [auctionsLoaded, setAuctionsLoaded] = useState(false);
  const [demoPreviewAnchorMs] = useState<number>(() => getAuthoritativeNowMs());
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(
    DEFAULT_PLATFORM_SETTINGS
  );
  const [userReminders, setUserReminders] = useState<AuctionReminder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Public live/upcoming/completed catalog listener + platform settings listener
  useEffect(() => {
    const unsubAuctions = subscribePublicAuctions(
      (items) => {
        setAllPublicAuctions(items);
        setAuctionsLoaded(true);
      },
      () => {
        setAuctionsLoaded(true);
      }
    );
    const unsubSettings = subscribePlatformSettings(setPlatformSettings);
    return () => {
      unsubAuctions();
      unsubSettings();
    };
  }, []);

  // Auth listener + automatic profile provisioning
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (user) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      setFirebaseUser(user);

      if (!user) {
        setProfile(null);
        setUserReminders([]);
        setNotifications([]);
        setAuthReady(true);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const isBootstrap =
        user.emailVerified &&
        (user.email || '').toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;

      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          const providerId = user.providerData[0]?.providerId === 'password' ? 'password' : 'google';
          await setDoc(userRef, {
            uid: user.uid,
            fullName: (user.displayName || user.email?.split('@')[0] || 'Collector').slice(
              0,
              AUCTION_SCHEMA_LIMITS.fullNameMax
            ),
            email: (user.email || '').toLowerCase().slice(0, 160),
            contactNumber: '',
            nationality: '',
            companyName: '',
            photoURL: (user.photoURL || '').slice(0, 500),
            authProvider: providerId,
            role: isBootstrap ? 'admin' : 'user',
            accountStatus: user.emailVerified ? 'active' : 'pending_verification',
            emailVerified: user.emailVerified,
            profileCompleted: false,
            watchlistAuctionIds: [],
            notificationPreferences: {
              emailReminders: true,
              outbidAlerts: true,
              newAuctionAlerts: true,
              liveStartAlerts: true,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          if (isBootstrap) {
            await setDoc(doc(db, 'admins', user.uid), {
              uid: user.uid,
              email: (user.email || '').toLowerCase(),
              grantedBy: 'bootstrap',
              createdAt: serverTimestamp(),
            });
          }
        } else {
          const existing = mapUserDoc(snap.data() as Record<string, unknown>);
          // Sync email verification transition once user clicks verification link
          if (user.emailVerified && (!existing.emailVerified || existing.accountStatus === 'pending_verification')) {
            await updateDoc(userRef, {
              emailVerified: true,
              accountStatus: existing.accountStatus === 'suspended' ? 'suspended' : 'active',
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        // Defer error cleanly without trapping login flow if doc race occurred
        console.warn('Profile sync warning:', err);
      }

      profileUnsub = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setProfile(mapUserDoc(docSnap.data() as Record<string, unknown>));
          } else {
            setProfile(null);
          }
          setAuthReady(true);
        },
        (error) => {
          setAuthReady(true);
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      );
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Auth-gated private listeners for reminders & notifications
  useEffect(() => {
    if (!authReady || !firebaseUser) {
      setUserReminders([]);
      setNotifications([]);
      return;
    }

    const unsubReminders = subscribeUserReminders(firebaseUser.uid, setUserReminders);
    const unsubNotifications = subscribeUserNotifications(firebaseUser.uid, setNotifications);
    return () => {
      unsubReminders();
      unsubNotifications();
    };
  }, [authReady, firebaseUser]);

  const isAdmin = useMemo(() => {
    if (!firebaseUser || !firebaseUser.emailVerified) return false;
    if ((firebaseUser.email || '').toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) return true;
    return profile?.role === 'admin' && profile.accountStatus === 'active';
  }, [firebaseUser, profile]);

  const demoModeEnabled = platformSettings.demoModeEnabled !== false;

  const fallbackDemoAuctions = useMemo(
    () => buildDemoSeedDocuments(demoPreviewAnchorMs, 'demo_catalog_preview').auctions,
    [demoPreviewAnchorMs]
  );

  const isDemoPreviewCatalog =
    auctionsLoaded && allPublicAuctions.length === 0 && demoModeEnabled;

  const publicAuctions = useMemo(() => {
    if (isDemoPreviewCatalog) {
      return fallbackDemoAuctions;
    }
    return demoModeEnabled
      ? allPublicAuctions
      : allPublicAuctions.filter((a) => !a.isDemo);
  }, [allPublicAuctions, demoModeEnabled, fallbackDemoAuctions, isDemoPreviewCatalog]);

  const liveAuctionsCount = useMemo(
    () =>
      publicAuctions.filter((a) => getEffectiveAuctionStatus(a, serverNowMs) === 'live').length,
    [publicAuctions, serverNowMs]
  );

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isBootstrap =
      user.emailVerified && (user.email || '').toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        fullName: (user.displayName || 'Collector').slice(0, AUCTION_SCHEMA_LIMITS.fullNameMax),
        email: (user.email || '').toLowerCase().slice(0, 160),
        contactNumber: '',
        nationality: '',
        companyName: '',
        photoURL: (user.photoURL || '').slice(0, 500),
        authProvider: 'google',
        role: isBootstrap ? 'admin' : 'user',
        accountStatus: 'active',
        emailVerified: true,
        profileCompleted: false,
        watchlistAuctionIds: [],
        notificationPreferences: {
          emailReminders: true,
          outbidAlerts: true,
          newAuctionAlerts: true,
          liveStartAlerts: true,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (isBootstrap) {
        await setDoc(doc(db, 'admins', user.uid), {
          uid: user.uid,
          email: (user.email || '').toLowerCase(),
          grantedBy: 'bootstrap',
          createdAt: serverTimestamp(),
        });
      }
      return { needsProfileCompletion: true };
    }

    const mapped = mapUserDoc(snap.data() as Record<string, unknown>);
    return { needsProfileCompletion: !mapped.profileCompleted };
  };

  const registerWithEmail = async (params: RegisterParams) => {
    const cred = await createUserWithEmailAndPassword(
      auth,
      params.email.trim(),
      params.password
    );
    await updateProfile(cred.user, {
      displayName: params.fullName.trim().slice(0, AUCTION_SCHEMA_LIMITS.fullNameMax),
    });

    const isBootstrap =
      cred.user.emailVerified &&
      (cred.user.email || '').toLowerCase() === BOOTSTRAP_ADMIN_EMAIL;

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      fullName: params.fullName.trim().slice(0, AUCTION_SCHEMA_LIMITS.fullNameMax),
      email: params.email.trim().toLowerCase().slice(0, 160),
      contactNumber: params.contactNumber.trim().slice(0, AUCTION_SCHEMA_LIMITS.contactNumberMax),
      nationality: params.nationality.trim().slice(0, AUCTION_SCHEMA_LIMITS.nationalityMax),
      companyName: (params.companyName || '').trim().slice(0, AUCTION_SCHEMA_LIMITS.companyNameMax),
      photoURL: '',
      authProvider: 'password',
      role: isBootstrap ? 'admin' : 'user',
      accountStatus: cred.user.emailVerified ? 'active' : 'pending_verification',
      emailVerified: cred.user.emailVerified,
      profileCompleted: Boolean(
        params.fullName.trim() && params.contactNumber.trim() && params.nationality.trim()
      ),
      watchlistAuctionIds: [],
      notificationPreferences: {
        emailReminders: true,
        outbidAlerts: true,
        newAuctionAlerts: true,
        liveStartAlerts: true,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await sendEmailVerification(cred.user);
  };

  const signInWithEmail = async (params: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    await setPersistence(
      auth,
      params.rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    await signInWithEmailAndPassword(auth, params.email.trim(), params.password);
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) throw new Error('Please sign in first.');
    await sendEmailVerification(auth.currentUser);
  };

  const refreshVerificationStatus = async () => {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        emailVerified: true,
        accountStatus: 'active',
        updatedAt: serverTimestamp(),
      });
    }
    return verified;
  };

  const sendResetEmail = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const verifyResetCode = async (oobCode: string) => {
    return verifyPasswordResetCode(auth, oobCode);
  };

  const confirmReset = async (oobCode: string, newPassword: string) => {
    await confirmPasswordReset(auth, oobCode, newPassword);
  };

  const completeOrUpdateProfile = async (data: {
    fullName: string;
    contactNumber: string;
    nationality: string;
    companyName?: string;
    notificationPreferences?: NotificationPreferences;
  }) => {
    if (!auth.currentUser) throw new Error('Authentication required.');
    await updateProfile(auth.currentUser, {
      displayName: data.fullName.trim().slice(0, AUCTION_SCHEMA_LIMITS.fullNameMax),
    });

    const isComplete = Boolean(
      data.fullName.trim() && data.contactNumber.trim() && data.nationality.trim()
    );

    const payload: Record<string, unknown> = {
      fullName: data.fullName.trim().slice(0, AUCTION_SCHEMA_LIMITS.fullNameMax),
      contactNumber: data.contactNumber.trim().slice(0, AUCTION_SCHEMA_LIMITS.contactNumberMax),
      nationality: data.nationality.trim().slice(0, AUCTION_SCHEMA_LIMITS.nationalityMax),
      companyName: (data.companyName || '').trim().slice(0, AUCTION_SCHEMA_LIMITS.companyNameMax),
      profileCompleted: isComplete,
      emailVerified: auth.currentUser.emailVerified,
      accountStatus: profile?.accountStatus === 'suspended' ? 'suspended' : 'active',
      updatedAt: serverTimestamp(),
    };

    if (data.notificationPreferences) {
      payload.notificationPreferences = data.notificationPreferences;
    }

    await updateDoc(doc(db, 'users', auth.currentUser.uid), payload);
  };

  const signOutUser = async () => {
    await signOut(auth);
  };

  const value: AuthContextValue = {
    authReady,
    firebaseUser,
    profile,
    isAdmin,
    publicAuctions,
    auctionsLoaded,
    isDemoPreviewCatalog,
    demoPreviewAnchorMs,
    liveAuctionsCount,
    platformSettings,
    demoModeEnabled,
    userReminders,
    notifications,
    unreadNotificationsCount,
    serverNowMs,
    signInWithGoogle,
    registerWithEmail,
    signInWithEmail,
    resendVerificationEmail,
    refreshVerificationStatus,
    sendResetEmail,
    verifyResetCode,
    confirmReset,
    completeOrUpdateProfile,
    signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return ctx;
}
