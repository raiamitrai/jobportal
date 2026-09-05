/**
 * Razorpay Payment Integration for Careonix Recruiter Subscriptions
 *
 * FLOW:
 *   1. Frontend calls createRazorpayOrder() → Backend POST /payments/create-order
 *   2. Backend creates Razorpay Order securely → returns order_id
 *   3. Frontend opens Razorpay Checkout with order_id
 *   4. User pays (UPI / Card / NetBanking / Wallet)
 *   5. Razorpay returns payment_id, order_id, signature to frontend
 *   6. Frontend calls verifyPayment() → Backend POST /payments/verify
 *   7. Backend verifies HMAC signature (secure!) → activates subscription in MySQL
 *   8. Features unlock!
 *
 * SETUP (ONE-TIME):
 * 1. Go to https://razorpay.com → Create free account
 * 2. Settings → API Keys → Generate Test Key
 * 3. Set RAZORPAY_KEY_ID in application.properties:
 *    razorpay.key.id=rzp_test_XXXXXXXXXXXXXXXX
 *    razorpay.key.secret=XXXXXXXXXXXXXXXXXXXXXXXX
 *
 * TEST CARDS (no real money):
 *   Card: 4111 1111 1111 1111  |  Expiry: 12/26  |  CVV: 123  |  OTP: 1234
 */

// Backend payment service URL (subscription-service on port 8087)
const PAYMENT_SERVICE_URL = 'http://localhost:8087';

/**
 * Returns whether Razorpay SDK is loaded in browser.
 */
function isRazorpayLoaded() {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
}

/**
 * STEP 1+3: Create Razorpay Order from backend, then open Checkout.
 *
 * @param {Object} options
 * @param {Object} options.plan     - Plan object from RECRUITER_PLANS
 * @param {Object} options.user     - Logged-in user object
 * @param {Function} options.onSuccess  - Called with { paymentId, orderId, signature } on success
 * @param {Function} options.onFailure  - Called with error message on failure
 * @param {Function} options.onDismiss  - Called when user closes the checkout modal
 */
export async function initiateRazorpayPayment({ plan, user, onSuccess, onFailure, onDismiss }) {
  if (!isRazorpayLoaded()) {
    const err = 'Razorpay SDK not loaded. Please refresh the page and try again.';
    if (onFailure) onFailure(err);
    throw new Error(err);
  }

  const userEmail = (user?.email || user?.identifier || '').toLowerCase().trim();
  if (!userEmail) {
    const err = 'User email not found. Please log in again.';
    if (onFailure) onFailure(err);
    throw new Error(err);
  }

  // ── STEP 1: Create Razorpay Order on backend ──────────────────────────────
  let orderData;
  try {
    const res = await fetch(`${PAYMENT_SERVICE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiterEmail: userEmail,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        durationDays: plan.durationDays,
        maxJobPosts: plan.maxJobPosts || 25
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errMsg = errData.detail || errData.error || `Server error ${res.status}`;
      if (onFailure) onFailure(errMsg);
      throw new Error(errMsg);
    }

    orderData = await res.json();
  } catch (fetchErr) {
    // Network error — backend not running
    if (fetchErr.message?.includes('fetch')) {
      const msg = 'Payment service is not reachable (http://localhost:8087). Please start the subscription-service backend.';
      if (onFailure) onFailure(msg);
      throw new Error(msg);
    }
    throw fetchErr;
  }

  // ── STEP 2: Open Razorpay Checkout with order_id ──────────────────────────
  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: orderData.keyId,
      amount: orderData.amount,          // in paise
      currency: orderData.currency || 'INR',
      name: 'CAREONIX',
      description: `${plan.name} — ${plan.durationLabel} Recruiter Access`,
      image: '/favicon.png',
      order_id: orderData.orderId,       // ← Razorpay Order ID from backend

      prefill: {
        name: user?.name || 'Recruiter',
        email: userEmail,
        contact: user?.phone || '9999999999'
      },

      notes: {
        plan_id: plan.id,
        plan_name: plan.name,
        recruiter_email: userEmail
      },

      theme: {
        color: '#7c3aed'
      },

      modal: {
        ondismiss: () => {
          if (onDismiss) onDismiss();
          reject(new Error('Payment cancelled by user'));
        }
      },

      handler: async function (razorpayResponse) {
        /**
         * razorpayResponse contains:
         *   razorpay_payment_id — proof of payment
         *   razorpay_order_id   — matches our order
         *   razorpay_signature  — HMAC SHA256 for server-side verification
         */
        try {
          // ── STEP 3: Verify payment on backend ───────────────────────────────
          const verifyRes = await fetch(`${PAYMENT_SERVICE_URL}/payments/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayPaymentId: razorpayResponse.razorpay_payment_id,
              razorpayOrderId: razorpayResponse.razorpay_order_id,
              razorpaySignature: razorpayResponse.razorpay_signature,
              recruiterEmail: userEmail,
              planId: plan.id,
              planName: plan.name,
              durationDays: plan.durationDays,
              amountPaid: plan.price,
              maxJobPosts: plan.maxJobPosts || 25
            })
          });

          if (!verifyRes.ok) {
            const verifyErr = await verifyRes.json().catch(() => ({}));
            const msg = verifyErr.detail || verifyErr.error || 'Payment verification failed';
            if (onFailure) onFailure(msg);
            reject(new Error(msg));
            return;
          }

          const subscriptionStatus = await verifyRes.json();

          // ── STEP 4: Cache subscription in localStorage for instant UI unlock ──
          cacheSubscriptionLocally(userEmail, subscriptionStatus, razorpayResponse);

          const paymentDetails = {
            paymentId: razorpayResponse.razorpay_payment_id,
            orderId: razorpayResponse.razorpay_order_id,
            signature: razorpayResponse.razorpay_signature,
            subscription: subscriptionStatus,
            method: 'Razorpay (Verified)',
            status: 'PAID',
            paidAt: new Date().toISOString()
          };

          if (onSuccess) onSuccess(paymentDetails);
          resolve(paymentDetails);

        } catch (verifyErr) {
          const msg = verifyErr.message || 'Payment verification error';
          if (onFailure) onFailure(msg);
          reject(new Error(msg));
        }
      }
    };

    try {
      const rzp = new window.Razorpay(razorpayOptions);
      rzp.on('payment.failed', function (response) {
        const msg = response?.error?.description || 'Payment failed. Please try again.';
        if (onFailure) onFailure(msg, response?.error);
        reject(new Error(msg));
      });
      rzp.open();
    } catch (err) {
      const msg = err.message || 'Failed to open Razorpay checkout';
      if (onFailure) onFailure(msg);
      reject(new Error(msg));
    }
  });
}

/**
 * Cache subscription to localStorage after backend verifies it.
 * This allows instant UI unlock without an extra API call on page reload.
 */
function cacheSubscriptionLocally(email, subscriptionStatus, razorpayResponse) {
  try {
    const STORAGE_KEY = 'careonix_recruiter_subscriptions';
    const raw = localStorage.getItem(STORAGE_KEY);
    const allSubs = raw ? JSON.parse(raw) : {};

    const expiryDate = subscriptionStatus.expiryDate
      ? new Date(subscriptionStatus.expiryDate).toISOString()
      : new Date(Date.now() + (subscriptionStatus.durationDays || 30) * 86400000).toISOString();

    allSubs[email.toLowerCase()] = {
      id: `SUB-${razorpayResponse.razorpay_payment_id}`,
      email: email.toLowerCase(),
      planId: subscriptionStatus.planId,
      planName: subscriptionStatus.planName,
      durationDays: subscriptionStatus.durationDays,
      startDate: subscriptionStatus.startDate || new Date().toISOString(),
      expiryDate,
      amountPaid: subscriptionStatus.amountPaid,
      currency: 'INR',
      paymentMethod: 'Razorpay',
      transactionId: razorpayResponse.razorpay_payment_id,
      maxJobPosts: subscriptionStatus.maxJobPosts || 25,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      backendVerified: true
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allSubs));
    window.dispatchEvent(new Event('careonix_subscription_updated'));
  } catch (e) {
    console.warn('Could not cache subscription locally:', e);
  }
}

/**
 * Fetch live subscription status from backend for a recruiter email.
 * Use this on app load to sync backend DB with frontend localStorage.
 */
export async function fetchSubscriptionStatus(email) {
  if (!email) return null;
  try {
    const res = await fetch(`${PAYMENT_SERVICE_URL}/payments/subscription?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null; // Backend offline — fallback to localStorage cache
  }
}

/**
 * Checks if the payment backend (subscription-service:8087) is reachable.
 */
export async function isPaymentServiceReachable() {
  try {
    const res = await fetch(`${PAYMENT_SERVICE_URL}/payments/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export { PAYMENT_SERVICE_URL };

// Legacy export for existing code compatibility
export function isRazorpayConfigured() {
  // With backend integration, we consider it "configured" always
  // (the actual key check happens server-side)
  return true;
}
