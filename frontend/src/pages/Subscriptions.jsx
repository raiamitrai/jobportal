import React, { useState, useEffect } from 'react';
import {
  Plus, Check, Edit2, Trash2, X, CreditCard, Crown,
  Zap, Calendar, Clock, ShieldCheck, CheckCircle2,
  TrendingUp, Sparkles, RefreshCw, FileText,
  AlertTriangle, Loader2, Tag, Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getEffectivePlans,
  getRecruiterSubscription,
  subscribeRecruiter,
  expireRecruiterSubscription,
  validateAndApplyCoupon,
  incrementCouponUsage
} from '../utils/subscriptionUtils';
import { initiateRazorpayPayment, isRazorpayConfigured } from '../utils/razorpayUtils';

export default function Subscriptions({ role }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState(getEffectivePlans);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState(() =>
    getRecruiterSubscription(user?.email || user?.identifier)
  );

  // Coupon code states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCouponResult, setAppliedCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Sync subscription and plan updates
  useEffect(() => {
    const handleUpdate = () => {
      setSubscriptionState(getRecruiterSubscription(user?.email || user?.identifier));
      setPlans(getEffectivePlans());
    };
    window.addEventListener('careonix_subscription_updated', handleUpdate);
    window.addEventListener('careonix_plans_updated', handleUpdate);
    window.addEventListener('careonix_coupons_updated', handleUpdate);
    return () => {
      window.removeEventListener('careonix_subscription_updated', handleUpdate);
      window.removeEventListener('careonix_plans_updated', handleUpdate);
      window.removeEventListener('careonix_coupons_updated', handleUpdate);
    };
  }, [user?.email, user?.identifier]);

  const [paymentError, setPaymentError] = useState('');

  const handleSubscribe = (plan) => {
    setSelectedPlanForCheckout(plan);
    setSuccessCelebration(false);
    setPaymentError('');
    setCouponCodeInput('');
    setAppliedCouponResult(null);
    setCouponError('');
  };

  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setCouponError('');
    const result = validateAndApplyCoupon(couponCodeInput, selectedPlanForCheckout);
    if (result.valid) {
      setAppliedCouponResult(result);
    } else {
      setCouponError(result.error || 'Invalid coupon code');
      setAppliedCouponResult(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCouponResult(null);
    setCouponCodeInput('');
    setCouponError('');
  };

  const handleConfirmPayment = async () => {
    setPaymentError('');

    if (!isRazorpayConfigured()) {
      setPaymentError('Razorpay key not configured. Please add RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in your .env file.');
      return;
    }

    setIsProcessing(true);

    const effectivePlanForPayment = {
      ...selectedPlanForCheckout,
      price: appliedCouponResult ? appliedCouponResult.finalPrice : selectedPlanForCheckout.price
    };

    try {
      const paymentDetails = await initiateRazorpayPayment({
        plan: effectivePlanForPayment,
        user,
        onDismiss: () => setIsProcessing(false)
      });

      // Increment coupon usage if used
      if (appliedCouponResult?.coupon?.code) {
        incrementCouponUsage(appliedCouponResult.coupon.code);
      }

      const email = user?.email || user?.identifier;
      const sub = subscribeRecruiter(email, effectivePlanForPayment, effectivePlanForPayment.durationDays, {
        method: paymentDetails.method,
        paymentId: paymentDetails.paymentId,
        couponApplied: appliedCouponResult?.coupon?.code || null
      });
      setSubscriptionState(sub);
      setIsProcessing(false);
      setSuccessCelebration(true);

      setTimeout(() => {
        setSelectedPlanForCheckout(null);
        window.location.reload();
      }, 1800);
    } catch (err) {
      setIsProcessing(false);
      if (!err.message?.includes('cancelled')) {
        setPaymentError(err.message || 'Payment failed. Please try again.');
      }
    }
  };

  const handleTestExpire = () => {
    if (window.confirm('Simulate immediate expiry of current subscription for testing feature locking?')) {
      expireRecruiterSubscription(user?.email || user?.identifier);
      setSubscriptionState(getRecruiterSubscription(user?.email || user?.identifier));
      window.location.reload();
    }
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontFamily: 'Inter, sans-serif', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crown size={24} color="#7c3aed" /> Recruiter Subscriptions & Instant Unlock
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.92rem' }}>
            Choose a plan to instantly unlock job posting, candidate directory, and applications without waiting for manual verification.
          </p>
        </div>

        {subscriptionState && subscriptionState.status === 'ACTIVE' && (
          <button
            onClick={handleTestExpire}
            style={{
              padding: '0.5rem 1rem', background: '#fef2f2',
              color: '#dc2626', border: '1px solid #fecaca',
              borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600',
              cursor: 'pointer'
            }}
            title="For testing feature locking on expiry"
          >
            Simulate Expiry (Test)
          </button>
        )}
      </div>

      {/* ── CURRENT ACTIVE SUBSCRIPTION STATUS CARD (IF SUBSCRIBED) ── */}
      {subscriptionState && subscriptionState.status === 'ACTIVE' && (
        <div style={{
          background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #fdf4ff 100%)',
          border: '2px solid #7c3aed',
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          boxShadow: '0 8px 30px rgba(124, 58, 237, 0.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)'
            }}>
              <Crown size={28} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#4c1d95', margin: 0 }}>
                  {subscriptionState.planName}
                </h3>
                <span style={{
                  background: '#dcfce7', color: '#15803d',
                  border: '1px solid #bbf7d0', padding: '3px 10px',
                  borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800'
                }}>
                  ✅ ACTIVE & UNLOCKED
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.86rem', color: '#6d28d9', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <span>⏳ <strong>{subscriptionState.daysRemaining} Days Remaining</strong></span>
                <span>•</span>
                <span>Valid until: <strong>{subscriptionState.formattedExpiry}</strong></span>
                <span>•</span>
                <span>Max Vacancies: <strong>{subscriptionState.maxJobPosts} posts</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => handleSubscribe(RECRUITER_PLANS[1])}
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white', border: 'none',
                padding: '0.75rem 1.4rem', borderRadius: '12px',
                fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)'
              }}
            >
              Extend / Renew Subscription →
            </button>
          </div>
        </div>
      )}

      {/* ── EXPIRED SUBSCRIPTION NOTICE (IF EXPIRED & NOT ADMIN APPROVED) ── */}
      {subscriptionState && subscriptionState.status === 'EXPIRED' && (
        <div style={{
          background: '#fef2f2',
          border: '1.5px solid #fca5a5',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#991b1b', margin: 0 }}>
              ⚠️ Your Subscription Expired on {subscriptionState.formattedExpiry}
            </h3>
            <p style={{ color: '#b91c1c', fontSize: '0.86rem', margin: '4px 0 0 0' }}>
              Your features are currently locked. Renew your plan to continue posting jobs and viewing candidate applications.
            </p>
          </div>
          <button
            onClick={() => handleSubscribe(plans[1] || plans[0])}
            style={{
              background: '#dc2626', color: 'white', border: 'none',
              padding: '0.65rem 1.25rem', borderRadius: '10px',
              fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer'
            }}
          >
            Renew Now
          </button>
        </div>
      )}

      {/* ── RECRUITER PLANS GRID ── */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
            Available Recruiter Tier Plans
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Select any tier to activate instant access for your desired duration
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {plans.map((plan) => {
            const isCurrentActive = subscriptionState?.planId === plan.id && subscriptionState?.status === 'ACTIVE';

            return (
              <div
                key={plan.id}
                style={{
                  background: '#ffffff',
                  border: isCurrentActive
                    ? '2px solid #059669'
                    : (plan.popular ? '2px solid #7c3aed' : '1.5px solid #e2e8f0'),
                  borderRadius: '20px',
                  padding: '1.75rem',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: plan.popular ? '0 10px 30px rgba(124, 58, 237, 0.12)' : '0 4px 16px rgba(15,23,42,0.04)',
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Popular / Active / Offer Badge */}
                {isCurrentActive ? (
                  <div style={{
                    position: 'absolute', top: '-12px', right: '16px',
                    background: '#059669', color: '#ffffff',
                    fontSize: '0.72rem', fontWeight: '800',
                    padding: '0.25rem 0.75rem', borderRadius: '20px'
                  }}>
                    ACTIVE PLAN
                  </div>
                ) : plan.offerBadge ? (
                  <div style={{
                    position: 'absolute', top: '-12px', right: '16px',
                    background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: '#ffffff',
                    fontSize: '0.72rem', fontWeight: '800',
                    padding: '0.25rem 0.75rem', borderRadius: '20px',
                    boxShadow: '0 2px 6px rgba(239,68,68,0.3)'
                  }}>
                    {plan.offerBadge}
                  </div>
                ) : (
                  plan.popular && (
                    <div style={{
                      position: 'absolute', top: '-12px', right: '16px',
                      background: '#7c3aed', color: '#ffffff',
                      fontSize: '0.72rem', fontWeight: '800',
                      padding: '0.25rem 0.75rem', borderRadius: '20px'
                    }}>
                      MOST POPULAR
                    </div>
                  )
                )}

                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.25rem' }}>
                    {plan.name}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.4, minHeight: '36px' }}>
                    {plan.tagline}
                  </p>

                  {/* Price */}
                  <div style={{ margin: '1.25rem 0 1.5rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '2.3rem', fontWeight: '900', color: '#0f172a' }}>{plan.priceDisplay}</span>
                    {plan.originalPrice && plan.originalPrice > plan.price && (
                      <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                        ₹{Number(plan.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    <span style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: '600' }}>/ {plan.durationLabel}</span>
                  </div>

                  {/* Feature Checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem', fontSize: '0.86rem' }}>
                    {plan.features.map((feat, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#475569' }}>
                        <Check size={16} color="#7c3aed" style={{ minWidth: '16px', marginTop: '2px', flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: isCurrentActive
                      ? '#dcfce7'
                      : (plan.popular ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#0f172a'),
                    color: isCurrentActive ? '#15803d' : '#ffffff',
                    border: isCurrentActive ? '1px solid #bbf7d0' : 'none',
                    borderRadius: '12px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    boxShadow: plan.popular && !isCurrentActive ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle2 size={16} /> Current Plan (Renew)
                    </>
                  ) : (
                    <>
                      <Zap size={16} fill="currentColor" /> Unlock for {plan.durationLabel}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHECKOUT MODAL ── */}
      {selectedPlanForCheckout && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '2.25rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            {!successCelebration && (
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: '#f1f5f9', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            )}

            {successCelebration ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: '68px', height: '68px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                  color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)'
                }}>
                  <CheckCircle2 size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
                  🎉 Subscription Activated!
                </h3>
                <p style={{ color: '#16a34a', fontWeight: '700', fontSize: '1.05rem', marginBottom: '0.5rem' }}>
                  Unlocked for {selectedPlanForCheckout.durationLabel}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Refreshing your workspace with full access to all recruiter capabilities...
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                  <Crown size={22} color="#7c3aed" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                    Confirm Subscription Plan
                  </h3>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Account: <strong>{user?.email || user?.name || 'Recruiter'}</strong>
                </p>

                {/* Plan Summary Card */}
                <div style={{
                  background: '#f5f3ff',
                  border: '1.5px solid #ddd6fe',
                  borderRadius: '16px',
                  padding: '1.15rem 1.25rem',
                  marginBottom: '1rem',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#4c1d95' }}>{selectedPlanForCheckout.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6d28d9', marginTop: '2px' }}>
                      Valid for {selectedPlanForCheckout.durationLabel} ({selectedPlanForCheckout.maxJobPosts} Job Posts)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: appliedCouponResult ? '1.1rem' : '1.35rem',
                      fontWeight: '900',
                      color: appliedCouponResult ? '#94a3b8' : '#6d28d9',
                      textDecoration: appliedCouponResult ? 'line-through' : 'none'
                    }}>
                      {selectedPlanForCheckout.priceDisplay}
                    </div>
                    {appliedCouponResult && (
                      <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#15803d' }}>
                        {appliedCouponResult.finalPriceDisplay}
                      </div>
                    )}
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>One-time payment</div>
                  </div>
                </div>

                {/* ── PROMO / COUPON CODE SECTION ── */}
                <div style={{
                  background: '#faf5ff', border: '1px dashed #c084fc',
                  borderRadius: '14px', padding: '0.85rem 1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7e22ce', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Tag size={13} /> HAVE A COUPON / DISCOUNT CODE?
                    </span>
                    {appliedCouponResult && (
                      <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                        Remove
                      </button>
                    )}
                  </div>

                  {!appliedCouponResult ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input 
                        type="text"
                        placeholder="Enter code (e.g. WELCOME50)"
                        value={couponCodeInput}
                        onChange={e => { setCouponCodeInput(e.target.value.toUpperCase()); setCouponError(''); }}
                        style={{
                          flex: 1, padding: '0.5rem 0.75rem', border: '1.5px solid #e9d5ff',
                          borderRadius: 8, fontSize: '0.85rem', fontWeight: 700,
                          textTransform: 'uppercase', outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        style={{
                          background: '#7c3aed', color: '#fff', border: 'none',
                          borderRadius: 8, padding: '0.5rem 1rem', fontWeight: 800,
                          fontSize: '0.82rem', cursor: 'pointer'
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#dcfce7', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#15803d', fontSize: '0.82rem', fontWeight: 800 }}>
                        <CheckCircle2 size={15} />
                        <span>Code <strong>{appliedCouponResult.coupon.code}</strong> Applied! ({appliedCouponResult.discountDisplay} saved)</span>
                      </div>
                    </div>
                  )}

                  {couponError && (
                    <div style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>
                      ⚠️ {couponError}
                    </div>
                  )}
                </div>

                {/* Payment info */}
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '0.75rem 1rem',
                  marginBottom: '1rem', fontSize: '0.82rem', color: '#475569',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <span>💳</span>
                  <span>Pay securely via <strong>Razorpay</strong> — UPI, Cards, NetBanking, Wallets all accepted</span>
                </div>

                {/* Error message */}
                {paymentError && (
                  <div style={{
                    background: '#fef2f2', border: '1px solid #fca5a5',
                    borderRadius: '10px', padding: '0.75rem 1rem',
                    marginBottom: '1rem', fontSize: '0.82rem', color: '#dc2626',
                    display: 'flex', gap: '0.5rem', lineHeight: 1.5
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    {paymentError}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => { setSelectedPlanForCheckout(null); setPaymentError(''); }}
                    style={{
                      flex: 1, padding: '0.85rem',
                      background: '#f1f5f9', color: '#475569',
                      border: 'none', borderRadius: '12px',
                      fontWeight: '700', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    style={{
                      flex: 2, padding: '0.85rem',
                      background: isProcessing ? '#9ca3af' : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                      color: '#ffffff',
                      border: 'none', borderRadius: '12px',
                      fontWeight: '800', fontSize: '0.95rem',
                      cursor: isProcessing ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                      boxShadow: isProcessing ? 'none' : '0 4px 14px rgba(109, 40, 217, 0.35)'
                    }}
                  >
                    {isProcessing ? (
                      <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Opening Razorpay...</>
                    ) : (
                      <><Zap size={18} fill="white" /> Pay {appliedCouponResult ? appliedCouponResult.finalPriceDisplay : selectedPlanForCheckout.priceDisplay} via Razorpay</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Inject spin animation globally for this component
const styleEl = document.getElementById('careonix-spin-style');
if (!styleEl) {
  const el = document.createElement('style');
  el.id = 'careonix-spin-style';
  el.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
  document.head.appendChild(el);
}
