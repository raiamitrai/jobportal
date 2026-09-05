import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, TrendingUp, Users, Package, Plus, Trash2,
  Tag, IndianRupee, Calendar, CheckCircle2, XCircle,
  Edit3, Save, X, Gift, BarChart2, Clock, RefreshCw,
  AlertTriangle, Zap, Shield, Star, Check
} from 'lucide-react';
import { 
  RECRUITER_PLANS, 
  getRecruiterSubscription, 
  subscribeRecruiter, 
  expireRecruiterSubscription,
  getEffectivePlans,
  saveAdminPlans,
  getCoupons,
  saveCoupons
} from '../utils/subscriptionUtils';
import { useAuth } from '../context/AuthContext';

const SUBS_STORAGE_KEY = 'careonix_recruiter_subscriptions';
const HIST_STORAGE_KEY = 'careonix_subscription_history';

function getAllSubscriptions() {
  try {
    const raw = localStorage.getItem(SUBS_STORAGE_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw);
    return Object.values(map).map(sub => {
      const now = new Date();
      const expiry = new Date(sub.expiryDate);
      const isExpired = now >= expiry;
      const diffMs = Math.max(0, expiry - now);
      const daysRemaining = Math.floor(diffMs / 86400000);
      return { ...sub, isExpired, status: isExpired ? 'EXPIRED' : 'ACTIVE', daysRemaining };
    });
  } catch (e) { return []; }
}

function getAllHistory() {
  try {
    const raw = localStorage.getItem(HIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '1.25rem 1.5rem',
      border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AdminSubscriptionPage() {
  const { registeredUsers } = useAuth();
  const [activeTab, setActiveTab] = useState('pricing');
  const [plans, setPlans] = useState(getEffectivePlans);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planDraft, setPlanDraft] = useState({});
  const [subscriptions, setSubscriptions] = useState(getAllSubscriptions);
  const [history, setHistory] = useState(getAllHistory);
  const [coupons, setCoupons] = useState(getCoupons);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percent', value: '', maxUses: '', expiresAt: '', planId: 'all', description: '' });
  const [grantForm, setGrantForm] = useState({ email: '', planId: 'plan-30d', customDays: '', note: '' });
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => {
    setSubscriptions(getAllSubscriptions());
    setHistory(getAllHistory());
    setCoupons(getCoupons());
    setPlans(getEffectivePlans());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener('careonix_subscription_updated', handler);
    window.addEventListener('careonix_plans_updated', handler);
    window.addEventListener('careonix_coupons_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('careonix_subscription_updated', handler);
      window.removeEventListener('careonix_plans_updated', handler);
      window.removeEventListener('careonix_coupons_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, [refresh]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  // Calculations
  const activeSubs = subscriptions.filter(s => s.status === 'ACTIVE');
  const expiredSubs = subscriptions.filter(s => s.status === 'EXPIRED');
  const totalRevenue = history.reduce((sum, h) => sum + (Number(h.amountPaid) || 0), 0);
  const mrr = activeSubs.reduce((sum, s) => {
    const plan = plans.find(p => p.id === s.planId);
    if (!plan) return sum;
    const monthlyValue = (plan.price / Math.max(1, plan.durationDays)) * 30;
    return sum + monthlyValue;
  }, 0);

  // Plan Pricing
  const startEditPlan = (plan) => {
    setEditingPlan(plan.id);
    setPlanDraft({ 
      price: plan.price, 
      originalPrice: plan.originalPrice || plan.price,
      maxJobPosts: plan.maxJobPosts, 
      tagline: plan.tagline,
      popular: plan.popular || false,
      offerBadge: plan.offerBadge || ''
    });
  };

  const savePlan = (planId) => {
    const pVal = Number(planDraft.price) || 0;
    const origVal = Number(planDraft.originalPrice) || pVal;
    const updated = plans.map(p => p.id === planId ? {
      ...p,
      price: pVal,
      originalPrice: origVal > pVal ? origVal : null,
      priceDisplay: `₹${pVal.toLocaleString('en-IN')}`,
      maxJobPosts: Number(planDraft.maxJobPosts) || 25,
      tagline: planDraft.tagline || p.tagline,
      popular: Boolean(planDraft.popular),
      offerBadge: planDraft.offerBadge || ''
    } : p);
    
    setPlans(updated);
    saveAdminPlans(updated);
    setEditingPlan(null);
    showToast('🎉 Pricing & offers updated successfully! Recruiter checkout reflects new rates.');
  };

  // Coupons
  const createCoupon = () => {
    if (!couponForm.code.trim() || !couponForm.value) { 
      showToast('⚠️ Please enter both coupon code and discount value'); 
      return; 
    }
    const newCoupon = {
      id: `CPN-${Date.now()}`,
      code: couponForm.code.toUpperCase().trim(),
      type: couponForm.type,
      value: Number(couponForm.value),
      maxUses: couponForm.maxUses ? Number(couponForm.maxUses) : null,
      usedCount: 0,
      planId: couponForm.planId,
      description: couponForm.description || `${couponForm.value}${couponForm.type === 'percent' ? '%' : '₹'} Special Discount`,
      expiresAt: couponForm.expiresAt || null,
      createdAt: new Date().toISOString(),
      active: true,
    };
    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    saveCoupons(updated);
    setShowCouponForm(false);
    setCouponForm({ code: '', type: 'percent', value: '', maxUses: '', expiresAt: '', planId: 'all', description: '' });
    showToast(`✅ Coupon code "${newCoupon.code}" created and activated!`);
  };

  const deleteCoupon = (id) => {
    const updated = coupons.filter(c => c.id !== id);
    setCoupons(updated);
    saveCoupons(updated);
    showToast('🗑️ Coupon deleted');
  };

  const toggleCoupon = (id) => {
    const updated = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setCoupons(updated);
    saveCoupons(updated);
  };

  // Grant Subscription manually
  const grantSubscription = () => {
    if (!grantForm.email.trim()) { showToast('⚠️ Enter recruiter email'); return; }
    const plan = plans.find(p => p.id === grantForm.planId) || plans[1];
    const customDays = grantForm.customDays ? Number(grantForm.customDays) : null;
    subscribeRecruiter(grantForm.email.trim().toLowerCase(), plan, customDays, { method: 'Admin VIP Grant (Free / Custom)' });
    setGrantForm({ email: '', planId: 'plan-30d', customDays: '', note: '' });
    refresh();
    showToast(`🎉 Subscription granted to ${grantForm.email}! Features unlocked immediately.`);
  };

  const cancelSub = (email) => {
    if (!window.confirm(`Are you sure you want to cancel & expire subscription for ${email}?`)) return;
    expireRecruiterSubscription(email);
    refresh();
    showToast(`🚫 Subscription expired for ${email}`);
  };

  const planColor = { 'plan-7d': '#f59e0b', 'plan-30d': '#7c3aed', 'plan-90d': '#059669', 'plan-365d': '#2563eb' };

  const tabs = [
    { id: 'pricing', label: 'Plan Pricing & Offers', icon: IndianRupee },
    { id: 'coupons', label: 'Discount Coupons', icon: Tag },
    { id: 'active', label: `Active Subscriptions (${activeSubs.length})`, icon: CheckCircle2 },
    { id: 'grant', label: 'Manual VIP Grant', icon: Gift },
    { id: 'history', label: 'Payment History', icon: Clock },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: '3rem' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 9999,
          background: '#0f172a', color: '#fff', padding: '0.85rem 1.4rem',
          borderRadius: 14, fontWeight: 700, fontSize: '0.88rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)', padding: '2.2rem 2.5rem', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
            <div style={{ width: 54, height: 54, borderRadius: 16, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={28} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800 }}>Subscription & Pricing Hub</h1>
                <span style={{ background: 'rgba(99, 102, 241, 0.4)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(199, 210, 254, 0.3)' }}>ADMIN CONTROL</span>
              </div>
              <p style={{ margin: '4px 0 0', opacity: 0.82, fontSize: '0.88rem' }}>Set plan prices, launch festival discount coupons, manage recruiter revenue and override subscriptions</p>
            </div>
          </div>
          <button onClick={refresh} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '0.55rem 1.1rem', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.85rem' }}>
            <RefreshCw size={16} /> Sync Live Data
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginTop: '1.8rem' }}>
          <StatCard icon={IndianRupee} label="Total Platform Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Direct recruiter payments" color="#10b981" />
          <StatCard icon={TrendingUp} label="Est. MRR" value={`₹${Math.round(mrr).toLocaleString('en-IN')}`} sub="Monthly recurring run rate" color="#6366f1" />
          <StatCard icon={CheckCircle2} label="Active Paid Recruiter Subs" value={activeSubs.length} sub="Currently unlocked" color="#3b82f6" />
          <StatCard icon={Tag} label="Active Discount Coupons" value={coupons.filter(c => c.active).length} sub="Promo offers live" color="#f59e0b" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2.5rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: '1.1rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: activeTab === t.id ? '3px solid #4f46e5' : '3px solid transparent',
            color: activeTab === t.id ? '#4f46e5' : '#64748b',
            fontWeight: activeTab === t.id ? 800 : 600, fontSize: '0.88rem',
            display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            transition: 'all 0.2s ease'
          }}>
            <t.icon size={17} /> {t.label}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2rem 2.5rem' }}>

        {/* ── TAB 1: PRICING & OFFERS MANAGER ───────────────────────────────── */}
        {activeTab === 'pricing' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Recruiter Subscription Plans & Custom Pricing</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Edit live prices, original strikethrough price, festival badges, or max job limits. Changes reflect immediately on recruiter checkout page.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.4rem' }}>
              {plans.map(plan => {
                const isEditing = editingPlan === plan.id;
                const activeCount = activeSubs.filter(s => s.planId === plan.id).length;
                const planColorHex = planColor[plan.id] || '#4f46e5';

                return (
                  <div key={plan.id} style={{
                    background: '#fff', borderRadius: 18, padding: '1.6rem',
                    border: isEditing ? `2px solid ${planColorHex}` : '1px solid #e2e8f0',
                    boxShadow: isEditing ? '0 10px 30px rgba(99,102,241,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                    position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                  }}>
                    {plan.offerBadge && (
                      <div style={{ position: 'absolute', top: -11, right: 20, background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, boxShadow: '0 2px 6px rgba(239,68,68,0.3)' }}>
                        {plan.offerBadge}
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${planColorHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} color={planColorHex} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{plan.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{plan.durationLabel}</div>
                          </div>
                        </div>

                        {!isEditing ? (
                          <button onClick={() => startEditPlan(plan)} style={{
                            background: '#f8fafc', color: '#4f46e5', border: '1px solid #e2e8f0',
                            borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontWeight: 700,
                            fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4
                          }}>
                            <Edit3 size={13} /> Edit
                          </button>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => savePlan(plan.id)} style={{
                              background: '#10b981', color: '#fff', border: 'none',
                              borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700,
                              fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4
                            }}>
                              <Save size={13} /> Save
                            </button>
                            <button onClick={() => setEditingPlan(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Editing View */}
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Discounted / Selling Price (₹)</label>
                            <input 
                              type="number" 
                              value={planDraft.price} 
                              onChange={e => setPlanDraft(d => ({ ...d, price: e.target.value }))}
                              style={{ width: '100%', padding: '0.55rem 0.75rem', border: '2px solid #4f46e5', borderRadius: 8, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Original Price (₹) for Strikethrough (Optional)</label>
                            <input 
                              type="number" 
                              value={planDraft.originalPrice || ''} 
                              placeholder="e.g. 2999"
                              onChange={e => setPlanDraft(d => ({ ...d, originalPrice: e.target.value }))}
                              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Offer Badge Text (e.g. 50% OFF, DIWALI OFFER)</label>
                            <input 
                              type="text" 
                              value={planDraft.offerBadge} 
                              placeholder="e.g. 30% FESTIVAL DISCOUNT"
                              onChange={e => setPlanDraft(d => ({ ...d, offerBadge: e.target.value }))}
                              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Max Active Job Postings Allowed</label>
                            <input 
                              type="number" 
                              value={planDraft.maxJobPosts} 
                              onChange={e => setPlanDraft(d => ({ ...d, maxJobPosts: e.target.value }))}
                              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                            />
                          </div>

                          <div>
                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Tagline Description</label>
                            <input 
                              type="text" 
                              value={planDraft.tagline} 
                              onChange={e => setPlanDraft(d => ({ ...d, tagline: e.target.value }))}
                              style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0.5rem 0' }}>
                            <span style={{ fontSize: '2.1rem', fontWeight: 900, color: planColorHex }}>{plan.priceDisplay}</span>
                            {plan.originalPrice && plan.originalPrice > plan.price && (
                              <span style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through', fontWeight: 600 }}>
                                ₹{Number(plan.originalPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.4 }}>{plan.tagline}</p>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.2rem' }}>
                            <span style={{ background: '#f0fdf4', color: '#166534', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                              Max {plan.maxJobPosts} jobs
                            </span>
                            <span style={{ background: '#eff6ff', color: '#1e40af', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {plan.durationDays} Days validity
                            </span>
                            {plan.popular && (
                              <span style={{ background: '#faf5ff', color: '#6b21a8', borderRadius: 6, padding: '3px 8px', fontSize: '0.75rem', fontWeight: 700 }}>
                                ⭐ POPULAR
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Active Subscribers</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeCount > 0 ? '#10b981' : '#94a3b8' }}>
                        {activeCount} recruiters
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TAB 2: COUPONS & DISCOUNTS MANAGER ────────────────────────────── */}
        {activeTab === 'coupons' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Promo Coupons & Discount Codes</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Create discount coupons that recruiters can enter during checkout (e.g. FLAT ₹500 OFF or 25% OFF).</p>
              </div>
              <button onClick={() => setShowCouponForm(true)} style={{ background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', border: 'none', borderRadius: 12, padding: '0.65rem 1.3rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
                <Plus size={16} /> Create New Coupon
              </button>
            </div>

            {/* Create Coupon Modal/Form */}
            {showCouponForm && (
              <div style={{ background: '#fff', borderRadius: 18, padding: '1.8rem', border: '2px solid #6366f1', marginBottom: '1.8rem', boxShadow: '0 10px 30px rgba(99,102,241,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Create Promo Discount Code</h3>
                  <button onClick={() => setShowCouponForm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={16} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Coupon Code *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. WELCOME50, DIWALI2026"
                      value={couponForm.code} 
                      onChange={e => setCouponForm(d => ({ ...d, code: e.target.value.toUpperCase() }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Discount Type</label>
                    <select 
                      value={couponForm.type} 
                      onChange={e => setCouponForm(d => ({ ...d, type: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                    >
                      <option value="percent">Percentage (%) Off</option>
                      <option value="flat">Flat Amount (₹) Off</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>
                      {couponForm.type === 'percent' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
                    </label>
                    <input 
                      type="number" 
                      placeholder={couponForm.type === 'percent' ? 'e.g. 25' : 'e.g. 500'}
                      value={couponForm.value} 
                      onChange={e => setCouponForm(d => ({ ...d, value: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Applicable Plan</label>
                    <select 
                      value={couponForm.planId} 
                      onChange={e => setCouponForm(d => ({ ...d, planId: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                    >
                      <option value="all">All Recruiter Plans</option>
                      {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.priceDisplay})</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Max Total Uses (Optional)</label>
                    <input 
                      type="number" 
                      placeholder="Leave blank for unlimited uses"
                      value={couponForm.maxUses} 
                      onChange={e => setCouponForm(d => ({ ...d, maxUses: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Expiry Date (Optional)</label>
                    <input 
                      type="date" 
                      value={couponForm.expiresAt} 
                      onChange={e => setCouponForm(d => ({ ...d, expiresAt: e.target.value }))}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Offer Description / Headline</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Special Startup Growth Offer - 30% Off on Monthly & Annual plans"
                    value={couponForm.description} 
                    onChange={e => setCouponForm(d => ({ ...d, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: '1.4rem' }}>
                  <button onClick={createCoupon} style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 10, padding: '0.65rem 1.6rem', cursor: 'pointer', fontWeight: 700 }}>
                    Save & Activate Coupon
                  </button>
                  <button onClick={() => setShowCouponForm(false)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 10, padding: '0.65rem 1.2rem', cursor: 'pointer', fontWeight: 600 }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Coupons Table/Cards */}
            {coupons.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8', background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0' }}>
                <Tag size={44} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#475569' }}>No discount coupons created yet</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>Create coupons to give discounts or special pricing offers to recruiters</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {coupons.map(c => {
                  const isExpiredCpn = c.expiresAt && new Date() > new Date(c.expiresAt);
                  const isMaxed = c.maxUses && c.usedCount >= c.maxUses;
                  const effectiveActive = c.active && !isExpiredCpn && !isMaxed;

                  return (
                    <div key={c.id} style={{
                      background: '#fff', borderRadius: 16, padding: '1.2rem 1.4rem',
                      border: `1.5px solid ${effectiveActive ? '#e2e8f0' : '#fecaca'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '1rem', flexWrap: 'wrap', boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
                        <div style={{
                          background: effectiveActive ? '#e0e7ff' : '#fef2f2',
                          borderRadius: 10, padding: '0.6rem 1.1rem',
                          fontFamily: 'monospace', fontWeight: 900, fontSize: '1.1rem',
                          color: effectiveActive ? '#4338ca' : '#ef4444', letterSpacing: '0.08em',
                          border: `1px dashed ${effectiveActive ? '#6366f1' : '#f87171'}`
                        }}>
                          {c.code}
                        </div>

                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                            {c.type === 'percent' ? `${c.value}% OFF` : `FLAT ₹${c.value} OFF`}
                            {c.planId !== 'all' && (
                              <span style={{ color: '#6366f1', marginLeft: 8, fontSize: '0.8rem', background: '#eef2ff', padding: '2px 8px', borderRadius: 6 }}>
                                {plans.find(p => p.id === c.planId)?.name || c.planId}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 3 }}>
                            {c.description} • Used {c.usedCount || 0} times{c.maxUses ? ` / max ${c.maxUses}` : ' (unlimited)'}
                            {c.expiresAt && ` • Valid until ${new Date(c.expiresAt).toLocaleDateString('en-IN')}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                          background: effectiveActive ? '#dcfce7' : '#fee2e2',
                          color: effectiveActive ? '#15803d' : '#b91c1c'
                        }}>
                          {effectiveActive ? 'ACTIVE' : isExpiredCpn ? 'EXPIRED' : isMaxed ? 'LIMIT REACHED' : 'DISABLED'}
                        </span>

                        <button onClick={() => toggleCoupon(c.id)} style={{
                          background: c.active ? '#f8fafc' : '#f0fdf4',
                          color: c.active ? '#64748b' : '#15803d',
                          border: '1px solid #e2e8f0', borderRadius: 8, padding: '5px 12px',
                          cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem'
                        }}>
                          {c.active ? 'Pause' : 'Activate'}
                        </button>

                        <button onClick={() => deleteCoupon(c.id)} style={{
                          background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                          borderRadius: 8, padding: '5px 8px', cursor: 'pointer'
                        }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: ACTIVE RECRUITER SUBSCRIPTIONS ─────────────────────────── */}
        {activeTab === 'active' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>All Recruiter Subscriptions & Access Status</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Every active subscription unlocks full recruiter job posting and candidate messaging automatically.</p>
              </div>
            </div>

            {subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8', background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0' }}>
                <Users size={44} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#475569' }}>No subscriptions found yet</p>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem' }}>When recruiters subscribe or when you grant access, they will appear here</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {['Recruiter Account', 'Current Plan', 'Paid Amount', 'Validity Remaining', 'Expiry Date', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 1.1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s, i) => (
                      <tr key={s.id || s.email} style={{ borderBottom: i < subscriptions.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{s.email}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.paymentMethod || 'Razorpay / Instant'}</div>
                        </td>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <span style={{ background: `${planColor[s.planId] || '#6366f1'}15`, color: planColor[s.planId] || '#6366f1', borderRadius: 20, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                            {s.planName || s.planId}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.1rem', fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                          ₹{Number(s.amountPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1rem 1.1rem', fontSize: '0.88rem', fontWeight: 700, color: s.isExpired ? '#ef4444' : s.daysRemaining <= 3 ? '#f59e0b' : '#059669' }}>
                          {s.isExpired ? 'Expired' : `${s.daysRemaining} days left`}
                        </td>
                        <td style={{ padding: '1rem 1.1rem', fontSize: '0.82rem', color: '#64748b' }}>
                          {s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          <span style={{
                            fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                            background: s.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                            color: s.status === 'ACTIVE' ? '#15803d' : '#b91c1c'
                          }}>
                            {s.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.1rem' }}>
                          {s.status === 'ACTIVE' && (
                            <button onClick={() => cancelSub(s.email)} style={{
                              background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca',
                              borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.78rem',
                              display: 'flex', alignItems: 'center', gap: 4
                            }}>
                              <XCircle size={13} /> Cancel Access
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: MANUAL VIP GRANT ───────────────────────────────────────── */}
        {activeTab === 'grant' && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ margin: '0 0 0.4rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Manual Subscription / VIP Access Grant</h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#64748b' }}>Instantly unlock a recruiter account without requiring payment (e.g. for VIP enterprise partners or free promotional trials).</p>

            <div style={{ background: '#fff', borderRadius: 18, padding: '1.8rem', border: '1.5px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Recruiter Email Address *</label>
                <input 
                  type="email" 
                  value={grantForm.email} 
                  onChange={e => setGrantForm(d => ({ ...d, email: e.target.value }))} 
                  placeholder="e.g. recruiter@techcorp.com"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', boxSizing: 'border-box' }} 
                />

                {/* Quick pick recruiter email */}
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'center' }}>Quick Select:</span>
                  {(registeredUsers || []).filter(u => u.accountType === 'recruiter').slice(0, 6).map(u => (
                    <button 
                      key={u.email} 
                      onClick={() => setGrantForm(d => ({ ...d, email: u.email }))} 
                      style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      {u.name || u.email}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Select Plan to Grant</label>
                <select 
                  value={grantForm.planId} 
                  onChange={e => setGrantForm(d => ({ ...d, planId: e.target.value }))} 
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }}
                >
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name} ({p.durationLabel} - Max {p.maxJobPosts} jobs)</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: 4 }}>Custom Validity in Days (Optional)</label>
                <input 
                  type="number" 
                  value={grantForm.customDays} 
                  onChange={e => setGrantForm(d => ({ ...d, customDays: e.target.value }))} 
                  placeholder="Leave empty to use plan default duration"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} 
                />
              </div>

              <button onClick={grantSubscription} style={{
                background: 'linear-gradient(135deg, #4f46e5, #4338ca)', color: '#fff', border: 'none',
                borderRadius: 12, padding: '0.85rem', cursor: 'pointer', fontWeight: 800, fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: '0.5rem',
                boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
              }}>
                <Gift size={20} /> Grant Full Recruiter Access
              </button>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 14, padding: '1rem 1.25rem', marginTop: '1.4rem', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={20} color="#2563eb" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: '#1e40af', fontWeight: 600, lineHeight: 1.4 }}>
                Active subscriptions take top priority over admin verification status. Recruiter will immediately have access to post jobs and contact candidates.
              </span>
            </div>
          </div>
        )}

        {/* ── TAB 5: PAYMENT HISTORY ────────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Payment Records & Transaction Audit ({history.length})</h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748b' }}>Audit trail of all online and granted recruiter transactions.</p>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Total Processed: <strong style={{ color: '#059669', fontSize: '1.1rem' }}>₹{totalRevenue.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8', background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0' }}>
                <Clock size={44} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: '#475569' }}>No payment records yet</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {['Recruiter Email', 'Plan Name', 'Amount Paid', 'Payment Method', 'Transaction ID', 'Date & Time'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 1.1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.id || i} style={{ borderBottom: i < history.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{h.email}</td>
                        <td style={{ padding: '0.95rem 1.1rem' }}>
                          <span style={{ background: `${planColor[h.planId] || '#6366f1'}15`, color: planColor[h.planId] || '#6366f1', borderRadius: 20, padding: '3px 10px', fontSize: '0.78rem', fontWeight: 700 }}>
                            {h.planName || h.planId}
                          </span>
                        </td>
                        <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                          ₹{Number(h.amountPaid || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>{h.paymentMethod || 'Online'}</td>
                        <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {h.transactionId || h.id || '—'}
                        </td>
                        <td style={{ padding: '0.95rem 1.1rem', fontSize: '0.82rem', color: '#64748b' }}>
                          {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
