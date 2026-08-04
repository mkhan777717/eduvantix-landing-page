"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search, MapPin, Briefcase, Clock, ChevronRight, Globe, Building2,
  Star, ArrowRight, FileText, Upload, Send, Loader2, CheckCircle2, X,
  Home, GraduationCap, Wrench, User, AlertTriangle, ChevronDown, Users, Laptop,
  HelpCircle, Check, Award, Heart, Sparkles, BookOpen, Layers, ShieldCheck
} from "lucide-react";

// ─── Static Job Opportunities ───────────────────────────────────────────────
const MOCK_JOBS = [
  {
    id: 1,
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "FULL_TIME",
    experience: "2-4 years",
    skills: ["React", "Node.js", "PostgreSQL"],
    description:
      "We're looking for a passionate Full Stack Developer to build and scale our platform features. You will work across the entire stack delivering high-quality code that helps thousands of students learn better every day.",
    requirements: [
      "2+ years of React.js & Node.js experience",
      "Proficiency in PostgreSQL & schema design",
      "Experience with Next.js & REST APIs",
      "Strong problem-solving skills",
    ],
    responsibilities: [
      "Design & develop new user-facing platform features",
      "Build scalable RESTful APIs & database queries",
      "Optimize application for speed and scalability",
      "Collaborate with UI designers & product team",
    ],
    postedAt: "2026-07-28",
    isHot: true,
  },
  {
    id: 2,
    title: "AI Research Engineer",
    department: "AI / ML",
    location: "Remote",
    type: "FULL_TIME",
    experience: "3-5 years",
    skills: ["Python", "PyTorch", "LLMs"],
    description:
      "Join our core AI team to research, train, and deploy next-generation LLM agents for automated viva, code grading, and personalized student mentorship.",
    requirements: [
      "MS or PhD in Computer Science / AI or equivalent",
      "Experience fine-tuning Open-Source LLMs (Llama, Mistral)",
      "Proficiency in Python, PyTorch & HuggingFace",
      "Experience with RAG systems & vector databases",
    ],
    responsibilities: [
      "Develop and fine-tune LLM models for student learning",
      "Build RAG pipelines with vector databases",
      "Monitor and evaluate AI model performance & accuracy",
      "Publish internal research and stay ahead of AI trends",
    ],
    postedAt: "2026-07-30",
    isHot: true,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Onsite",
    type: "FULL_TIME",
    experience: "2-5 years",
    skills: ["AWS", "Docker", "Kubernetes", "CI/CD"],
    description:
      "Help us build and maintain highly reliable cloud infrastructure supporting hundreds of thousands of concurrent coding sandbox environments.",
    requirements: [
      "Experience with AWS (EC2, EKS, RDS, S3)",
      "Proficiency in Docker containerization & Kubernetes",
      "Knowledge of Terraform / IaC and CI/CD pipelines",
      "Strong understanding of Linux networking & security",
    ],
    responsibilities: [
      "Maintain infrastructure uptime & system monitoring",
      "Automate deployment pipelines and cloud provisioning",
      "Optimize infrastructure cost & performance",
      "Ensure high security & data compliance standards",
    ],
    postedAt: "2026-07-25",
    isHot: false,
  },
  {
    id: 4,
    title: "UI/UX Designer Intern",
    department: "Design",
    location: "Remote",
    type: "INTERNSHIP",
    experience: "0-1 year",
    skills: ["Figma", "Prototyping", "User Research"],
    description:
      "Work alongside senior designers to create intuitive, beautiful, and accessible UI experiences for our Web, Mobile, and IDE platform products.",
    requirements: [
      "Portfolio demonstrating web/mobile interface design",
      "Proficiency in Figma, auto-layout, & design tokens",
      "Strong eye for typography, spacing, and micro-interactions",
      "Eagerness to learn and take constructive feedback",
    ],
    responsibilities: [
      "Design wireframes, component systems, and user flows",
      "Assist senior design leads in user research and testing",
      "Iterate on feedback to polish user interfaces",
    ],
    postedAt: "2026-08-02",
    isHot: false,
  },
];

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+44", flag: "🇬🇧" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+65", flag: "🇸🇬" },
  { code: "+61", flag: "🇦🇺" },
  { code: "+49", flag: "🇩🇪" },
  { code: "+33", flag: "🇫🇷" },
  { code: "+81", flag: "🇯🇵" },
  { code: "+880", flag: "🇧🇩" },
  { code: "+92", flag: "🇵🇰" },
  { code: "+94", flag: "🇱🇰" },
  { code: "+977", flag: "🇳🇵" },
  { code: "other", flag: "🌐", label: "Other" },
];

const TYPE_LABEL = { FULL_TIME: "Full-time", INTERNSHIP: "Internship", PART_TIME: "Part-time" };

// Primary sub-nav tabs (Top Header)
const TOP_TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "jobs", label: "Jobs", icon: Briefcase },
  { key: "students", label: "Students", icon: GraduationCap },
  { key: "how-we-work", label: "How we work", icon: Globe },
  { key: "how-we-hire", label: "How we hire", icon: Wrench },
  { key: "my-applications", label: "My Applications", icon: User },
];

// Sub-nav for "How we work" tab
const WORK_SUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "flexibility", label: "Flexible Working" },
  { id: "benefits", label: "Benefits & Perks" },
  { id: "diversity", label: "Inclusion & Belonging" },
];

// Sub-nav for "How we hire" tab
const HIRE_SUB_TABS = [
  { id: "process", label: "Our Process" },
  { id: "tips", label: "Interview Tips" },
  { id: "faq", label: "Hiring FAQ" },
];

export default function CareersClient({ standalone = true }) {
  const router = useRouter();
  const { user, token } = useAuth();

  // Active Navigation States
  const [activeTab, setActiveTab] = useState("home");
  const [activeWorkSubTab, setActiveWorkSubTab] = useState("overview");
  const [activeHireSubTab, setActiveHireSubTab] = useState("process");

  // Search & Filter States
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterDept, setFilterDept] = useState("ALL");

  // Job Listing & Applications Data
  const [jobs, setJobs] = useState(MOCK_JOBS);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null); // Detail Modal
  const [showApply, setShowApply] = useState(false);     // Apply Modal
  const [showAuthModal, setShowAuthModal] = useState(false); // Auth Required Modal
  const [pendingApplyJob, setPendingApplyJob] = useState(null);
  const [applyJob, setApplyJob] = useState(null);
  const [myApplications, setMyApplications] = useState([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Apply Form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [customCountryCode, setCustomCountryCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch Jobs from backend API
  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch(`${API_BASE}/api/careers/jobs`);
      const data = await res.json();
      if (data.success && data.jobs && data.jobs.length > 0) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.warn("Failed fetching backend jobs, using fallback:", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  // Fetch My Applications from backend API
  const fetchMyApplications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/careers/my-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.applications) {
        setMyApplications(data.applications.map(app => ({
          id: app.id,
          jobId: app.jobId,
          jobTitle: app.job?.title || "Role",
          department: app.job?.department || "Department",
          location: app.job?.location || "Remote",
          type: app.job?.type || "FULL_TIME",
          applicantName: app.fullName,
          email: app.email,
          mobile: app.mobile,
          resumeFileName: app.resumeFileName,
          appliedAt: new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          status: app.status,
        })));
      }
    } catch (err) {
      console.warn("Failed fetching my applications:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchMyApplications();
    }
  }, [user, token]);

  const departments = ["ALL", ...Array.from(new Set(jobs.map((j) => j.department)))];

  // Filtering Logic for Jobs
  const filteredJobs = jobs.filter((job) => {
    const matchRole = !searchRole || job.title.toLowerCase().includes(searchRole.toLowerCase()) || job.skills.some(s => s.toLowerCase().includes(searchRole.toLowerCase()));
    const matchLocation = !searchLocation || job.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchType = filterType === "ALL" || job.type === filterType;
    const matchDept = filterDept === "ALL" || job.department === filterDept;
    return matchRole && matchLocation && matchType && matchDept;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveTab("jobs");
  };

  const openApplyModal = (job) => {
    if (!user || !token) {
      setPendingApplyJob(job);
      setShowAuthModal(true);
      return;
    }
    setApplyJob(job);
    setFullName(user?.fullName || "");
    setEmail(user?.email || "");
    setMobile("");
    setCoverNote("");
    setResumeFile(null);
    setFormError("");
    setShowApply(true);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setFormError("Please upload your resume (PDF or DOCX).");
      return;
    }
    if (!mobile || mobile.length < 5) {
      setFormError("Please enter a valid mobile number.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const finalCode = countryCode === "other" ? (customCountryCode.trim() || "+") : countryCode;
      const formData = new FormData();
      formData.append("jobId", applyJob.id);
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("mobile", `${finalCode} ${mobile}`);
      if (coverNote) formData.append("coverNote", coverNote);
      formData.append("resume", resumeFile);

      const res = await fetch(`${API_BASE}/api/careers/apply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to submit application.");
      }

      await fetchMyApplications();

      setShowApply(false);
      setApplyJob(null);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
    } catch (err) {
      setFormError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-gray-900 dark:text-zinc-100 flex flex-col">
      {standalone && (
        <div className="relative z-50 py-2 [&_header]:!relative [&_header]:!top-0 [&_header]:!my-0">
          <Navbar />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0">
        {/* ── Success Toast ── */}
        {showSuccessToast && (
          <div className="fixed top-5 right-5 z-[99999] flex items-center gap-3 px-5 py-3.5 rounded-full border border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Application Submitted!</p>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">Our team will review your profile and reach out soon.</p>
            </div>
            <button onClick={() => setShowSuccessToast(false)} className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            GOOGLE CAREERS STYLE LEFT VERTICAL SIDEBAR + MAIN CONTENT
        ═════════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex min-h-0">
          {/* Left Vertical Navigation Bar (Google Careers style) */}
          <aside className="w-20 sm:w-24 shrink-0 border-r border-gray-100 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col items-center py-6 gap-6 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto no-scrollbar z-20">
            {TOP_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex flex-col items-center gap-1 w-full px-2 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-8 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs scale-105"
                        : "text-gray-500 dark:text-zinc-400 group-hover:bg-gray-100 dark:group-hover:bg-zinc-800/80"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-zinc-400"} />
                  </div>
                  <span
                    className={`text-[11px] text-center leading-tight transition-all max-w-[75px] ${
                      isActive
                        ? "font-bold text-emerald-700 dark:text-emerald-400"
                        : "font-medium text-gray-600 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {tab.key === "my-applications" && myApplications.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500 text-white -mt-0.5">
                      {myApplications.length}
                    </span>
                  )}
                </button>
              );
            })}
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 max-w-7xl w-full mx-auto min-w-0">

          {/* ── TAB 1: HOME ── */}
          {activeTab === "home" && (
            <div className="p-4 md:p-8 space-y-8">
              
              {/* HERO SECTION */}
              <section className="relative w-full rounded-3xl overflow-hidden min-h-[440px] flex items-center shadow-lg border border-gray-100 dark:border-zinc-800">
                <div className="absolute inset-0 z-0">
                  <img
                    src="/careers-hero.jpg"
                    alt="Eduvantix Office"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.style.background =
                        "linear-gradient(135deg, #042f24 0%, #064e3b 60%, #022c22 100%)";
                    }}
                  />
                  {/* Brand Emerald Psychological Color Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#03231b]/90 via-[#064e3b]/75 to-[#021f18]/80 mix-blend-multiply" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/85 via-emerald-900/50 to-transparent" />
                </div>

                {/* Floating Search Card */}
                <div className="relative z-10 p-6 md:p-12 w-full max-w-[500px]">
                  <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800">
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white leading-tight mb-6">
                      Search for your career at Eduvantix.
                    </h1>

                    <form onSubmit={handleSearchSubmit} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5 block">
                          Role
                        </label>
                        <input
                          type="text"
                          value={searchRole}
                          onChange={(e) => setSearchRole(e.target.value)}
                          placeholder="Software Engineer, Designer..."
                          className="w-full px-5 py-3 rounded-full border border-gray-200 dark:border-zinc-700 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5 block">
                          Work Location
                        </label>
                        <div className="relative">
                          <select
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            className="w-full px-5 py-3 rounded-full border border-gray-200 dark:border-zinc-700 text-sm bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 transition-all"
                          >
                            <option value="">Any location</option>
                            <option value="Remote">Remote</option>
                            <option value="Onsite">Onsite</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-8 py-3 rounded-full font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                        >
                          <Search size={14} />
                          Search
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </section>

              {/* CULTURE CARD (Bangalore HQ) */}
              <section className="rounded-3xl border border-gray-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-8 md:p-12 flex flex-col justify-between space-y-6">
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-3">
                        Our location & culture
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                        Based in Bangalore, India — the Silicon Valley of Asia. Our Eduvantix HQ team is built to inspire innovation, big ideas, and tech community.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <div className="flex items-center gap-1.5"><MapPin size={13} /> Bangalore HQ</div>
                      <div className="flex items-center gap-1.5"><Building2 size={13} /> Tech Hub</div>
                      <div className="flex items-center gap-1.5"><Sparkles size={13} /> AI Innovation Lab</div>
                      <div className="flex items-center gap-1.5"><Globe size={13} /> Hybrid Workspace</div>
                    </div>

                    <div>
                      <button
                        onClick={() => setActiveTab("jobs")}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                      >
                        View all open roles <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="h-72 lg:h-auto relative overflow-hidden bg-gray-100 dark:bg-zinc-800">
                    <img
                      src="/eduvantix-bangalore-office.png"
                      alt="Eduvantix Bangalore Office"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </section>

              {/* RECENT JOBS PREVIEW */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Featured Opportunities</h2>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">Explore recent openings across engineering, product, and AI.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    View all {jobs.length} jobs <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {TYPE_LABEL[job.type]}
                          </span>
                          {job.isHot && <span className="text-[10px] font-bold text-red-500">🔥 Hot</span>}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug mb-1">{job.title}</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">{job.department} · {job.location}</p>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                        className="w-full py-2.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                      >
                        Apply Now
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── TAB 2: JOBS LISTING ── */}
          {activeTab === "jobs" && (
            <div className="p-4 md:p-8 space-y-6">
              <div className="flex flex-col gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">Open Opportunities</h1>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                      Showing {filteredJobs.length} role{filteredJobs.length !== 1 ? "s" : ""} at Eduvantix
                    </p>
                  </div>

                  {/* Filter controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Live Search Input Box */}
                    <div className="relative min-w-[200px]">
                      <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchRole}
                        onChange={(e) => setSearchRole(e.target.value)}
                        placeholder="Search role or skill..."
                        className="w-full pl-9 pr-8 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      {searchRole && (
                        <button onClick={() => setSearchRole("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                      {["ALL", "FULL_TIME", "INTERNSHIP"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilterType(t)}
                          className={`px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                            filterType === t
                              ? "bg-emerald-600 text-white font-bold"
                              : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                          }`}
                        >
                          {t === "ALL" ? "All Types" : t === "FULL_TIME" ? "Full-time" : "Internship"}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="pl-4 pr-8 py-2 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-semibold appearance-none cursor-pointer focus:outline-none"
                      >
                        {departments.map((d) => (
                          <option key={d} value={d}>{d === "ALL" ? "All Departments" : d}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Active Search Tags Banner */}
                {(searchRole || searchLocation || filterType !== "ALL" || filterDept !== "ALL") && (
                  <div className="flex items-center gap-2 flex-wrap pt-2 text-xs">
                    <span className="text-gray-500 font-semibold">Active search:</span>
                    {searchRole && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        Role: "{searchRole}"
                        <button onClick={() => setSearchRole("")} className="hover:text-red-500 cursor-pointer ml-1"><X size={12} /></button>
                      </span>
                    )}
                    {searchLocation && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        Location: {searchLocation}
                        <button onClick={() => setSearchLocation("")} className="hover:text-red-500 cursor-pointer ml-1"><X size={12} /></button>
                      </span>
                    )}
                    {filterType !== "ALL" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        Type: {TYPE_LABEL[filterType] || filterType}
                        <button onClick={() => setFilterType("ALL")} className="hover:text-red-500 cursor-pointer ml-1"><X size={12} /></button>
                      </span>
                    )}
                    {filterDept !== "ALL" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                        Dept: {filterDept}
                        <button onClick={() => setFilterDept("ALL")} className="hover:text-red-500 cursor-pointer ml-1"><X size={12} /></button>
                      </span>
                    )}
                    <button
                      onClick={() => { setSearchRole(""); setSearchLocation(""); setFilterType("ALL"); setFilterDept("ALL"); }}
                      className="text-xs text-gray-500 hover:text-emerald-600 underline cursor-pointer ml-1"
                    >
                      Clear all
                    </button>
                  </div>
                )}
              </div>

              {/* Jobs Grid */}
              {filteredJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-4 my-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Search size={28} />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">No similar roles found</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      We couldn't find any job opportunities matching your current search query or location filter.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchRole("");
                      setSearchLocation("");
                      setFilterType("ALL");
                      setFilterDept("ALL");
                    }}
                    className="px-5 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-xs"
                  >
                    Clear Filters & View All Roles
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredJobs.map((job) => {
                    const isApplied = myApplications.some((a) => a.jobId === job.id);
                    return (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              {TYPE_LABEL[job.type]}
                            </span>
                            {isApplied ? (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={11} /> Applied
                              </span>
                            ) : job.isHot ? (
                              <span className="text-[10px] font-bold text-red-500">🔥 Hot</span>
                            ) : null}
                          </div>

                          <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1">{job.title}</h3>
                          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-3">{job.department}</p>

                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-zinc-400 mb-4 flex-wrap">
                            <span className="flex items-center gap-1"><Globe size={12} /> {job.location}</span>
                            <span className="flex items-center gap-1"><Clock size={12} /> {job.experience}</span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {job.skills.map((s) => (
                              <span key={s} className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); openApplyModal(job); }}
                          disabled={isApplied}
                          className={`w-full py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            isApplied
                              ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 cursor-not-allowed"
                              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                          }`}
                        >
                          {isApplied ? "Already Applied" : "Apply Now"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: STUDENTS ── */}
          {activeTab === "students" && (
            <div className="p-4 md:p-8 space-y-12">
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">Eduvantix for Students</h1>
                <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                  We empower university students & early-career engineers through hands-on learning, mentorship, and entry-level career opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: GraduationCap, title: "Internship Programs", desc: "Gain real-world production engineering experience working directly on scalable products." },
                  { icon: Laptop, title: "Hands-on Projects", desc: "Build industry-standard AI and full-stack software applications mentored by senior engineers." },
                  { icon: Award, title: "Fast-Track Hiring", desc: "Top performing interns and students are offered direct full-time role offers upon graduation." },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 4: HOW WE WORK ── */}
          {activeTab === "how-we-work" && (
            <div className="p-4 md:p-8 space-y-8">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 overflow-x-auto no-scrollbar max-w-full">
                  {WORK_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveWorkSubTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeWorkSubTab === tab.id
                          ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs font-bold"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { icon: Globe, title: "Remote-First Flexibility", desc: "Work from wherever you are most creative and productive, with clear communication." },
                  { icon: Sparkles, title: "Autonomy & Impact", desc: "Take full ownership of your features from architecture to deployment." },
                  { icon: Heart, title: "Health & Well-being", desc: "Comprehensive health benefits, mental wellness support, and generous time off." },
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="p-8 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <Icon size={22} />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{card.title}</h3>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{card.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TAB 5: HOW WE HIRE ── */}
          {activeTab === "how-we-hire" && (
            <div className="p-4 md:p-8 space-y-8">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 p-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 overflow-x-auto no-scrollbar max-w-full">
                  {HIRE_SUB_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHireSubTab(tab.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        activeHireSubTab === tab.id
                          ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-xs font-bold"
                          : "text-gray-600 dark:text-zinc-400 hover:text-gray-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start pt-4">
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 dark:text-white leading-tight">
                    Our hiring process
                  </h1>
                  <div>
                    <button
                      onClick={() => setActiveTab("jobs")}
                      className="px-6 py-3 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                    >
                      Explore open positions
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                  <p>
                    Eduvantix's hiring process is designed to be transparent and fair. We want all candidates to have access to clear information and resources.
                  </p>
                  <p>
                    Here is a quick overview of our hiring process to help you prepare and submit your application with total confidence.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 6: MY APPLICATIONS ── */}
          {activeTab === "my-applications" && (
            <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">My Applications</h1>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Track the real-time status of your submitted job applications.</p>
              </div>

              {!user ? (
                <div className="text-center py-16 space-y-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900/50">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <User size={28} />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">Sign in to view your applications</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Please log in to your Eduvantix account to see your submitted applications and track real-time status updates.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/login?redirect=/careers")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
                  >
                    <User size={14} /> Sign In / Register
                  </button>
                </div>
              ) : myApplications.length === 0 ? (
                <div className="text-center py-16 space-y-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-3xl">
                  <Briefcase size={36} className="mx-auto text-gray-300 dark:text-zinc-700" />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-gray-900 dark:text-white">No applications submitted yet</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Browse open roles and apply with your resume in less than 2 minutes.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("jobs")}
                    className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Browse Open Jobs
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {myApplications.map((app) => (
                    <div key={app.id} className="p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            {app.type}
                          </span>
                          <span className="text-xs text-gray-400">Applied on {app.appliedAt}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">{app.jobTitle}</h3>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">{app.department} · {app.location}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {(() => {
                          const statusConfig = {
                            PENDING: { label: "Submitted", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", icon: Clock },
                            REVIEWED: { label: "Application Under Review", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", icon: Clock },
                            SHORTLISTED: { label: "Shortlisted 🎉", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold", icon: CheckCircle2 },
                            REJECTED: { label: "Not Selected", color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: X },
                            HIRED: { label: "Hired 🎉", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-bold", icon: CheckCircle2 },
                          };
                          const info = statusConfig[app.status] || statusConfig.PENDING;
                          const StatusIcon = info.icon;
                          return (
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${info.color}`}>
                              <StatusIcon size={13} /> {info.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* ═════════════════════════════════════════════════════════════════
            JOB DETAIL MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {selectedJob && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setSelectedJob(null)}>
            <div
              className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-gray-500">Job Opportunity Details</span>
                <button onClick={() => setSelectedJob(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {TYPE_LABEL[selectedJob.type]}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-1">{selectedJob.title}</h2>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{selectedJob.department} · {selectedJob.location}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">About the Role</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{selectedJob.description}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Responsibilities</h4>
                  <ul className="space-y-2">
                    {selectedJob.responsibilities?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                        <ChevronRight size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Requirements</h4>
                  <ul className="space-y-2">
                    {selectedJob.requirements?.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-zinc-300">
                        <CheckCircle2 size={14} className="mt-0.5 text-emerald-600 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                  <button
                    onClick={() => { setSelectedJob(null); openApplyModal(selectedJob); }}
                    className="w-full py-3.5 rounded-full text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                  >
                    Apply for this Position
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            APPLY MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {showApply && applyJob && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" onClick={() => setShowApply(false)}>
            <div
              className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Apply — {applyJob.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{applyJob.department} · {applyJob.location}</p>
                </div>
                <button onClick={() => setShowApply(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Email</label>
                    <input
                      type="email"
                      readOnly
                      value={email}
                      className="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800/50 text-xs text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Mobile Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold appearance-none cursor-pointer focus:outline-none shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.label || c.code}
                        </option>
                      ))}
                    </select>

                    {countryCode === "other" && (
                      <input
                        type="text"
                        placeholder="+XX"
                        value={customCountryCode}
                        onChange={(e) => setCustomCountryCode(e.target.value)}
                        className="w-20 px-3 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 shrink-0"
                      />
                    )}

                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      maxLength={15}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 15))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Cover Note (optional)</label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Tell us about yourself and why you're interested in this position..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1">Resume * (PDF or DOCX, max 10MB)</p>
                  <label className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 hover:border-emerald-500 bg-gray-50 dark:bg-zinc-800/50 cursor-pointer transition-all">
                    <Upload size={16} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-zinc-300 truncate">
                      {resumeFile ? resumeFile.name : "Choose PDF or DOCX file..."}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      required
                      onChange={(e) => setResumeFile(e.target.files[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                    <AlertTriangle size={14} /> {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  style={{ background: "var(--accent-gradient)" }}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send size={14} /> Submit Application</span>
                  )}
                </button>

                <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
                  ✉️ After submitting, our team will reach out to you soon.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════
            AUTH REQUIRED MODAL
        ═════════════════════════════════════════════════════════════════ */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)}>
            <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 text-center space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <User size={28} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sign in to Apply</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                  Please log in or create an Eduvantix account to submit your job application for <span className="font-bold text-gray-900 dark:text-white">{pendingApplyJob?.title}</span>.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    router.push("/login?redirect=/careers");
                  }}
                  className="w-full py-3 rounded-full font-bold text-xs uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  <User size={14} /> Sign In / Register Now
                </button>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel & Continue Browsing
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {standalone && <Footer />}
    </div>
  );
}
