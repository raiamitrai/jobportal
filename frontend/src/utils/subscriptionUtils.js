/**
 * Careonix Recruiter Subscription & Feature Unlock Utilities
 * Allows recruiters to bypass admin approval wait-time with time-based subscriptions.
 */

export const BASE_RECRUITER_PLANS = [
  {
    id: 'plan-7d',
    name: '7-Day Fast Trial',
    tagline: 'Quick access for urgent hiring needs',
    price: 499,
    originalPrice: null,
    priceDisplay: '₹499',
    durationDays: 7,
    durationLabel: '7 Days',
    maxJobPosts: 5,
    popular: false,
    badgeColor: '#f59e0b',
    features: [
      'Instant access to all locked features',
      'Post up to 5 active job vacancies',
      'Browse verified candidate talent directory',
      'Direct candidate messaging (15 conversations)',
      'Real-time applicant status tracking',
      'Standard email support'
    ]
  },
  {
    id: 'plan-30d',
    name: '30-Day Monthly Pro',
    tagline: 'Most popular for startups and scaling teams',
    price: 1999,
    originalPrice: null,
    priceDisplay: '₹1,999',
    durationDays: 30,
    durationLabel: '30 Days / 1 Month',
    maxJobPosts: 25,
    popular: true,
    badgeColor: '#7c3aed',
    features: [
      'Instant 30-day full platform unlock',
      'Post up to 25 active job vacancies',
      'Unlimited candidate directory search & filters',
      'Unlimited direct candidate messaging',
      'Priority AI candidate smart-matching',
      'Custom company branding on job posts',
      '24/7 priority support'
    ]
  },
  {
    id: 'plan-90d',
    name: '90-Day Quarterly Growth',
    tagline: 'Best value for continuous quarterly hiring',
    price: 4999,
    originalPrice: null,
    priceDisplay: '₹4,999',
    durationDays: 90,
    durationLabel: '90 Days / 3 Months',
    maxJobPosts: 100,
    popular: false,
    badgeColor: '#059669',
    features: [
      'Instant 90-day full platform unlock',
      'Post up to 100 active job vacancies',
      'Unlimited candidate search & resume downloads',
      'Team collaboration (up to 3 recruiter seats)',
      'Advanced recruitment analytics & reports',
      'Automated candidate interview scheduling',
      'Dedicated talent advisor assistance'
    ]
  },
  {
    id: 'plan-365d',
    name: '365-Day Annual Enterprise',
    tagline: 'Complete year-round recruitment solution',
    price: 14999,
    originalPrice: null,
    priceDisplay: '₹14,999',
    durationDays: 365,
    durationLabel: '365 Days / 1 Year',
    maxJobPosts: 999,
    popular: false,
    badgeColor: '#2563eb',
    features: [
      'Full 1 Year uninterrupted unlock',
      'Unlimited job vacancy postings',
      'Unlimited candidate talent directory access',
      'Verified Recruiter Gold Badge on profile',
      'Custom candidate pre-screening tests',
      'Dedicated Account Manager & Phone Support',
      '90-Day hiring replacement guarantee'
    ]
  }
];

export const PLANS_STORAGE_KEY = 'careonix_admin_plan_prices';
export const COUPONS_STORAGE_KEY = 'careonix_subscription_coupons';

/**
 * Returns dynamic plans with Admin configured prices and offers
 */
export function getEffectivePlans() {
  try {
    const saved = localStorage.getItem(PLANS_STORAGE_KEY);
    if (saved) {
      const overrides = JSON.parse(saved);
      return BASE_RECRUITER_PLANS.map(p => {
        const o = overrides[p.id] || {};
        const effectivePrice = o.price != null ? Number(o.price) : p.price;
        return {
          ...p,
          ...o,
          price: effectivePrice,
          originalPrice: o.originalPrice != null ? Number(o.originalPrice) : (p.originalPrice || null),
          priceDisplay: `₹${effectivePrice.toLocaleString('en-IN')}`,
          maxJobPosts: o.maxJobPosts != null ? Number(o.maxJobPosts) : p.maxJobPosts,
          tagline: o.tagline || p.tagline,
          offerBadge: o.offerBadge || ''
        };
      });
    }
  } catch (e) {}
  return BASE_RECRUITER_PLANS;
}

export const RECRUITER_PLANS = BASE_RECRUITER_PLANS;

export function saveAdminPlans(plans) {
  const overrides = {};
  plans.forEach(p => {
    overrides[p.id] = {
      price: p.price,
      originalPrice: p.originalPrice || null,
      maxJobPosts: p.maxJobPosts,
      tagline: p.tagline,
      popular: p.popular,
      offerBadge: p.offerBadge || ''
    };
  });

  // 1. Save locally
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('careonix_plans_updated'));

  // 2. Push to central server (/api/shared-plans) so other browser profiles/incognito sync instantly
  try {
    fetch('/api/shared-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(overrides)
    }).catch(() => {});
  } catch (e) {}
}

export function getCoupons() {
  try {
    const raw = localStorage.getItem(COUPONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCoupons(list) {
  // 1. Save locally
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('careonix_coupons_updated'));

  // 2. Push to central server (/api/shared-coupons)
  try {
    fetch('/api/shared-coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list)
    }).catch(() => {});
  } catch (e) {}
}

// ── Real-time Cross-Browser Plan & Coupon Synchronizer ──
let hasStartedSync = false;
export function initCrossBrowserPricingSync() {
  if (hasStartedSync || typeof window === 'undefined') return;
  hasStartedSync = true;

  const fetchAndSync = async () => {
    // 1. Sync Plans from Central Server
    try {
      const res = await fetch('/api/shared-plans', {
        headers: { 'Accept': 'application/json' },
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      }).catch(() => null);

      if (res && res.ok) {
        const serverOverrides = await res.json();
        if (serverOverrides && typeof serverOverrides === 'object' && Object.keys(serverOverrides).length > 0) {
          const currentStr = localStorage.getItem(PLANS_STORAGE_KEY);
          const newStr = JSON.stringify(serverOverrides);
          if (currentStr !== newStr) {
            localStorage.setItem(PLANS_STORAGE_KEY, newStr);
            window.dispatchEvent(new Event('careonix_plans_updated'));
          }
        }
      }
    } catch (e) {}

    // 2. Sync Coupons from Central Server
    try {
      const cRes = await fetch('/api/shared-coupons', {
        headers: { 'Accept': 'application/json' },
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      }).catch(() => null);

      if (cRes && cRes.ok) {
        const serverCoupons = await cRes.json();
        if (Array.isArray(serverCoupons) && serverCoupons.length > 0) {
          const currentCStr = localStorage.getItem(COUPONS_STORAGE_KEY);
          const newCStr = JSON.stringify(serverCoupons);
          if (currentCStr !== newCStr) {
            localStorage.setItem(COUPONS_STORAGE_KEY, newCStr);
            window.dispatchEvent(new Event('careonix_coupons_updated'));
          }
        }
      }
    } catch (e) {}
  };

  fetchAndSync();
  setInterval(fetchAndSync, 1500); // 1.5s live sync poller across tabs/browsers
}

// Auto-start sync immediately
initCrossBrowserPricingSync();


/**
 * Validates a coupon code against a plan and returns the discounted price calculation
 */
export function validateAndApplyCoupon(code, plan) {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Please enter a coupon code' };
  }
  const cleanCode = code.toUpperCase().trim();
  const coupons = getCoupons();
  const coupon = coupons.find(c => (c.code || '').toUpperCase() === cleanCode);

  if (!coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  if (!coupon.active) {
    return { valid: false, error: 'This coupon has been disabled' };
  }

  if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
    return { valid: false, error: 'This coupon has expired' };
  }

  if (coupon.maxUses != null && (coupon.usedCount || 0) >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its maximum usage limit' };
  }

  if (coupon.planId && coupon.planId !== 'all' && coupon.planId !== plan.id) {
    return { valid: false, error: `This coupon is only valid for the specific plan: ${coupon.planId}` };
  }

  const basePrice = Number(plan.price) || 0;
  let discountAmount = 0;

  if (coupon.type === 'percent') {
    discountAmount = Math.round((basePrice * Number(coupon.value)) / 100);
  } else {
    discountAmount = Math.min(basePrice, Number(coupon.value) || 0);
  }

  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    valid: true,
    coupon,
    discountAmount,
    basePrice,
    finalPrice,
    finalPriceDisplay: `₹${finalPrice.toLocaleString('en-IN')}`,
    discountDisplay: `₹${discountAmount.toLocaleString('en-IN')}`,
    description: coupon.description || `${coupon.value}${coupon.type === 'percent' ? '%' : '₹'} discount applied`
  };
}

export function incrementCouponUsage(code) {
  if (!code) return;
  const cleanCode = code.toUpperCase().trim();
  const coupons = getCoupons();
  const updated = coupons.map(c => {
    if ((c.code || '').toUpperCase() === cleanCode) {
      return { ...c, usedCount: (c.usedCount || 0) + 1 };
    }
    return c;
  });
  saveCoupons(updated);
}

const STORAGE_KEY = 'careonix_recruiter_subscriptions';

/**
 * Get active recruiter subscription by email
 */
export function getRecruiterSubscription(email) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allSubs = raw ? JSON.parse(raw) : {};
    const sub = allSubs[cleanEmail];

    if (!sub) return null;

    const now = new Date();
    const expiry = new Date(sub.expiryDate);
    const isExpired = now >= expiry;

    const diffMs = Math.max(0, expiry.getTime() - now.getTime());
    const daysRemaining = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    const status = isExpired ? 'EXPIRED' : 'ACTIVE';

    return {
      ...sub,
      status,
      isExpired,
      daysRemaining,
      hoursRemaining,
      formattedExpiry: expiry.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  } catch (e) {
    console.error('Error reading recruiter subscription:', e);
    return null;
  }
}

/**
 * Checks if a recruiter is unlocked:
 * PRIORITY ORDER:
 *   1. Active paid subscription → ALWAYS unlocked (overrides admin pending/rejected)
 *   2. Admin Approved (and no active sub) → unlocked
 *   3. Pending / Rejected / No sub → locked
 */
export function isRecruiterUnlocked(user) {
  if (!user) return false;

  const role = (user.role || '').toLowerCase();
  const accountType = (user.accountType || '').toLowerCase();
  const isRecruiter = role === 'recruiter' || accountType === 'recruiter' || Boolean(user.company);

  if (!isRecruiter) return true; // Candidates / Admin — no lock

  // ── PRIORITY 1: Active paid subscription (beats admin pending/rejected) ──
  const sub = getRecruiterSubscription(user.email || user.identifier);
  if (sub && sub.status === 'ACTIVE' && !sub.isExpired) {
    return true;
  }

  // ── PRIORITY 2: Admin Approval ──
  const status = (user.approvalStatus || '').toUpperCase();
  if (status === 'APPROVED' || status === 'VERIFIED') {
    return true;
  }

  return false;
}

/**
 * Activates or renews a subscription for a recruiter
 */
export function subscribeRecruiter(email, planIdOrObject, customDays = null, paymentDetails = {}) {
  if (!email) return null;
  const cleanEmail = email.toLowerCase().trim();

  let plan = typeof planIdOrObject === 'string'
    ? RECRUITER_PLANS.find(p => p.id === planIdOrObject) || RECRUITER_PLANS[1]
    : planIdOrObject;

  const durationDays = customDays || plan.durationDays || 30;
  const now = new Date();
  const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const newSub = {
    id: `SUB-${Date.now()}`,
    email: cleanEmail,
    planId: plan.id,
    planName: plan.name,
    durationDays,
    startDate: now.toISOString(),
    expiryDate: expiry.toISOString(),
    amountPaid: plan.price || 0,
    currency: 'INR',
    paymentMethod: paymentDetails.method || 'Instant UPI / Card',
    transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    maxJobPosts: plan.maxJobPosts || 25,
    status: 'ACTIVE',
    createdAt: now.toISOString()
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allSubs = raw ? JSON.parse(raw) : {};
    allSubs[cleanEmail] = newSub;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubs));

    // Save transaction to history
    const histRaw = localStorage.getItem('careonix_subscription_history');
    const hist = histRaw ? JSON.parse(histRaw) : [];
    hist.unshift(newSub);
    localStorage.setItem('careonix_subscription_history', JSON.stringify(hist.slice(0, 100)));

    // Notify listeners / active session
    window.dispatchEvent(new Event('careonix_subscription_updated'));
  } catch (e) {
    console.error('Error saving subscription:', e);
  }

  return getRecruiterSubscription(cleanEmail);
}

/**
 * Manually expire or cancel subscription (useful for testing or cancellation)
 */
export function expireRecruiterSubscription(email) {
  if (!email) return;
  const cleanEmail = email.toLowerCase().trim();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allSubs = raw ? JSON.parse(raw) : {};
    if (allSubs[cleanEmail]) {
      allSubs[cleanEmail].expiryDate = new Date(Date.now() - 1000).toISOString();
      allSubs[cleanEmail].status = 'EXPIRED';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubs));
      window.dispatchEvent(new Event('careonix_subscription_updated'));
    }
  } catch (e) {}
}
