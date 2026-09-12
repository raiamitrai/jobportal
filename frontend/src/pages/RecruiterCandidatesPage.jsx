import React, { useState, useEffect } from 'react';
import ENDPOINTS from '../config/api';
import {
  Search,
  Filter,
  Download,
  Users,
  UserCheck,
  Star,
  Sparkles,
  MapPin,
  Briefcase,
  GraduationCap,
  Clock,
  Eye,
  FileText,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Send,
  X,
  CheckCircle2,
  Lock,
  Bookmark,
  TrendingUp,
  Printer,
  ExternalLink,
  Mail,
  Phone,
  Building,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { useChat } from '../context/ChatContext';
import { getSettings } from '../utils/settingsManager';

export default function RecruiterCandidatesPage({ setActiveTab }) {
  const { user } = useAuth();
  const { jobs, applications } = useJobs();
  const { openConversation, sendMessage } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('ALL');
  const [experienceFilter, setExperienceFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [educationFilter, setEducationFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(null);
  const [resumeTab, setResumeTab] = useState('uploaded'); // 'uploaded' | 'structured'
  const [showInviteModal, setShowInviteModal] = useState(null);
  const [selectedInviteJobId, setSelectedInviteJobId] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleOpenChatWithCandidate = (cand) => {
    if (!cand) return;
    const cleanCandEmail = (cand.email || `${cand.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`).toLowerCase().trim();
    const cleanRecEmail = (user?.email || user?.identifier || '').toLowerCase().trim();
    const jobTitle = cand.appliedJobTitle || cand.role || 'Job Opportunity';
    const chosenJob = (jobs || []).find(j => j.title === cand.appliedJobTitle) || (jobs || [])[0];
    const jobId = chosenJob?.id || '1';

    if (openConversation) {
      openConversation({
        candidateEmail: cleanCandEmail,
        candidateName: cand.name,
        recruiterEmail: cleanRecEmail,
        recruiterName: user?.name || cleanRecEmail.split('@')[0],
        companyName: user?.company || 'CAREONIX Partner',
        jobId: jobId,
        jobTitle: jobTitle
      });
      if (setActiveTab) {
        setActiveTab('messages');
      }
    } else if (setActiveTab) {
      setActiveTab('messages');
    }
  };

  const handleDownloadResume = (cand) => {
    if (!cand) return;

    // Case 1: Candidate uploaded a real file (Base64 data URL, blob, or URL)
    if (cand.resumeData && (cand.resumeData.startsWith('data:') || cand.resumeData.startsWith('blob:') || cand.resumeData.startsWith('http'))) {
      const link = document.createElement('a');
      link.href = cand.resumeData;
      link.download = cand.resumeFileName || `${cand.name.replace(/\s+/g, '_')}_Resume.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast(`📥 Downloading ${cand.resumeFileName || 'Resume.pdf'}...`);
      return;
    }

    // Case 2: Structured CAREONIX Resume Document - Printable View / Save as PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      triggerToast('⚠️ Please allow popups to preview and download the resume PDF.');
      return;
    }

    const skillsHtml = (cand.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join('');
    const eduList = Array.isArray(cand.educationList) && cand.educationList.length > 0
      ? cand.educationList
      : [{ degree: cand.degree || 'Bachelor of Technology', university: cand.university || 'Technical University', years: '2020 – 2024', cgpa: '8.5 / 10' }];

    const eduHtml = eduList.map(e => `
      <div class="item">
        <div class="item-head">
          <strong>${e.degree || 'Degree'}</strong>
          <span class="meta">${e.years || ''}</span>
        </div>
        <div class="sub">${e.university || ''} ${e.cgpa ? `• CGPA / Grade: ${e.cgpa}` : ''}</div>
      </div>
    `).join('');

    const expList = Array.isArray(cand.experienceList) && cand.experienceList.length > 0
      ? cand.experienceList
      : [{
          title: (cand.role || 'Software Developer').replace('Applicant for ', ''),
          company: 'Software Engineering Solutions',
          duration: cand.experience || '2 – 4 Years',
          note: `Actively developed and maintained enterprise applications specializing in ${(cand.skills || []).slice(0, 3).join(', ')}.`
        }];

    const expHtml = expList.map(x => `
      <div class="item">
        <div class="item-head">
          <strong>${x.title || 'Role'}</strong>
          <span class="meta">${x.duration || ''}</span>
        </div>
        <div class="sub">${x.company || ''} ${x.type ? `• ${x.type}` : ''}</div>
        ${x.note ? `<p class="desc">${x.note}</p>` : ''}
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cand.name} - Official Resume (CAREONIX)</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            color: #0f172a;
            background: #ffffff;
            line-height: 1.5;
          }
          .resume-container {
            max-width: 820px;
            margin: 0 auto;
            border: 1px solid #e2e8f0;
            padding: 45px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #6366f1;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .name {
            font-size: 28px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 6px 0;
          }
          .role {
            font-size: 16px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 8px;
          }
          .contact-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            font-size: 13px;
            color: #64748b;
          }
          .contact-item { display: flex; align-items: center; gap: 4px; }
          .section { margin-bottom: 24px; }
          .section-title {
            font-size: 13px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #4338ca;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
            margin-bottom: 12px;
          }
          .summary-text {
            font-size: 14px;
            color: #334155;
            line-height: 1.6;
            margin: 0;
          }
          .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .skill-tag {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            color: #1e293b;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12.5px;
            font-weight: 600;
          }
          .item { margin-bottom: 16px; }
          .item-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 14.5px;
            color: #0f172a;
          }
          .meta { font-size: 12.5px; color: #64748b; font-weight: 600; }
          .sub { font-size: 13px; color: #4f46e5; font-weight: 600; margin-top: 2px; }
          .desc { font-size: 13px; color: #475569; margin: 6px 0 0 0; line-height: 1.5; }
          .footer-watermark {
            margin-top: 35px;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11px;
            color: #94a3b8;
          }
          @media print {
            body { padding: 0; background: #fff; }
            .resume-container { border: none; box-shadow: none; padding: 20px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 20px; padding: 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; margin-right: 12px;">
            🖨️ Print / Save as PDF
          </button>
          <span style="font-size: 13px; color: #64748b;">(Choose "Save as PDF" destination in print dialog)</span>
        </div>

        <div class="resume-container">
          <div class="header">
            <div>
              <h1 class="name">${cand.name}</h1>
              <div class="role">${cand.role}</div>
              <div class="contact-bar">
                <span class="contact-item">📧 ${cand.email}</span>
                <span class="contact-item">📱 ${cand.phone}</span>
                <span class="contact-item">📍 ${cand.location}</span>
                ${cand.appliedJobTitle ? `<span class="contact-item">💼 Applied: <strong>${cand.appliedJobTitle}</strong></span>` : ''}
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p class="summary-text">${cand.summary || 'Qualified professional seeking high impact engineering roles.'}</p>
          </div>

          ${cand.coverNote ? `
          <div class="section">
            <div class="section-title">Candidate Application Note / Cover Letter</div>
            <p class="summary-text" style="font-style: italic; background: #f8fafc; padding: 12px; border-radius: 8px; border-left: 3px solid #6366f1;">
              "${cand.coverNote}"
            </p>
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Key Skills & Technical Stack</div>
            <div class="skills-grid">
              ${skillsHtml}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Work Experience</div>
            ${expHtml}
          </div>

          <div class="section">
            <div class="section-title">Education & Academic Background</div>
            ${eduHtml}
          </div>

          <div class="footer-watermark">
            <span>Verified Candidate Profile • CAREONIX Talent Directory</span>
            <span>Generated on ${new Date().toLocaleDateString('en-GB')}</span>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    triggerToast('📄 Resume ready for Print / Save as PDF!');
  };

  const handleSendInvitation = (shouldOpenChat = false) => {
    if (!showInviteModal) return;
    const cleanCandEmail = (showInviteModal.email || `${showInviteModal.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`).toLowerCase().trim();
    const cleanRecEmail = (user?.email || user?.identifier || '').toLowerCase().trim();
    const chosenJob = (jobs || []).find(j => String(j.id) === String(selectedInviteJobId)) || (jobs || [])[0];
    const jobTitle = chosenJob?.title || 'Job Opportunity';
    const jobId = chosenJob?.id || '1';
    const messageBody = inviteMsg.trim() || `Hi ${showInviteModal.name}, we reviewed your profile on CAREONIX and believe your skills match our position for "${jobTitle}". Let's connect!`;

    if (openConversation) {
      const thread = openConversation({
        candidateEmail: cleanCandEmail,
        candidateName: showInviteModal.name,
        recruiterEmail: cleanRecEmail,
        recruiterName: user?.name || cleanRecEmail.split('@')[0],
        companyName: user?.company || 'CAREONIX Partner',
        jobId: jobId,
        jobTitle: jobTitle
      });

      if (thread && sendMessage) {
        sendMessage(thread.id, messageBody, 'recruiter', cleanRecEmail);
      }
    }

    setShowInviteModal(null);
    setInviteMsg('');
    triggerToast(`Invitation & message sent successfully to ${showInviteModal.name}!`);
    if (shouldOpenChat && setActiveTab) {
      setActiveTab('messages');
    }
  };

  // Candidate directory (Real Candidates only)
  const initialCandidates = [];

  const [dbCandidates, setDbCandidates] = useState([]);

  // Fetch live candidates via API Gateway
  useEffect(() => {
    fetch(ENDPOINTS.profiles('?size=1000'))
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.content || []);
        if (list.length > 0) {
          const formatted = list
            .filter(p => (p.role || '').toLowerCase() === 'candidate' || (p.role || '').toLowerCase() === 'client')
            .map((p, idx) => {
              const cleanEmail = (p.email || '').toLowerCase().trim();
              const savedAvatar = cleanEmail ? localStorage.getItem(`careonix_prof_${cleanEmail}_avatar`) : null;
              const avatar = savedAvatar || p.avatar || p.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail || idx}`;

              return {
                id: `db-cand-${p.id || idx}`,
                name: p.fullName || p.name || (p.email ? p.email.split('@')[0] : 'Job Seeker'),
                role: p.headline || 'Software Professional',
                degree: p.education || 'B.Tech • Computer Science',
                university: p.university || 'State Technological University',
                skills: p.skills ? p.skills.split(',').map(s => s.trim()) : ['Java', 'React', 'SQL'],
                extraSkillsCount: 2,
                experience: p.experience || '1 – 2 Years',
                expRange: '1-3',
                location: p.location || 'India',
                lastActive: 'Just Now',
                online: true,
                avatar: avatar,
                availability: 'Open to Opportunities',
                discoverable: true,
                contactShared: true,
                email: p.email,
                phone: p.phone || '+91 98000 11223',
                summary: p.bio || 'Verified Job Seeker on CAREONIX Talent Directory.'
              };
            });
          setDbCandidates(formatted);
        }
      })
      .catch(err => console.log('Notice fetching MySQL DB candidates:', err.message));
  }, []);

  // Filter candidates to ONLY those who have applied to at least ONE job posted by this recruiter
  const recruiterUserEmail = (user?.email || '').toLowerCase().trim();
  const recruiterCompany = (user?.company || '').toLowerCase().trim();

  // Find recruiter's posted job IDs & Titles
  const recruiterJobIds = new Set(
    (jobs || [])
      .filter(j =>
        (j.postedBy || '').toLowerCase().trim() === recruiterUserEmail ||
        (recruiterCompany && (j.company || '').toLowerCase().trim().includes(recruiterCompany))
      )
      .map(j => String(j.id))
  );

  // Applications for this recruiter's jobs
  const recruiterApplications = (applications || []).filter(app => {
    const appJobId = String(app.jobId || '');
    const appCompany = (app.company || '').toLowerCase().trim();

    return recruiterJobIds.has(appJobId) ||
           (recruiterCompany && appCompany.includes(recruiterCompany)) ||
           (recruiterUserEmail && (app.postedBy || '').toLowerCase().trim() === recruiterUserEmail);
  });

  const appliedCandidateEmails = new Set(
    recruiterApplications.map(app => (app.candidateEmail || app.email || '').toLowerCase().trim())
  );

  // Helper to extract candidate profile values from localStorage
  const getCandVal = (cleanEmail, k, def = '') => {
    if (!cleanEmail) return def;
    try {
      const v = localStorage.getItem(`careonix_prof_${cleanEmail}_${k}`);
      return (v !== null && v !== undefined && v !== '') ? v : def;
    } catch (e) {
      return def;
    }
  };

  const getCandJson = (cleanEmail, k, def = null) => {
    if (!cleanEmail) return def;
    try {
      const v = localStorage.getItem(`careonix_prof_${cleanEmail}_${k}`);
      return v ? JSON.parse(v) : def;
    } catch (e) {
      return def;
    }
  };

  const buildCandidateObject = (app, cleanEmail, idx) => {
    const savedAvatar = localStorage.getItem(`careonix_prof_${cleanEmail}_avatar`);
    const avatar = savedAvatar || app?.candidateAvatar || app?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail || idx}`;

    const candName = app?.candidateName || getCandVal(cleanEmail, 'name') || (cleanEmail ? cleanEmail.split('@')[0] : 'Applicant');
    const appliedJobTitle = app?.jobTitle || '';
    const candRole = getCandVal(cleanEmail, 'headline') || (appliedJobTitle ? `Applicant for ${appliedJobTitle}` : 'Software Developer');

    // Education extraction
    const rawEdu = app?.candidateEducation || getCandJson(cleanEmail, 'education');
    let degree = 'Bachelor of Technology (B.Tech)';
    let university = 'Technical University';
    let educationList = [];

    if (Array.isArray(rawEdu) && rawEdu.length > 0) {
      educationList = rawEdu;
      degree = rawEdu[0].degree || rawEdu[0].title || degree;
      university = rawEdu[0].university || rawEdu[0].institution || university;
    } else if (rawEdu && typeof rawEdu === 'object' && (rawEdu.degree || rawEdu.university)) {
      educationList = [rawEdu];
      degree = rawEdu.degree || degree;
      university = rawEdu.university || university;
    } else if (typeof rawEdu === 'string' && rawEdu.trim()) {
      degree = rawEdu.trim();
      university = getCandVal(cleanEmail, 'university', 'Technical University');
      educationList = [{ degree: rawEdu.trim(), university, years: '2020 – 2024', cgpa: '8.4 / 10' }];
    } else {
      degree = getCandVal(cleanEmail, 'education', 'Bachelor of Technology (B.Tech)');
      university = getCandVal(cleanEmail, 'university', 'Technical University');
      educationList = [
        { degree, university, years: '2020 – 2024', cgpa: '8.5 / 10' },
        { degree: 'Higher Secondary School Certificate (12th)', university: 'Central Board of Secondary Education', years: '2018 – 2020', cgpa: '89%' }
      ];
    }

    // Skills extraction
    const rawSkills = app?.candidateSkills || getCandJson(cleanEmail, 'skills');
    let skills = [];
    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      skills = rawSkills;
    } else if (typeof rawSkills === 'string' && rawSkills.trim()) {
      skills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      const lowerRole = (appliedJobTitle || candRole).toLowerCase();
      if (lowerRole.includes('java')) {
        skills = ['Java', 'React', 'SQL', 'Spring Boot', 'Hibernate'];
      } else if (lowerRole.includes('python')) {
        skills = ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker'];
      } else if (lowerRole.includes('front') || lowerRole.includes('react')) {
        skills = ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Next.js'];
      } else {
        skills = ['Java', 'React', 'SQL', 'Git', 'Data Structures'];
      }
    }

    // Experience extraction
    const rawExp = app?.candidateExperience || getCandJson(cleanEmail, 'experience');
    let experienceList = [];
    let expDisplay = app?.experience || getCandVal(cleanEmail, 'experience') || '2-4 Yrs';

    if (Array.isArray(rawExp) && rawExp.length > 0) {
      experienceList = rawExp;
      expDisplay = rawExp[0].duration || expDisplay;
    } else if (rawExp && typeof rawExp === 'object' && (rawExp.title || rawExp.company)) {
      experienceList = [rawExp];
      expDisplay = rawExp.duration || expDisplay;
    } else {
      experienceList = [
        {
          title: appliedJobTitle || 'Software Engineer',
          company: 'Enterprise Technology Solutions',
          type: 'Full-time',
          duration: expDisplay || '2-4 Yrs',
          current: true,
          note: `Responsible for designing and deploying resilient software components, writing RESTful services, and collaborating with cross-functional development teams.`
        }
      ];
    }

    // Contact and Bio
    const phone = app?.candidatePhone || app?.phone || getCandVal(cleanEmail, 'phone', '+91 98765 43210');
    const location = app?.candidateLocation || app?.location || getCandVal(cleanEmail, 'location', 'Bangalore, Karnataka');
    const about = app?.candidateAbout || getCandVal(cleanEmail, 'about') || '';
    const coverNote = app?.coverNote || '';
    const summary = about || (coverNote ? `Application Note: "${coverNote}"` : `Dedicated professional with proven competency in ${(skills || []).slice(0, 3).join(', ')}. Strong background in software design, problem-solving, and building high-performance solutions.`);

    // Resume File Resolution
    let resumeData = app?.candidateResumeData || app?.resumeData || app?.resume || app?.resumeUrl || '';
    let resumeFileName = app?.resumeFileName || app?.resumeName || '';

    if (!resumeData && cleanEmail) {
      resumeData = getCandVal(cleanEmail, 'resume_data', '');
    }
    if (!resumeFileName && cleanEmail) {
      resumeFileName = getCandVal(cleanEmail, 'resume_name', '');
    }
    if (!resumeData && cleanEmail) {
      resumeData = localStorage.getItem(`careonix_cand_resume_${cleanEmail}`) ||
                   localStorage.getItem(`careonix_resume_${cleanEmail}`) || '';
    }
    if (!resumeData && cleanEmail && Array.isArray(applications)) {
      const otherApp = applications.find(a =>
        (a.candidateEmail || a.email || '').toLowerCase().trim() === cleanEmail &&
        (a.candidateResumeData || a.resumeData || a.resume)
      );
      if (otherApp) {
        resumeData = otherApp.candidateResumeData || otherApp.resumeData || otherApp.resume || '';
        if (!resumeFileName) {
          resumeFileName = otherApp.resumeFileName || otherApp.resumeName || '';
        }
      }
    }

    if (!resumeFileName) {
      const safeName = candName.replace(/\s+/g, '_');
      const safeJob = (appliedJobTitle || 'Software_Developer').replace(/\s+/g, '_');
      resumeFileName = `${safeName}_${safeJob}_Resume.pdf`;
    }

    const resumeDate = getCandVal(cleanEmail, 'resume_date') || app?.appliedDate || 'Verified';
    const resumeSize = getCandVal(cleanEmail, 'resume_size') || '1.8 MB';
    const hasUploadedResume = Boolean(resumeData && (resumeData.startsWith('data:') || resumeData.startsWith('blob:') || resumeData.startsWith('http')));

    return {
      id: `app-cand-${app?.id || idx}`,
      name: candName,
      role: candRole,
      degree: degree,
      university: university,
      skills: skills,
      extraSkillsCount: Math.max(0, skills.length - 3),
      experience: expDisplay,
      expRange: '1-3',
      location: location,
      lastActive: app?.appliedDate ? `Applied on ${app.appliedDate}` : 'Active Recently',
      online: true,
      avatar: avatar,
      availability: 'Applied Candidate',
      discoverable: true,
      contactShared: true,
      email: cleanEmail,
      phone: phone,
      summary: summary,
      coverNote: coverNote,
      appliedJobTitle: appliedJobTitle,
      appliedDate: app?.appliedDate || 'Recently',
      educationList: educationList,
      experienceList: experienceList,
      resumeData: resumeData,
      resumeFileName: resumeFileName,
      resumeDate: resumeDate,
      resumeSize: resumeSize,
      hasUploadedResume: hasUploadedResume,
      socialLinks: getCandJson(cleanEmail, 'social_links') || {}
    };
  };

  // Merge candidates from recruiterApplications + registered users + DB candidates
  const candidatePool = [];

  // 1. Always include candidates who submitted applications to recruiter's jobs
  recruiterApplications.forEach((app, idx) => {
    const cleanEmail = (app.candidateEmail || app.email || '').toLowerCase().trim();
    if (cleanEmail && !candidatePool.some(c => c.email?.toLowerCase() === cleanEmail)) {
      candidatePool.push(buildCandidateObject(app, cleanEmail, idx));
    }
  });

  // 2. Add profiles from registered users ONLY IF candidate has applied to recruiter's jobs
  try {
    const localReg = localStorage.getItem('careonix_registered_users');
    if (localReg) {
      const parsedReg = JSON.parse(localReg);
      if (Array.isArray(parsedReg)) {
        parsedReg.forEach((ru, idx) => {
          const cleanEmail = (ru.email || ru.identifier || '').toLowerCase().trim();
          if (cleanEmail && appliedCandidateEmails.has(cleanEmail)) {
            const existingIdx = candidatePool.findIndex(c => c.email?.toLowerCase() === cleanEmail);
            if (existingIdx !== -1) {
              const current = candidatePool[existingIdx];
              candidatePool[existingIdx] = {
                ...current,
                name: ru.name || current.name,
                phone: ru.phone || current.phone,
                location: ru.location || current.location,
                role: current.role || ru.headline || 'Software Developer'
              };
            }
          }
        });
      }
    }
  } catch (e) {}

  // 3. Add profiles from DB candidates ONLY IF candidate has applied to recruiter's jobs
  dbCandidates.forEach(dbc => {
    const cleanEmail = (dbc.email || '').toLowerCase().trim();
    if (cleanEmail && appliedCandidateEmails.has(cleanEmail)) {
      const existingIdx = candidatePool.findIndex(c => c.email?.toLowerCase() === cleanEmail);
      if (existingIdx !== -1) {
        candidatePool[existingIdx] = { ...candidatePool[existingIdx], ...dbc };
      } else {
        candidatePool.push(dbc);
      }
    }
  });

  // Filter Logic on candidatePool
  const filteredCandidates = candidatePool.filter(cand => {
    const q = searchTerm.toLowerCase().trim();
    const matchesQuery = !q ||
      cand.name.toLowerCase().includes(q) ||
      cand.role.toLowerCase().includes(q) ||
      cand.location.toLowerCase().includes(q) ||
      cand.skills.some(s => s.toLowerCase().includes(q));

    const matchesSkill = skillFilter === 'ALL' || cand.skills.some(s => s.toLowerCase() === skillFilter.toLowerCase());
    const matchesExperience = experienceFilter === 'ALL' || cand.expRange === experienceFilter;
    const matchesLocation = locationFilter === 'ALL' || cand.location.toLowerCase().includes(locationFilter.toLowerCase());

    return matchesQuery && matchesSkill && matchesExperience && matchesLocation;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: '#10b981', color: '#ffffff',
          padding: '0.9rem 1.4rem', borderRadius: '14px', boxShadow: '0 10px 25px rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 300, fontWeight: '700', fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Title & Header Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Candidates
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '0.9rem' }}>
            Search and discover talented candidates from our platform.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.55rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} color="#7c3aed" /> Daily Talent Quota: <strong style={{ color: '#7c3aed' }}>{getSettings()?.platform?.candidateSearchPerDay || '100'} searches/day</strong>
          </div>
          <button
            onClick={() => triggerToast('Exporting candidates list as CSV...')}
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff', border: 'none', borderRadius: '12px',
              padding: '0.7rem 1.35rem', fontWeight: '800', fontSize: '0.88rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
            }}
          >
            <Download size={16} /> Export Candidates
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Card */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Main Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search by name, skills, job title or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px',
              border: '1px solid #e2e8f0', background: '#fafafa', fontSize: '0.9rem',
              outline: 'none', fontFamily: 'Inter, sans-serif', color: '#0f172a'
            }}
          />
        </div>

        {/* Filters Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          
          {/* Skills Filter Dropdown */}
          <select
            value={skillFilter}
            onChange={e => setSkillFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
          >
            <option value="ALL">Skills (All)</option>
            <option value="Java">Java</option>
            <option value="Spring Boot">Spring Boot</option>
            <option value="React">React</option>
            <option value="Node.js">Node.js</option>
            <option value="AWS">AWS</option>
            <option value="MySQL">MySQL</option>
          </select>

          {/* Experience Filter Dropdown */}
          <select
            value={experienceFilter}
            onChange={e => setExperienceFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
          >
            <option value="ALL">Experience (All)</option>
            <option value="fresher">0 – 1 Years</option>
            <option value="1-3">1 – 3 Years</option>
            <option value="3-5">3 – 5 Years</option>
            <option value="5+">5+ Years</option>
          </select>

          {/* Location Filter Dropdown */}
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
          >
            <option value="ALL">Location (All)</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Delhi">Delhi / NCR</option>
            <option value="Varanasi">Varanasi</option>
            <option value="Bhopal">Bhopal</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Education Filter Dropdown */}
          <select
            value={educationFilter}
            onChange={e => setEducationFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
          >
            <option value="ALL">Education (All)</option>
            <option value="B.Tech">B.Tech / B.E.</option>
            <option value="BCA">BCA / MCA</option>
            <option value="M.Tech">M.Tech</option>
          </select>

          {/* Availability Filter Dropdown */}
          <select
            value={availabilityFilter}
            onChange={e => setAvailabilityFilter(e.target.value)}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.84rem', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
          >
            <option value="ALL">Availability (All)</option>
            <option value="Open">Open to Opportunities</option>
            <option value="Notice">Serving Notice Period</option>
            <option value="Immediate">Immediate Joiner</option>
          </select>

          {/* Reset / More Filters Button */}
          <button
            onClick={() => { setSkillFilter('ALL'); setExperienceFilter('ALL'); setLocationFilter('ALL'); setSearchTerm(''); }}
            style={{ padding: '0.55rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.84rem', fontWeight: '700', color: '#4f46e5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Filter size={15} /> Reset Filters
          </button>
        </div>

      </div>

      {/* Main 2-Column Content Layout (Matching Screenshot 100%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: '1.5rem', alignItems: 'flex-start' }}>

        {/* Left Column: Candidate Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Subheader: Candidate Count & Sort */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.25rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
              Total Candidates: <span style={{ color: '#4f46e5' }}>{filteredCandidates.length}</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: '#64748b' }}>
              <span>Sort by:</span>
              <select style={{ border: 'none', background: 'transparent', fontWeight: '700', color: '#0f172a', fontSize: '0.84rem', cursor: 'pointer' }}>
                <option>Recently Updated</option>
                <option>Most Relevant</option>
                <option>Experience: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          {filteredCandidates.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '3rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <Users size={42} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>No Candidate Applicants Yet</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '420px', margin: '4px auto 0' }}>
                Only candidates who have applied to at least one of your posted jobs will appear here.
              </p>
            </div>
          ) : (
            filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  gap: '1.25rem',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Left: Avatar + Info */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.15rem', flex: 1 }}>
                  
                  {/* Candidate Avatar with online green dot */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img
                      src={cand.avatar}
                      alt={cand.name}
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #f1f5f9' }}
                    />
                    {cand.online && (
                      <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '13px', height: '13px', borderRadius: '50%', background: '#22c55e', border: '2px solid #ffffff' }} />
                    )}
                  </div>

                  {/* Name, Role & Education */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {cand.name}
                      </h3>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e' }} />
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#4f46e5' }}>
                      {cand.role}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
                      {cand.degree}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {cand.university}
                    </div>
                  </div>
                </div>

                {/* Middle 1: Skills Pill Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '240px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Skills</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {cand.skills.slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        style={{
                          background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0',
                          padding: '3px 9px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '600'
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                    {cand.extraSkillsCount > 0 && (
                      <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 8px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: '700' }}>
                        +{cand.extraSkillsCount}
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle 2: Experience & Location */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '130px', flexShrink: 0 }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Experience</span>
                    <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{cand.experience}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                    <MapPin size={13} color="#94a3b8" />
                    <span>{cand.location}</span>
                  </div>
                </div>

                {/* Middle 3: Last Active */}
                <div style={{ width: '100px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Last Active</span>
                  <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '600' }}>{cand.lastActive}</span>
                </div>

                {/* Right: Action Buttons (View Profile & View Resume) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => setSelectedCandidate(cand)}
                    style={{
                      background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5',
                      padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.8rem',
                      fontWeight: '700', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease'
                    }}
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => {
                      setShowResumeModal(cand);
                      setResumeTab(cand.hasUploadedResume ? 'uploaded' : 'structured');
                    }}
                    style={{
                      background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5',
                      padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.8rem',
                      fontWeight: '700', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease'
                    }}
                  >
                    View Resume
                  </button>
                </div>

                {/* More Menu ⋮ */}
                <button
                  onClick={() => setShowInviteModal(cand)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
                >
                  <MoreVertical size={18} />
                </button>

              </div>
            ))
          )}

          {/* Pagination Footer (Matching Screenshot 100%) */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            
            {/* Page Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronLeft size={16} />
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: '#6366f1', color: '#ffffff', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer' }}>
                1
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                2
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                3
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                4
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                5
              </button>
              <span style={{ color: '#94a3b8', padding: '0 4px' }}>...</span>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#475569', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
                42
              </button>
              <button style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Showing Count */}
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
              Showing {filteredCandidates.length} of {candidatePool.length} candidates
            </span>

            {/* Page Size Select */}
            <select style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>
              <option>10 / page</option>
              <option>20 / page</option>
              <option>50 / page</option>
            </select>

          </div>

        </div>

        {/* Right Sidebar Stats & Skill Trends Panel (100% Matching Screenshot) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: Candidate Overview Stats */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Candidate Overview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#475569', fontWeight: '600' }}>
                  <Users size={17} color="#6366f1" />
                  <span>Total Applicants</span>
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: '800' }}>{candidatePool.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#475569', fontWeight: '600' }}>
                  <UserCheck size={17} color="#22c55e" />
                  <span>Active Applicants</span>
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#16a34a', fontWeight: '800' }}>{candidatePool.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#475569', fontWeight: '600' }}>
                  <Star size={17} color="#3b82f6" />
                  <span>New Applications</span>
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#2563eb', fontWeight: '800' }}>{candidatePool.length}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.84rem', color: '#475569', fontWeight: '600' }}>
                  <Sparkles size={17} color="#a855f7" />
                  <span>Job Applicants</span>
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#7c3aed', fontWeight: '800' }}>{candidatePool.length}</strong>
              </div>

            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Quick Actions
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              <div onClick={() => triggerToast('Advanced candidate search active')} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Search size={17} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Advanced Search</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Use advanced filters to find the right candidates</span>
                </div>
              </div>

              <div onClick={() => triggerToast('Saved search templates loaded')} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bookmark size={17} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Saved Searches</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View your saved candidate searches</span>
                </div>
              </div>

              <div onClick={() => triggerToast('Opening Talent Pool')} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Users size={17} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Talent Pool</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>View all candidates in your talent pool</span>
                </div>
              </div>

              <div onClick={() => triggerToast('Invite candidates portal ready')} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fdf4ff', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Send size={17} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.84rem', color: '#0f172a', display: 'block' }}>Invite Candidates</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Invite candidates to apply for your jobs</span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 3: Top Skills Progress Bars */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.35rem', boxShadow: '0 1px 4px rgba(15,23,42,0.02)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>
              Top Skills
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              
              {/* Java */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>Java</span>
                  <span style={{ color: '#64748b' }}>654</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '90%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>

              {/* Spring Boot */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>Spring Boot</span>
                  <span style={{ color: '#64748b' }}>482</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>

              {/* JavaScript */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>JavaScript</span>
                  <span style={{ color: '#64748b' }}>378</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '55%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>

              {/* React */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>React</span>
                  <span style={{ color: '#64748b' }}>352</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '50%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>

              {/* MySQL */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                  <span style={{ color: '#0f172a' }}>MySQL</span>
                  <span style={{ color: '#64748b' }}>298</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: '#6366f1', borderRadius: '10px' }} />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button onClick={() => triggerToast('All 50+ skills taxonomy loaded')} style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}>
                  View all skills
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* ── MODAL 1: View Candidate Profile ──────────────────────────────── */}
      {selectedCandidate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '680px', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', borderRadius: '24px', padding: '2rem', boxShadow: '0 25px 60px rgba(15,23,42,0.25)', border: '1px solid #e2e8f0' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={selectedCandidate.avatar} alt={selectedCandidate.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818cf8' }} />
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{selectedCandidate.name}</h2>
                  <div style={{ fontSize: '0.95rem', color: '#4f46e5', fontWeight: '700', marginTop: '2px' }}>{selectedCandidate.role}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {selectedCandidate.degree} • {selectedCandidate.university}
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedCandidate(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* Application Info Badge */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#166534', fontWeight: '600' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Applied for: <strong style={{ color: '#15803d' }}>{selectedCandidate.appliedJobTitle || selectedCandidate.role}</strong></span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>{selectedCandidate.lastActive}</span>
            </div>

            {/* Contact Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #f1f5f9', marginBottom: '1.25rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <Mail size={15} color="#64748b" />
                <span>Email: <strong style={{ color: '#0f172a' }}>{selectedCandidate.email}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <Phone size={15} color="#64748b" />
                <span>Phone: <strong style={{ color: '#0f172a' }}>{selectedCandidate.phone}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <MapPin size={15} color="#64748b" />
                <span>Location: <strong style={{ color: '#0f172a' }}>{selectedCandidate.location}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                <Briefcase size={15} color="#64748b" />
                <span>Experience: <strong style={{ color: '#0f172a' }}>{selectedCandidate.experience}</strong></span>
              </div>
            </div>

            {/* Attached Resume Banner Card */}
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', border: '1.5px solid #ddd6fe',
              borderRadius: '16px', padding: '1.1rem 1.25rem', display: 'flex',
              justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem',
              flexWrap: 'wrap', gap: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ffffff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(124,58,237,0.15)' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1e1b4b' }}>
                    {selectedCandidate.resumeFileName || 'Candidate_Resume.pdf'}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#6b21a8', marginTop: '2px' }}>
                    {selectedCandidate.hasUploadedResume ? `Uploaded Document • ${selectedCandidate.resumeSize} • ${selectedCandidate.resumeDate}` : 'Verified CAREONIX Profile Resume Sheet'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    const c = selectedCandidate;
                    setSelectedCandidate(null);
                    setShowResumeModal(c);
                    setResumeTab(c.hasUploadedResume ? 'uploaded' : 'structured');
                  }}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: '10px', background: '#ffffff',
                    border: '1.5px solid #7c3aed', color: '#7c3aed', fontWeight: '800',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Eye size={14} /> View Resume
                </button>
                <button
                  onClick={() => handleDownloadResume(selectedCandidate)}
                  style={{
                    padding: '0.55rem 1.1rem', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
                    border: 'none', color: '#ffffff', fontWeight: '800',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Download size={14} /> Download
                </button>
              </div>
            </div>

            {/* Candidate Bio / Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Professional Summary</h4>
              <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6', margin: 0, background: '#f8fafc', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                {selectedCandidate.summary}
              </p>
            </div>

            {/* Cover Note if provided */}
            {selectedCandidate.coverNote && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' }}>Applicant Cover Note</h4>
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #6366f1', padding: '0.85rem 1.1rem', borderRadius: '0 12px 12px 0', fontSize: '0.86rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                  "{selectedCandidate.coverNote}"
                </div>
              </div>
            )}

            {/* Skills */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>Key Technical Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedCandidate.skills.map((s, i) => (
                  <span key={i} style={{ background: '#f3e8ff', color: '#7c3aed', padding: '5px 12px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: '700' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  setSelectedCandidate(null);
                  handleOpenChatWithCandidate(selectedCandidate);
                }}
                style={{ padding: '0.75rem 1.4rem', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <MessageSquare size={16} /> Message Candidate
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setSelectedCandidate(null)} style={{ padding: '0.75rem 1.4rem', borderRadius: '12px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                  Close
                </button>
                <button
                  onClick={() => { setSelectedCandidate(null); setShowInviteModal(selectedCandidate); }}
                  style={{ padding: '0.75rem 1.6rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} /> Invite to Apply for Job
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 2: Interactive Resume Viewer ───────────────────────────── */}
      {showResumeModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 300, padding: '1rem'
        }}>
          <div style={{
            width: '840px', maxWidth: '96vw', maxHeight: '92vh', overflowY: 'auto',
            background: '#ffffff', borderRadius: '24px', padding: '2rem',
            boxShadow: '0 25px 60px rgba(15,23,42,0.25)', border: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', gap: '1.25rem'
          }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Resume Preview — {showResumeModal.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '3px 0 0 0' }}>
                    {showResumeModal.appliedJobTitle ? `Applied for: ${showResumeModal.appliedJobTitle}` : showResumeModal.role} • {showResumeModal.appliedDate}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => handleDownloadResume(showResumeModal)}
                  title="Print or Save as PDF"
                  style={{
                    padding: '0.55rem 1rem', borderRadius: '10px', background: '#f8fafc',
                    border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => handleDownloadResume(showResumeModal)}
                  style={{
                    padding: '0.55rem 1.15rem', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none', color: '#ffffff', fontWeight: '800',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                    boxShadow: '0 2px 10px rgba(79,70,229,0.25)'
                  }}
                >
                  <Download size={15} /> Download PDF
                </button>
                <button
                  onClick={() => setShowResumeModal(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>
            </div>

            {/* View Mode Switcher Tabs */}
            {showResumeModal.hasUploadedResume ? (
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                <button
                  onClick={() => setResumeTab('uploaded')}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none',
                    background: resumeTab === 'uploaded' ? '#7c3aed' : '#f1f5f9',
                    color: resumeTab === 'uploaded' ? '#ffffff' : '#475569',
                    fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FileText size={15} /> Uploaded Document File ({showResumeModal.resumeFileName})
                </button>
                <button
                  onClick={() => setResumeTab('structured')}
                  style={{
                    padding: '0.5rem 1.1rem', borderRadius: '10px', border: 'none',
                    background: resumeTab === 'structured' ? '#7c3aed' : '#f1f5f9',
                    color: resumeTab === 'structured' ? '#ffffff' : '#475569',
                    fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Award size={15} /> CAREONIX Structured Resume
                </button>
              </div>
            ) : (
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem'
              }}>
                <span style={{ color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#7c3aed" />
                  <strong>Verified Candidate Resume Sheet</strong> • Generated from candidate application & profile
                </span>
                <span style={{ color: '#64748b' }}>File: {showResumeModal.resumeFileName}</span>
              </div>
            )}

            {/* Tab 1 Content: Uploaded Resume Document Viewer */}
            {resumeTab === 'uploaded' && showResumeModal.hasUploadedResume && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Meta toolbar */}
                <div style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569' }}>
                    <span>📄 <strong style={{ color: '#0f172a' }}>{showResumeModal.resumeFileName}</strong></span>
                    <span>•</span>
                    <span>Size: {showResumeModal.resumeSize}</span>
                    <span>•</span>
                    <span>Uploaded: {showResumeModal.resumeDate}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.open(showResumeModal.resumeData, '_blank')}
                      style={{
                        padding: '0.4rem 0.85rem', borderRadius: '8px', background: '#ffffff',
                        border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700',
                        fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <ExternalLink size={13} /> Open in New Tab
                    </button>
                    <button
                      onClick={() => handleDownloadResume(showResumeModal)}
                      style={{
                        padding: '0.4rem 0.85rem', borderRadius: '8px', background: '#7c3aed',
                        border: 'none', color: '#ffffff', fontWeight: '700',
                        fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Download size={13} /> Download File
                    </button>
                  </div>
                </div>

                {/* Embedded PDF/Doc Preview Frame */}
                <div style={{
                  width: '100%', height: '540px', borderRadius: '14px',
                  overflow: 'hidden', border: '1px solid #cbd5e1', background: '#0f172a'
                }}>
                  <iframe
                    src={showResumeModal.resumeData}
                    title={`${showResumeModal.name} Resume`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748b', textAlign: 'center' }}>
                  💡 If your browser does not render the preview above, click "Open in New Tab" or "Download File".
                </div>
              </div>
            )}

            {/* Tab 2 (or default): Structured CAREONIX Executive Resume Sheet */}
            {(resumeTab === 'structured' || !showResumeModal.hasUploadedResume) && (
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px',
                padding: '2.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
                fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
              }}>
                {/* Resume Paper Header */}
                <div style={{ borderBottom: '2px solid #6366f1', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {showResumeModal.name}
                  </h2>
                  <div style={{ color: '#4f46e5', fontWeight: '700', fontSize: '1rem', marginTop: '4px' }}>
                    {showResumeModal.role}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '8px', fontSize: '0.84rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={14} /> {showResumeModal.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {showResumeModal.phone}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {showResumeModal.location}</span>
                    {showResumeModal.appliedJobTitle && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#7c3aed', fontWeight: '700' }}>
                        <Briefcase size={14} /> Applied: {showResumeModal.appliedJobTitle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Professional Summary */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', margin: 0 }}>
                    Professional Summary
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.6', margin: '6px 0 0 0' }}>
                    {showResumeModal.summary || 'Dedicated software professional with hands-on expertise in developing scalable, maintainable solutions and writing clean, reliable code.'}
                  </p>
                </div>

                {/* Cover Note */}
                {showResumeModal.coverNote && (
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', margin: 0 }}>
                      Candidate Application Note
                    </h4>
                    <div style={{ background: '#f8fafc', borderLeft: '3px solid #6366f1', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: '#475569', fontStyle: 'italic', lineHeight: '1.5' }}>
                      "{showResumeModal.coverNote}"
                    </div>
                  </div>
                )}

                {/* Key Skills */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', margin: 0 }}>
                    Technical Stack & Skills
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {showResumeModal.skills.map((s, i) => (
                      <span key={i} style={{ background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Work Experience */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', margin: 0 }}>
                    Work Experience
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(showResumeModal.experienceList || []).map((exp, i) => (
                      <div key={i} style={{ borderBottom: i < (showResumeModal.experienceList || []).length - 1 ? '1px dashed #e2e8f0' : 'none', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{exp.title || showResumeModal.role}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{exp.duration || showResumeModal.experience}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: '600', marginTop: '2px' }}>
                          {exp.company || 'Technology Solutions'} {exp.type ? `• ${exp.type}` : ''}
                        </div>
                        {exp.note && (
                          <p style={{ fontSize: '0.82rem', color: '#475569', margin: '4px 0 0 0', lineHeight: '1.5' }}>
                            {exp.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', margin: 0 }}>
                    Education & Academic Background
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(showResumeModal.educationList || []).map((edu, i) => (
                      <div key={i} style={{ borderBottom: i < (showResumeModal.educationList || []).length - 1 ? '1px dashed #e2e8f0' : 'none', paddingBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{edu.degree || showResumeModal.degree}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{edu.years || '2020 – 2024'}</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                          {edu.university || showResumeModal.university} {edu.cgpa ? `• CGPA: ${edu.cgpa}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Watermark Footer */}
                <div style={{
                  borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '5px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '0.74rem', color: '#94a3b8'
                }}>
                  <span>Verified Candidate Profile • CAREONIX Talent Directory</span>
                  <span>Generated on {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            )}

            {/* Modal Bottom Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
              <button
                onClick={() => {
                  const c = showResumeModal;
                  setShowResumeModal(null);
                  handleOpenChatWithCandidate(c);
                }}
                style={{
                  padding: '0.75rem 1.3rem', borderRadius: '12px', background: '#f8fafc',
                  border: '1px solid #cbd5e1', color: '#334155', fontWeight: '700',
                  fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <MessageSquare size={16} /> Message Candidate
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowResumeModal(null)}
                  style={{
                    padding: '0.75rem 1.4rem', borderRadius: '12px', background: '#f1f5f9',
                    border: 'none', color: '#475569', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadResume(showResumeModal)}
                  style={{
                    padding: '0.75rem 1.6rem', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff', border: 'none', fontWeight: '800', fontSize: '0.85rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
                  }}
                >
                  <Download size={16} /> Download Full Resume PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL 3: Invite Candidate / Message Modal ────────────────────── */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
          <div style={{ width: '520px', background: '#ffffff', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 25px 60px rgba(15,23,42,0.2)', border: '1px solid #e2e8f0' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Invite {showInviteModal.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>Send job opportunity invitation directly</p>
              </div>
              <button onClick={() => setShowInviteModal(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Select Job Vacancy</label>
                <select
                  value={selectedInviteJobId}
                  onChange={e => setSelectedInviteJobId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', background: '#ffffff', fontFamily: 'Inter, sans-serif' }}
                >
                  {(jobs || []).length > 0 ? (
                    (jobs || []).map(j => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.company || user?.company || 'Company'})
                      </option>
                    ))
                  ) : (
                    <option value="1">General Career Opportunity ({user?.company || 'Careonix Partner'})</option>
                  )}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Invitation & Direct Message</label>
                <textarea
                  rows={4}
                  placeholder={`Hi ${showInviteModal.name}, we reviewed your profile on CAREONIX and believe your skills in ${(showInviteModal.skills || []).slice(0, 2).join(', ')} match our open position.`}
                  value={inviteMsg}
                  onChange={e => setInviteMsg(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setShowInviteModal(null)} style={{ padding: '0.7rem 1.3rem', borderRadius: '10px', background: '#f1f5f9', border: 'none', color: '#475569', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button
                  onClick={() => handleSendInvitation(false)}
                  style={{ padding: '0.7rem 1.4rem', borderRadius: '10px', background: '#ffffff', border: '1.5px solid #818cf8', color: '#4f46e5', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} /> Send Message
                </button>
                <button
                  onClick={() => handleSendInvitation(true)}
                  style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#ffffff', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(99,102,241,0.3)' }}
                >
                  <MessageSquare size={14} /> Send & Open Chat
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
