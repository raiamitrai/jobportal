import React, { useState } from 'react';
import {
  Search,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Video,
  BookOpen,
  Compass,
  ShieldCheck,
  FileText,
  ChevronRight,
  User,
  Briefcase,
  Bookmark,
  CheckCircle2,
  Send,
  X,
  Star,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// Comprehensive Help Articles Database categorized per topic card
const helpArticlesDB = [
  // ── Getting Started (6 Articles) ──
  {
    id: 101,
    title: 'How to create a candidate account on CAREONIX?',
    description: 'Register as a candidate with your email address.',
    category: 'Getting Started',
    keywords: ['register', 'create account', 'signup', 'getting started'],
    content: ['1. Click Register on login page.', '2. Select Candidate account type.', '3. Fill in name and email.']
  },
  {
    id: 102,
    title: 'How to log in with Email & Password?',
    description: 'Access your candidate portal dashboard.',
    category: 'Getting Started',
    keywords: ['login', 'signin', 'password', 'access account'],
    content: ['1. Enter registered email.', '2. Enter password.', '3. Click Login.']
  },
  {
    id: 103,
    title: 'How to verify your email address via MailHog OTP?',
    description: 'Verify your account using the 6-digit OTP code.',
    category: 'Getting Started',
    keywords: ['email verification', 'otp', 'mailhog', 'verify email'],
    content: ['1. Check MailHog inbox at http://localhost:8025.', '2. Copy 6-digit OTP.', '3. Enter OTP code.']
  },
  {
    id: 104,
    title: 'Account activation & registration guide',
    description: 'Complete guide for new candidate onboarding.',
    category: 'Getting Started',
    keywords: ['activation', 'guide', 'onboarding'],
    content: ['Welcome to CAREONIX! Follow the onboarding steps to set up your account.']
  },
  {
    id: 105,
    title: 'Setting up your profile for verified recruiters',
    description: 'Make your candidate profile visible to top employers.',
    category: 'Getting Started',
    keywords: ['recruiters', 'visibility', 'profile setup'],
    content: ['Complete your skills and resume upload to be discovered by recruiters.']
  },
  {
    id: 106,
    title: 'Candidate Portal Overview & Navigation',
    description: 'Learn how to navigate Dashboard, Jobs, Applications and Profile.',
    category: 'Getting Started',
    keywords: ['portal', 'navigation', 'dashboard overview'],
    content: ['Use the left sidebar menu to switch between Dashboard, Browse Jobs, My Applications, Saved Jobs and Profile.']
  },

  // ── Profile & Resume (8 Articles) ──
  {
    id: 1,
    title: 'How to upload your resume?',
    description: 'Learn how to upload or replace your resume on CAREONIX.',
    category: 'Profile & Resume',
    keywords: ['resume', 'cv', 'upload resume', 'update cv', 'pdf', 'bio-data', 'upload'],
    content: [
      '1. Navigate to the Profile page from the candidate sidebar.',
      '2. Scroll to the "Resume Upload" section.',
      '3. Drag and drop or browse your latest PDF/DOCX resume file.',
      '4. Click Save Changes to update your profile for verified recruiters.'
    ]
  },
  {
    id: 2,
    title: 'How to update your resume?',
    description: 'Update your latest resume and skills from your profile page.',
    category: 'Profile & Resume',
    keywords: ['resume', 'cv', 'update resume', 'skills', 'experience', 'edit profile', 'update'],
    content: [
      '1. Open your Profile page on CAREONIX.',
      '2. Click the "Edit Profile" button.',
      '3. Update your resume file, key skills, and contact details.',
      '4. Save changes to keep your profile 100% current.'
    ]
  },
  {
    id: 3,
    title: 'Resume requirements & file size limits',
    description: 'Supported file formats (PDF, DOCX) and max size limits.',
    category: 'Profile & Resume',
    keywords: ['resume', 'cv', 'file format', 'size limit', 'pdf', 'docx', 'requirements'],
    content: [
      'CAREONIX supports PDF and DOCX resume formats.',
      'Maximum file size is 5MB.',
      'Ensure your contact email and phone number are clearly visible on your CV.'
    ]
  },
  {
    id: 8,
    title: 'How to update your profile information?',
    description: 'Edit name, phone number, location, and primary skills.',
    category: 'Profile & Resume',
    keywords: ['profile', 'update profile', 'edit details', 'phone', 'location', 'name'],
    content: [
      '1. Click "Profile" in the left sidebar menu.',
      '2. Click "Edit Profile".',
      '3. Update your personal details and primary skill tags.',
      '4. Click Save Changes.'
    ]
  },
  {
    id: 205,
    title: 'How to verify your mobile phone number via OTP?',
    description: 'Verify your phone number to boost your profile score.',
    category: 'Profile & Resume',
    keywords: ['phone', 'verify phone', 'otp', 'mobile verification'],
    content: ['1. Go to Profile.', '2. Click Verify Phone.', '3. Enter 6-digit OTP code.']
  },
  {
    id: 206,
    title: 'How to improve profile strength to 100%?',
    description: 'Complete all sections for maximum recruiter reach.',
    category: 'Profile & Resume',
    keywords: ['profile strength', '100% score', 'profile score'],
    content: ['Complete Personal Info, Resume, Skills, Education, Experience, Preferences and Phone Verification to get 100% Score!']
  },
  {
    id: 207,
    title: 'Managing skills and education details',
    description: 'Add new skill tags and update your CGPA/degree.',
    category: 'Profile & Resume',
    keywords: ['skills', 'education', 'degree', 'cgpa'],
    content: ['Click + Add More under Skills or Edit under Education to update your qualifications.']
  },
  {
    id: 208,
    title: 'Updating preferred job roles and locations',
    description: 'Set your career targets and relocation preferences.',
    category: 'Profile & Resume',
    keywords: ['preferences', 'roles', 'preferred location', 'salary'],
    content: ['Update your Job Preferences card on your Profile page.']
  },

  // ── Find & Apply Jobs (7 Articles) ──
  {
    id: 4,
    title: 'How to apply for a job on CAREONIX?',
    description: 'Step-by-step guide to applying for verified job postings.',
    category: 'Find & Apply Jobs',
    keywords: ['apply', 'job application', 'how to apply', 'official portal', 'submit application'],
    content: [
      '1. Browse verified job opportunities on the Browse Jobs page.',
      '2. Click "Apply Now" on your desired job card.',
      '3. You will be redirected to the official company career portal (Google, Microsoft, Amazon, etc.).',
      '4. Complete application submission on the company site.',
      '5. Confirm application status on CAREONIX to log it into My Applications.'
    ]
  },
  {
    id: 6,
    title: 'Why am I redirected to the company site?',
    description: 'Understanding direct company redirection for zero spam transparency.',
    category: 'Find & Apply Jobs',
    keywords: ['redirect', 'company site', 'official career page', 'external link', 'why redirect'],
    content: [
      'CAREONIX aggregates authentic job listings directly from corporate career portals.',
      'To eliminate recruiter spam and protect candidates, applications are submitted directly on the employer\'s official portal.'
    ]
  },
  {
    id: 303,
    title: 'How to filter jobs by location, salary, and experience?',
    description: 'Use the left filter panel on Browse Jobs.',
    category: 'Find & Apply Jobs',
    keywords: ['filter jobs', 'location filter', 'salary range'],
    content: ['Select job filters on the left panel to refine your job search.']
  },
  {
    id: 304,
    title: 'Verified company job listings index',
    description: 'Genuine hiring from Microsoft, Google, Amazon, Zomato, etc.',
    category: 'Find & Apply Jobs',
    keywords: ['verified company', 'genuine jobs', 'top hiring'],
    content: ['All listings tagged with Verified badge come directly from official hiring channels.']
  },
  {
    id: 305,
    title: 'Applying to remote & hybrid tech roles',
    description: 'Find work-from-home and hybrid career options.',
    category: 'Find & Apply Jobs',
    keywords: ['remote', 'work from home', 'hybrid jobs'],
    content: ['Filter location by Remote to see all remote software engineering roles.']
  },
  {
    id: 306,
    title: 'Understanding salary ranges & job details',
    description: 'CTC Breakdown and compensation transparency.',
    category: 'Find & Apply Jobs',
    keywords: ['salary', 'compensation', 'ctc'],
    content: ['View explicit salary ranges on every job card.']
  },
  {
    id: 307,
    title: 'Job application redirection FAQs',
    description: 'Common questions about applying on corporate portals.',
    category: 'Find & Apply Jobs',
    keywords: ['faqs', 'redirection faq'],
    content: ['Applications are processed directly by the company HR team.']
  },

  // ── Applications (5 Articles) ──
  {
    id: 5,
    title: 'How to track my application status?',
    description: 'Manage hiring stages, interview status, and application timelines.',
    category: 'Applications',
    keywords: ['track status', 'application status', 'my applications', 'interview status', 'hiring stage'],
    content: [
      '1. Go to "My Applications" from the left sidebar.',
      '2. Click "Update Status v" on any applied job card.',
      '3. Update your stage (Under Review, Shortlisted, Interview, Offer, Rejected).',
      '4. Select any card to view your interactive Application Timeline on the right sidebar.'
    ]
  },
  {
    id: 402,
    title: 'How to update hiring stages (Interview, Offer, Under Review)?',
    description: 'Keep your application status synchronized.',
    category: 'Applications',
    keywords: ['hiring stage', 'update status', 'interview stage'],
    content: ['Click Update Status dropdown on your application card.']
  },
  {
    id: 403,
    title: 'Understanding your Application Timeline',
    description: 'Interactive step-by-step application history.',
    category: 'Applications',
    keywords: ['timeline', 'application timeline'],
    content: ['View exact date and status changes on the right timeline panel.']
  },
  {
    id: 404,
    title: 'What to do if status is Unknown?',
    description: 'Manually update your hiring progress.',
    category: 'Applications',
    keywords: ['status unknown', 'manual update'],
    content: ['Since applications are submitted on company sites, update status manually on CAREONIX.']
  },
  {
    id: 405,
    title: 'Managing past submitted job applications',
    description: 'Review your complete job search history.',
    category: 'Applications',
    keywords: ['application history', 'past applications'],
    content: ['Filter applications by All Status or Time filter on My Applications page.']
  },

  // ── Saved Jobs (4 Articles) ──
  {
    id: 7,
    title: 'How to save jobs for later?',
    description: 'Bookmark jobs and manage your Saved Jobs list.',
    category: 'Saved Jobs',
    keywords: ['save job', 'bookmark', 'saved jobs', 'save for later', 'favorite'],
    content: [
      '1. Click the Bookmark icon on any job card.',
      '2. Access all bookmarked listings anytime under "Saved Jobs".',
      '3. Apply whenever you are ready before application deadlines.'
    ]
  },
  {
    id: 502,
    title: 'Managing bookmarked jobs in Saved Jobs',
    description: 'Organize your bookmarked opportunities.',
    category: 'Saved Jobs',
    keywords: ['manage saved', 'bookmarks'],
    content: ['View all saved positions in list or grid view under Saved Jobs.']
  },
  {
    id: 503,
    title: 'Sorting and filtering saved opportunities',
    description: 'Filter saved jobs by experience, type, and location.',
    category: 'Saved Jobs',
    keywords: ['sort saved', 'filter saved'],
    content: ['Use the right sidebar filters on Saved Jobs page.']
  },
  {
    id: 504,
    title: 'Removing saved jobs from your list',
    description: 'Unbookmark positions you are no longer interested in.',
    category: 'Saved Jobs',
    keywords: ['remove saved', 'unbookmark'],
    content: ['Click the purple bookmark icon or select Remove from Saved in options menu.']
  },

  // ── Account & Security (6 Articles) ──
  {
    id: 601,
    title: 'How to change your account password?',
    description: 'Keep your login credentials secure.',
    category: 'Account & Security',
    keywords: ['password', 'change password', 'security'],
    content: ['Go to Profile > Account Settings to update password.']
  },
  {
    id: 602,
    title: 'Phone verification & account security benefits',
    description: 'Why phone verification protects your identity.',
    category: 'Account & Security',
    keywords: ['phone security', 'verification benefits'],
    content: ['Phone verification prevents fake profiles and increases trust with recruiters.']
  },
  {
    id: 603,
    title: 'Data privacy & security policy',
    description: 'How CAREONIX safeguards your personal information.',
    category: 'Account & Security',
    keywords: ['privacy', 'security policy', 'data safety'],
    content: ['Your contact information and saved jobs are encrypted and strictly private.']
  },
  {
    id: 604,
    title: 'Managing notifications & recruiter alerts',
    description: 'Configure email and SMS notification settings.',
    category: 'Account & Security',
    keywords: ['notifications', 'alerts', 'email alerts'],
    content: ['Manage notification preferences under Account Settings.']
  },
  {
    id: 605,
    title: 'Two-factor authentication & OTP safety',
    description: 'Best practices for safe OTP logins.',
    category: 'Account & Security',
    keywords: ['2fa', 'otp safety', 'authentication'],
    content: ['Never share your 6-digit OTP code with anyone.']
  },
  {
    id: 606,
    title: 'How to delete or deactivate account',
    description: 'Steps to request account removal.',
    category: 'Account & Security',
    keywords: ['delete account', 'deactivate'],
    content: ['Contact support@careonix.com to request permanent account deletion.']
  }
];

export default function HelpSupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicCategory, setSelectedTopicCategory] = useState(null);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Live Chat messages state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: '👋 Hello! Welcome to CAREONIX Live Support. How can we assist you today?', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Sample Help Topics matching reference image 100%
  const helpTopics = [
    {
      id: 'getting-started',
      icon: User,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Getting Started',
      desc: 'Learn how to create your account and get started.',
      count: '6 Articles'
    },
    {
      id: 'profile-resume',
      icon: Briefcase,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Profile & Resume',
      desc: 'Manage your profile, resume and personal information.',
      count: '8 Articles'
    },
    {
      id: 'find-apply-jobs',
      icon: Compass,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Find & Apply Jobs',
      desc: 'Find jobs and apply on official career pages.',
      count: '7 Articles'
    },
    {
      id: 'applications',
      icon: FileText,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Applications',
      desc: 'Track and manage your job applications.',
      count: '5 Articles'
    },
    {
      id: 'saved-jobs',
      icon: Bookmark,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Saved Jobs',
      desc: "Save and organize jobs you're interested in.",
      count: '4 Articles'
    },
    {
      id: 'account-security',
      icon: ShieldCheck,
      bgColor: '#f3e8ff',
      iconColor: '#7c3aed',
      title: 'Account & Security',
      desc: 'Manage your account settings and security.',
      count: '6 Articles'
    }
  ];

  // Keyword Search Engine Filtering Logic
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = normalizedQuery === '' ? [] : helpArticlesDB.filter(art => {
    const inTitle = art.title.toLowerCase().includes(normalizedQuery);
    const inDesc = art.description.toLowerCase().includes(normalizedQuery);
    const inCat = art.category.toLowerCase().includes(normalizedQuery);
    const inKeywords = art.keywords.some(kw => kw.toLowerCase().includes(normalizedQuery));
    return inTitle || inDesc || inCat || inKeywords;
  });

  // Category Filtering or Show All Articles
  let displayedArticles = helpArticlesDB;
  if (selectedTopicCategory) {
    displayedArticles = helpArticlesDB.filter(art => art.category === selectedTopicCategory);
  } else if (!showAllArticles) {
    displayedArticles = helpArticlesDB.slice(0, 6);
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: 'user', text: chatInput, time: 'Just now' };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulate instant support agent reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Thank you for reaching out! A support representative has received your request and will assist you shortly. You can also email support@careonix.com.',
          time: 'Just now'
        }
      ]);
    }, 1000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@careonix.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setShowFeedbackModal(false);
      setFeedbackText('');
    }, 1600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Page Header Title ────────────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          Help & Support
        </h1>
        <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
          We're here to help! Find answers to your questions or reach out to our support team.
        </p>
      </div>

      {/* ── 2-Column Layout: Main Content + Right Sidebar ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── LEFT MAIN COLUMN ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

          {/* 1. Hero Search Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%)',
            border: '1px solid #e0e7ff',
            borderRadius: '20px',
            padding: '2.25rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(79,70,229,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{ flex: 1, maxWidth: '580px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  How can we help you?
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>
                  Search for help articles, guides and more.
                </p>

                {/* Pill Search Input */}
                <div style={{ position: 'relative', width: '100%', marginBottom: '1.25rem' }}>
                  <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search for help articles, topics..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 3rem',
                      borderRadius: '9999px',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  />
                  {searchQuery && (
                    <X size={16} color="#94a3b8" style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
                  )}
                </div>

                {/* Popular Searches Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a' }}>Popular Searches:</span>
                  {['How to apply', 'Update profile', 'Resume upload', 'Application status'].map((tag, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(tag)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '9999px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#475569',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#c7d2fe'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Graphic Illustration (Chat Bubble & Headset SVG) */}
              <div style={{ width: '130px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 8px 24px rgba(124,58,237,0.3)', transform: 'rotate(-6deg)' }}>
                  <MessageSquare size={40} />
                </div>
                <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '50px', height: '50px', borderRadius: '50%', background: '#ede9fe', border: '3px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                  <HelpCircle size={26} />
                </div>
              </div>
            </div>
          </div>

          {/* ── STATE 2: ACTIVE SEARCH RESULTS PANEL (When candidate types) ── */}
          {normalizedQuery !== '' && (
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem 1.75rem', boxShadow: '0 4px 20px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '600' }}>Search: </span>
                  <strong style={{ color: '#4f46e5', fontSize: '0.98rem' }}>"{searchQuery}"</strong>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: searchResults.length > 0 ? '#059669' : '#dc2626', background: searchResults.length > 0 ? '#f0fdf4' : '#fef2f2', border: `1px solid ${searchResults.length > 0 ? '#bbf7d0' : '#fecaca'}`, padding: '3px 12px', borderRadius: '20px' }}>
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                </div>
              </div>

              {searchResults.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                    No articles matching "{searchQuery}". Try searching for <strong style={{ color: '#4f46e5', cursor: 'pointer' }} onClick={() => setSearchQuery('resume')}>"resume"</strong>, <strong style={{ color: '#4f46e5', cursor: 'pointer' }} onClick={() => setSearchQuery('apply')}>"apply"</strong>, or <strong style={{ color: '#4f46e5', cursor: 'pointer' }} onClick={() => setSearchQuery('status')}>"status"</strong>.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Suggested Articles
                  </div>
                  {searchResults.map(art => (
                    <div
                      key={art.id}
                      onClick={() => setSelectedArticle(art)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#c7d2fe';
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                        <FileText size={20} color="#7c3aed" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <h4 style={{ fontSize: '0.96rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                            {art.title}
                          </h4>
                          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 6px 0' }}>
                            {art.description}
                          </p>
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7c3aed', background: '#f3e8ff', border: '1px solid #ddd6fe', padding: '2px 8px', borderRadius: '6px', display: 'inline-block' }}>
                            {art.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Browse Help Topics Grid */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '1rem' }}>
              Browse Help Topics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.1rem' }}>
              {helpTopics.map(topic => {
                const Icon = topic.icon;
                const isSelected = selectedTopicCategory === topic.title;

                return (
                  <div
                    key={topic.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTopicCategory(null);
                      } else {
                        setSelectedTopicCategory(topic.title);
                        setShowAllArticles(true);
                      }
                    }}
                    style={{
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      border: `2px solid ${isSelected ? '#7c3aed' : '#e2e8f0'}`,
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justify: 'space-between',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 4px 14px rgba(124,58,237,0.12)' : '0 1px 4px rgba(15,23,42,0.02)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#c7d2fe';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.08)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,0.02)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: topic.bgColor, color: topic.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: isSelected ? '#7c3aed' : '#0f172a', margin: '0 0 4px 0' }}>
                          {topic.title}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                          {topic.desc}
                        </p>
                        <span style={{ fontSize: '0.74rem', color: isSelected ? '#7c3aed' : '#64748b', fontWeight: isSelected ? '800' : '600' }}>
                          {topic.count}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} color={isSelected ? '#7c3aed' : '#94a3b8'} style={{ flexShrink: 0, marginTop: '4px' }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Articles Grid (Dynamic Filtering based on Topic Card Click) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {selectedTopicCategory ? `${selectedTopicCategory} Articles` : (showAllArticles ? 'All Help Articles' : 'Popular Articles')}
                <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#7c3aed', background: '#f3e8ff', border: '1px solid #ddd6fe', padding: '2px 10px', borderRadius: '12px' }}>
                  {displayedArticles.length} {displayedArticles.length === 1 ? 'Article' : 'Articles'}
                </span>
              </h3>

              {(selectedTopicCategory || showAllArticles) && (
                <button
                  onClick={() => {
                    setSelectedTopicCategory(null);
                    setShowAllArticles(false);
                    setSearchQuery('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <X size={14} /> Reset Filter / Show Popular
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {displayedArticles.map(article => (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(15,23,42,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#c7d2fe';
                    e.currentTarget.style.background = '#fcfcfd';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} color="#7c3aed" style={{ flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', display: 'block' }}>
                        {article.title}
                      </span>
                      {selectedTopicCategory ? (
                        <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                          {article.description}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: '600', marginTop: '2px', display: 'inline-block' }}>
                          {article.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>

            {/* View All Articles Button */}
            {!showAllArticles && !selectedTopicCategory && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.25rem' }}>
                <button
                  onClick={() => {
                    setShowAllArticles(true);
                    setSelectedTopicCategory(null);
                  }}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '9999px',
                    background: '#ffffff',
                    border: '1.5px solid #c7d2fe',
                    color: '#4f46e5',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79,70,229,0.05)',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  View All Articles ({helpArticlesDB.length})
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT SIDEBAR (STICKY ON SCROLL) ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'sticky', top: '1.5rem', alignSelf: 'start' }}>

          {/* 1. Still Need Help? Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Still Need Help?
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.15rem 0', lineHeight: '1.4' }}>
              Can't find what you're looking for?<br />Our support team is here for you.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Option A: Live Chat */}
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={16} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>Live Chat</span>
                  </div>
                  {/* Green active online dot */}
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10b981' }} title="Support Online"></span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 6px 0' }}>Chat with our support team</p>
                <div style={{ fontSize: '0.74rem', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
                  Available: 9 AM - 9 PM
                </div>
                <button
                  onClick={() => setShowLiveChat(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#7c3aed',
                    background: 'none',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <MessageSquare size={14} /> Start Chat
                </button>
              </div>

              {/* Option B: Email Support */}
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>Email Support</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 6px 0' }}>Send us an email anytime</p>
                <button
                  onClick={handleCopyEmail}
                  style={{
                    color: '#4f46e5',
                    background: 'none',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  support@careonix.com {copiedEmail ? <Check size={13} color="#10b981" /> : <Copy size={12} />}
                </button>
              </div>

              {/* Option C: Call Us */}
              <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone size={16} />
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#0f172a' }}>Call Us</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 4px 0' }}>Speak with our support team</p>
                <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#4f46e5', margin: '2px 0' }}>
                  +91 98765 43210
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mon - Sat, 10 AM - 6 PM</div>
              </div>
            </div>
          </div>

          {/* 2. Quick Resources Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Quick Resources
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { label: 'Video Tutorials', icon: Video },
                { label: 'User Guides', icon: BookOpen },
                { label: 'Career Portal Guide', icon: Compass },
                { label: 'Privacy Policy', icon: ShieldCheck },
                { label: 'Terms of Service', icon: FileText }
              ].map((res, idx) => {
                const Icon = res.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => alert(`Opening ${res.label}...`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      width: '100%',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '10px',
                      background: 'transparent',
                      color: '#1e293b',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <Icon size={16} color="#7c3aed" />
                      {res.label}
                    </div>
                    <ChevronRight size={15} color="#94a3b8" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Give Feedback Card */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 6px rgba(15,23,42,0.03)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
              Give Feedback
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
              Help us improve CAREONIX by sharing your feedback.
            </p>

            <button
              onClick={() => setShowFeedbackModal(true)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #c7d2fe',
                color: '#4f46e5',
                fontSize: '0.86rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 2px 6px rgba(79,70,229,0.05)',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              ✏️ Share Feedback
            </button>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: Interactive Article Reader Modal ───────────────────── */}
      {selectedArticle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '540px', background: '#ffffff', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', relative: 'position' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: '700', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedArticle.category}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0 0' }}>
                  {selectedArticle.title}
                </h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #f1f5f9', marginBottom: '1.5rem' }}>
              {selectedArticle.content.map((step, idx) => (
                <p key={idx} style={{ fontSize: '0.88rem', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                  {step}
                </p>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedArticle(null)} style={{ padding: '0.65rem 1.5rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '0.88rem', cursor: 'pointer' }}>
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Interactive Live Chat Widget Modal ─────────────────── */}
      {showLiveChat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '440px', height: '520px', background: '#ffffff', borderRadius: '20px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>CAREONIX Support Chat</h4>
                  <span style={{ fontSize: '0.72rem', opacity: 0.9 }}>● Online — Usually replies in 1 min</span>
                </div>
              </div>
              <button onClick={() => setShowLiveChat(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages body */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                  <div style={{
                    padding: '0.7rem 0.95rem',
                    borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: msg.sender === 'user' ? '#4f46e5' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : '#0f172a',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.84rem',
                    lineHeight: '1.4',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.04)'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px', display: 'block', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} style={{ padding: '0.75rem 1rem', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.55rem 0.85rem', fontSize: '0.85rem', outline: 'none' }}
              />
              <button type="submit" style={{ padding: '0.55rem 1rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Share Feedback Modal ───────────────────────────────── */}
      {showFeedbackModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ width: '480px', background: '#ffffff', borderRadius: '20px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Share Your Feedback
              </h3>
              <button onClick={() => setShowFeedbackModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', background: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Thank you for your feedback!</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Your input helps us improve CAREONIX for everyone.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Rate your experience:</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={28}
                        color={star <= feedbackRating ? '#f59e0b' : '#cbd5e1'}
                        fill={star <= feedbackRating ? '#f59e0b' : 'none'}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setFeedbackRating(star)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '6px' }}>Your comments or suggestions:</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you like or how we can improve..."
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.86rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowFeedbackModal(false)} style={{ padding: '0.65rem 1.25rem', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" style={{ padding: '0.65rem 1.4rem', background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
