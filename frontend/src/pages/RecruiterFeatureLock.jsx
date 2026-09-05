import React, { useState } from 'react';
import {
  Lock, ShieldAlert, Building, CheckCircle2,
  ChevronRight, HelpCircle, Zap, Crown, Check,
  ShieldCheck, X, AlertTriangle, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RECRUITER_PLANS, subscribeRecruiter } from '../utils/subscriptionUtils';
import { initiateRazorpayPayment, isRazorpayConfigured } from '../utils/razorpayUtils';

export default function RecruiterFeatureLock({ featureName = 'This Feature', setActiveTab }) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(RECRUITER_PLANS[1]); // Default 30-day Pro
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Check if Razorpay key is configured
  const razorpayConfigured = isRazorpayConfigured();

  const handlePayAndUnlock = async () => {
    setPaymentError('');

    if (!razorpayConfigured) {
      setPaymentError(
        `Razorpay key not configured yet. Please add your key in src/utils/razorpayUtils.js (current: "${RAZORPAY_KEY_ID}"). ` +
        'Get your test key free at razorpay.com → Settings → API Keys.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const paymentDetails = await initiateRazorpayPayment({
        plan: selectedPlan,
        user,
        onDismiss: () => {
          setIsProcessing(false);
        }
      });

      // ✅ Payment successful! Activate subscription immediately
      const email = user?.email || user?.identifier;
      const activatedSub = subscribeRecruiter(email, selectedPlan, selectedPlan.durationDays, {
        method: paymentDetails.method,
        paymentId: paymentDetails.paymentId,
        transactionId: paymentDetails.paymentId
      });

      setSuccessData({
        paymentId: paymentDetails.paymentId,
        planName: selectedPlan.name,
        durationLabel: selectedPlan.durationLabel,
        expiresAt: activatedSub?.formattedExpiry
      });

      setIsProcessing(false);

      // Reload after 2s to apply subscription unlock across all tabs
      setTimeout(() => {
        window.location.reload();
      }, 2200);

    } catch (err) {
      setIsProcessing(false);
      if (!err.message?.includes('cancelled')) {
        setPaymentError(err.message || 'Payment failed. Please try again.');
      }
    }
  };

  // ── SUCCESS CELEBRATION SCREEN ────────────────────────────────────────────
  if (successData) {
    return (
      <div style={{
        minHeight: '80vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          maxWidth: '520px', width: '100%', textAlign: 'center',
          padding: '3rem 2.5rem', borderRadius: '24px',
          background: '#ffffff', border: '1.5px solid #e2e8f0',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            color: '#15803d', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)'
          }}>
            <CheckCircle2 size={44} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.5rem' }}>
            🎉 Subscription Activated!
          </h2>
          <p style={{ color: '#16a34a', fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {successData.planName}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
            All recruiter features unlocked for <strong>{successData.durationLabel}</strong>.
            <br />Valid until <strong>{successData.expiresAt}</strong>
          </p>
          {successData.paymentId && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '12px', padding: '0.75rem',
              fontSize: '0.82rem', color: '#15803d', fontFamily: 'monospace'
            }}>
              Payment ID: {successData.paymentId}
            </div>
          )}
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '1rem' }}>
            Refreshing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '940px', width: '100%',
        padding: '2.5rem',
        borderRadius: '24px',
        background: '#ffffff',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '2px solid #f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem auto', color: '#d97706',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.25)'
          }}>
            <Lock size={32} />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.35rem 1rem', background: '#fffbeb',
            border: '1px solid #fcd34d', borderRadius: '50px',
            color: '#b45309', fontWeight: '700', fontSize: '0.8rem',
            marginBottom: '0.85rem'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            Recruiter Verification Status: 🟡 Pending Admin Review
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            {featureName} is Currently Locked
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.96rem', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
            Your account is awaiting Admin Approval.{' '}
            <strong style={{ color: '#0f172a' }}>Or instantly unlock by subscribing below — no waiting!</strong>
          </p>
        </div>

        {/* ── MAIN TWO-COLUMN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
          
          {/* ── OPTION 1: INSTANT RAZORPAY SUBSCRIPTION UNLOCK ── */}
          <div style={{
            background: 'linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '2px solid #7c3aed',
            borderRadius: '20px',
            padding: '1.75rem',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(124, 58, 237, 0.15)',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div style={{
              position: 'absolute', top: '-12px', right: '20px',
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              color: 'white', padding: '0.3rem 0.85rem', borderRadius: '20px',
              fontSize: '0.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
            }}>
              <Zap size={13} fill="white" /> INSTANT UNLOCK
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Crown size={22} color="#7c3aed" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#4c1d95', margin: 0 }}>
                  Pay & Unlock via Razorpay
                </h3>
              </div>
              <p style={{ color: '#6d28d9', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Real UPI, Card, NetBanking — All accepted. Access unlocks <strong>immediately after payment.</strong>
              </p>

              {/* Razorpay Config Warning */}
              {!razorpayConfigured && (
                <div style={{
                  background: '#fffbeb', border: '1px solid #fcd34d',
                  borderRadius: '10px', padding: '0.75rem 1rem',
                  fontSize: '0.8rem', color: '#92400e', marginBottom: '1rem',
                  lineHeight: 1.5
                }}>
                  ⚠️ <strong>Setup Required:</strong> Add your Razorpay Test Key in{' '}
                  <code style={{ background: '#fef3c7', padding: '1px 4px', borderRadius: '4px', fontSize: '0.78rem' }}>
                    src/utils/razorpayUtils.js
                  </code>.{' '}
                  Get a free test key at{' '}
                  <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" style={{ color: '#7c3aed', fontWeight: '700' }}>
                    razorpay.com
                  </a>
                </div>
              )}

              {/* Plan Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.35rem' }}>
                {RECRUITER_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      style={{
                        background: isSelected ? '#ffffff' : 'rgba(255,255,255,0.65)',
                        border: `1.5px solid ${isSelected ? '#7c3aed' : '#ddd6fe'}`,
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#7c3aed' : '#cbd5e1'}`,
                          background: isSelected ? '#7c3aed' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {isSelected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0f172a' }}>
                            {plan.name}
                            {plan.popular && (
                              <span style={{ marginLeft: '6px', background: '#7c3aed', color: 'white', padding: '2px 6px', borderRadius: '6px', fontSize: '0.67rem' }}>
                                POPULAR
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: '#64748b' }}>{plan.tagline}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: '900', fontSize: '1rem', color: '#6d28d9' }}>{plan.priceDisplay}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{plan.durationLabel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Error */}
              {paymentError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px',
                  padding: '0.75rem 1rem', fontSize: '0.82rem', color: '#dc2626',
                  marginBottom: '1rem', display: 'flex', gap: '0.5rem', lineHeight: 1.5
                }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  {paymentError}
                </div>
              )}

              {/* Selected Plan Summary */}
              <div style={{
                background: 'rgba(255,255,255,0.8)', border: '1px solid #ddd6fe',
                borderRadius: '10px', padding: '0.7rem 1rem',
                fontSize: '0.82rem', color: '#4c1d95', fontWeight: '700',
                marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'
              }}>
                <span>Selected: {selectedPlan.name}</span>
                <span>{selectedPlan.priceDisplay} / {selectedPlan.durationLabel}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayAndUnlock}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '0.95rem',
                background: isProcessing
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '1rem',
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: isProcessing ? 'none' : '0 6px 20px rgba(109, 40, 217, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Opening Razorpay Checkout...
                </>
              ) : (
                <>
                  <Zap size={18} fill="white" />
                  Pay {selectedPlan.priceDisplay} & Unlock Now
                </>
              )}
            </button>

            {/* Trust badges */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '1rem',
              marginTop: '0.85rem', fontSize: '0.75rem', color: '#6d28d9', opacity: 0.8
            }}>
              <span>🔒 SSL Secured</span>
              <span>⚡ Instant Unlock</span>
              <span>🛡️ Powered by Razorpay</span>
            </div>
          </div>

          {/* ── OPTION 2: FREE ADMIN APPROVAL ── */}
          <div style={{
            background: '#f8fafc', border: '1.5px solid #e2e8f0',
            borderRadius: '20px', padding: '1.75rem',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Building size={22} color="#0f172a" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Wait for Free Admin Approval
                </h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Admin verification is free and takes 1–2 business days after you complete your company profile.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#16a34a', fontWeight: '600' }}>
                  <CheckCircle2 size={18} />
                  <span>1. Recruiter account created successfully</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#d97706', fontWeight: '700' }}>
                  <Building size={18} />
                  <span>2. Complete your Company Profile & details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748b', fontWeight: '600' }}>
                  <ShieldAlert size={18} />
                  <span>3. Admin reviews & approves your account</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#64748b', fontWeight: '600' }}>
                  <ShieldCheck size={18} />
                  <span>4. Full access unlocked permanently (free)</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setActiveTab && setActiveTab('profile')}
                style={{
                  flex: 1, padding: '0.85rem',
                  background: '#ffffff', color: '#0f172a',
                  border: '1.5px solid #cbd5e1', borderRadius: '12px',
                  fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <Building size={16} /> Complete Profile
              </button>
              <button
                onClick={() => setActiveTab && setActiveTab('help')}
                style={{
                  padding: '0.85rem 1rem',
                  background: '#ffffff', color: '#64748b',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem'
                }}
              >
                <HelpCircle size={16} /> Help
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap', gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#059669" />
            <span>100% Secure Payment via Razorpay • Instant Access on Payment Success • No Auto-Renewal</span>
          </div>
          <div>
            Need help? <a href="mailto:support@careonix.com" style={{ color: '#7c3aed', fontWeight: 600 }}>support@careonix.com</a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
