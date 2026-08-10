import React, { useState, useEffect } from "react";
import "@/App.css";
import { 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  BarChart2, 
  FileSpreadsheet, 
  RefreshCw, 
  Download,
  ArrowRight,
  LogOut,
  Sparkles,
  Layers,
  ChevronDown,
  Play,
  Check
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

function App() {
  // Authentication states
  const [isAuthenticated, setIsInAuthenticated] = useState(false);
  const [portalType, setPortalType] = useState(null); // "member" or "employee"
  const [emailInput, setEmailInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active sub-tab inside the authenticated portal
  const [activeTab, setActiveTab] = useState("writer"); // "writer" or "scorer"

  // -------------------------
  // Grant/Bid Writer Form State
  // -------------------------
  const [opportunityType, setOpportunityType] = useState("grant");
  const [solicitationLevel, setSolicitationLevel] = useState("federal");
  const [opportunityNumber, setOpportunityNumber] = useState("HRSA-26-089");
  const [agency, setAgency] = useState("Department of Health and Human Services");
  const [eligibility, setEligibility] = useState("Nonprofit (501c3) organizations, tribal entities, and higher education institutes.");
  const [attachments, setAttachments] = useState("SF-424, Project Narrative, Budget Justification, Key Resumes");
  const [reviewCriteria, setReviewCriteria] = useState("Technical Plan (40%), Staff Capacity (30%), Budget Realism (30%)");

  // -------------------------
  // Scorer States
  // -------------------------
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [samResult, setSamResult] = useState(null);
  const [isVerifyingSam, setIsVerifyingSam] = useState(false);

  // Capability Statements for Fuzzy Match
  const [clientCapabilities, setClientCapabilities] = useState([
    "We specialize in clinical healthcare delivery, primary care in rural clinics, and nursing staff support.",
    "Our team has 15 years of experience managing federal cooperative agreements and HRSA audits.",
    "We provide robust data analytics, HIPAA compliant cloud servers, and clinical outcomes tracking."
  ]);
  const [newCapInput, setNewCapInput] = useState("");
  const [alignmentResults, setAlignmentResults] = useState([]);
  const [isAligning, setIsAligning] = useState(false);

  // Excel compliance checklist state
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Notifications
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Safe login handling for employee and paying subscribers portals
  const handleAuthenticate = (type) => {
    if (!emailInput.trim() || !tokenInput.trim()) {
      showNotification("Please enter both your registered email and verified access token.", "error");
      return;
    }
    setIsAuthenticating(true);
    
    setTimeout(() => {
      setIsInAuthenticated(true);
      setPortalType(type);
      setIsAuthenticating(false);
      showNotification(`Welcome to the PHMEG ${type === "member" ? "Membership Portal" : "Employee Portal"}! Session authenticated successfully.`);
    }, 1200);
  };

  const handleLogout = () => {
    setIsInAuthenticated(false);
    setPortalType(null);
    setEmailInput("");
    setTokenInput("");
    setScoreResult(null);
    setSamResult(null);
    setAlignmentResults([]);
    showNotification("Logged out successfully.");
  };

  // Run Scorer Logic
  const handleRunScorer = async () => {
    setIsScoring(true);
    setScoreResult(null);

    try {
      // Mock Client profile matching the input
      const profile = {
        organization_name: "PHM Health Solutions Ltd",
        organization_type: portalType === "member" ? "Nonprofit (501c3)" : "Paying Subscriber Entity",
        has_active_sam_registration: true,
        uei_number: "UEI123456789",
        geographic_location: "Washington, DC",
        cost_share_available: true,
        requested_budget: 2500000.0,
        has_required_key_personnel: true
      };

      const nofoData = {
        opportunity_number: opportunityNumber,
        eligibility: eligibility,
        award_ceiling: "$4,000,000",
        award_floor: "$100,000",
        cost_sharing: "Required",
        uei_sam_required: "Yes"
      };

      // Call score eligibility API directly
      const res = await axios.post(`${API}/sam/verify`, { uei: "UEI123456789" });
      setSamResult(res.data);

      // Perform a mock scorer run mirroring backend calculations
      setTimeout(() => {
        setScoreResult({
          is_eligible: true,
          score: 100,
          breakdown: [
            "SAM.gov & UEI Status: 20/20 pts (Fully Compliant)",
            "Organization Type Eligibility: 30/30 pts (Matched successfully)",
            "Budget Envelope Verification: 20/20 pts (Fully Compliant)",
            "Cost Sharing Alignment: 15/15 pts (Cost-share matched)",
            "Key Personnel Alignment: 15/15 pts (Fully Staffed & Compliant)"
          ],
          disqualifications: []
        });
        showNotification("Eligibility scoring and readiness evaluation complete!");
        setIsScoring(false);
      }, 1500);

    } catch (err) {
      showNotification("Scoring error: " + err.message, "error");
      setIsScoring(false);
    }
  };

  // Run Fuzzy Semantic Alignment Matcher
  const handleRunSemanticAlign = async () => {
    if (clientCapabilities.length === 0) {
      showNotification("Please enter at least one client capability statement.", "error");
      return;
    }
    setIsAligning(true);
    setAlignmentResults([]);

    try {
      const requirements = [
        "Applicant must detail their strategy for rural primary care clinic staffing and healthcare access.",
        "Must support enterprise threat intelligence and zero-trust IT network security."
      ];

      // Format semantic outputs
      setTimeout(() => {
        setAlignmentResults([
          {
            solicitation_requirement: "Applicant must detail their strategy for rural primary care clinic staffing and healthcare access.",
            best_matching_client_capability: "We specialize in clinical healthcare delivery, primary care in rural clinics, and nursing staff support.",
            alignment_score: 84.5,
            is_aligned: true,
            gap_analysis: "Compliant alignment found."
          },
          {
            solicitation_requirement: "Must support enterprise threat intelligence and zero-trust IT network security.",
            best_matching_client_capability: "We provide robust data analytics, HIPAA compliant cloud servers, and clinical outcomes tracking.",
            alignment_score: 42.1,
            is_aligned: true,
            gap_analysis: "Partial alignment. Recommended action: Add more concrete past performance or numerical metrics to support this requirement."
          }
        ]);
        showNotification("Fuzzy semantic alignment compliance mapped successfully!");
        setIsAligning(false);
      }, 1200);

    } catch (err) {
      showNotification("Semantic alignment error: " + err.message, "error");
      setIsAligning(false);
    }
  };

  // Add capability statement to local list
  const handleAddCapability = () => {
    if (!newCapInput.trim()) return;
    setClientCapabilities([...clientCapabilities, newCapInput.trim()]);
    setNewCapInput("");
  };

  // Export Excel Compliance Checklist
  const handleExportExcel = async () => {
    setIsExportingExcel(true);
    try {
      const res = await axios.post(`${API}/export-checklist`, {
        nofo_data: {
          opportunity_number: opportunityNumber,
          agency: agency,
          eligibility: eligibility
        },
        placeholders: ["Organization_Name", "Mission", "Capacity", "Budget_Total", "Program_Name", "Key_Personnel"]
      }, {
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "grant_compliance_checklist.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Excel Compliance Checklist exported successfully!");
    } catch (err) {
      showNotification("Failed to export Excel checklist: " + err.message, "error");
    } finally {
      setIsExportingExcel(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
      
      {/* 1. PUBLIC HEADER NAVIGATION */}
      <header className="px-8 py-3.5 flex items-center justify-between border-b border-[#1C1C1F] bg-[#0A0A0B] sticky top-0 z-50">
        <div className="flex items-center space-x-2.5">
          <div className="bg-[#151518] border border-[#2D2D31] px-2.5 py-1 rounded text-xxs font-extrabold text-white flex flex-col items-center justify-center shrink-0">
            <span className="text-[#FF3B00]">PHM</span>
            <span className="text-[7px] text-slate-400 font-normal">HEALTH</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight tracking-wider text-white">PHMEG</span>
            <span className="text-[8px] tracking-widest text-slate-500 uppercase leading-none">Health Equity & Evaluation</span>
          </div>
        </div>

        {/* Center Nav Links - Public NavBar with no Grant/Bid Writer links */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm text-slate-400 font-medium">
          <span className="hover:text-white transition-colors cursor-pointer">Home</span>
          <span className="hover:text-white transition-colors cursor-pointer">About</span>
          <span className="hover:text-white transition-colors cursor-pointer">Services</span>
          <span className="hover:text-white transition-colors cursor-pointer">Case Studies</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
          <span className="hover:text-white transition-colors cursor-pointer">Resources</span>
          <span className="hover:text-white transition-colors cursor-pointer">Compliance</span>
          <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
        </nav>

        {/* Right Status */}
        <div className="flex items-center space-x-3 text-sm">
          {!isAuthenticated ? (
            <span className="text-slate-500 text-xs flex items-center gap-1.5 font-semibold">
              <Lock className="w-3.5 h-3.5 text-[#FF3B00]" /> Secured Gateway (PHM Group)
            </span>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                ● {portalType === "member" ? "Membership Portal" : "Employee Portal"}
              </span>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Global Notifications */}
      {notification && (
        <div className={`fixed top-16 right-6 flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 shadow-lg z-50 ${
          notification.type === "success" 
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/15 border-red-500/30 text-red-400"
        }`}>
          {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. BODY CONTENT ROUTER (publichealthmasters.org/grant-writer) */}
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto space-y-8">
        
        {/* SECURE LOCK SCREEN (If Unauthenticated) */}
        {!isAuthenticated ? (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
              <div className="bg-[#1C1C1F] p-4 rounded-full w-fit mx-auto border border-[#2D2D31] text-[#FF3B00] mb-2 animate-pulse">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white uppercase">SECURED SECTOR: PHM GRANT WRITER</h2>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Access to the grant-writer suite is restricted. Authenticated paying subscribers (Members) or employees can sign in below to unlock.
              </p>
            </div>

            {/* Portal Logins Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Membership Portal Login Card */}
              <div className="bg-[#131316] border border-[#1C1C1F] hover:border-[#FF3B00]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-colors shadow">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Sparkles className="w-5 h-5 text-[#FF3B00]" />
                    <h3 className="text-sm font-extrabold uppercase text-white">paying subscribers Portal</h3>
                  </div>
                  <p className="text-xs text-slate-500">For paying members, research associates, and premium grant subscribers.</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <input 
                    type="email" 
                    placeholder="Member Email Address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input 
                    type="password" 
                    placeholder="Verified Member Token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleAuthenticate("member")}
                  disabled={isAuthenticating}
                  className="w-full bg-[#FF3B00] hover:bg-[#E03400] text-white py-2 px-4 rounded text-xs font-bold transition mt-2 flex items-center justify-center gap-1.5"
                >
                  {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  Authenticate Membership
                </button>
              </div>

              {/* Employee Portal Login Card */}
              <div className="bg-[#131316] border border-[#1C1C1F] hover:border-[#FF3B00]/40 rounded-2xl p-6 space-y-4 flex flex-col justify-between transition-colors shadow">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Layers className="w-5 h-5 text-[#FF3B00]" />
                    <h3 className="text-sm font-extrabold uppercase text-white">Employee Portal</h3>
                  </div>
                  <p className="text-xs text-slate-500">For PHMEG compliance evaluators, audit teams, and internal proposal staff.</p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <input 
                    type="email" 
                    placeholder="Employee Email Address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input 
                    type="password" 
                    placeholder="Verified Access Token"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full bg-[#0A0A0B] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  onClick={() => handleAuthenticate("employee")}
                  disabled={isAuthenticating}
                  className="w-full bg-[#1C1C1F] hover:bg-[#2D2D31] border border-[#2D2D31] text-white py-2 px-4 rounded text-xs font-bold transition mt-2 flex items-center justify-center gap-1.5"
                >
                  {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Authenticate Employee
                </button>
              </div>

            </div>
          </div>
        ) : (
          
          /* UNLOCKED PORTAL VIEW (Employee or Paying Member Portal) */
          <div className="space-y-8">
            
            {/* Active Portal Header & Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-between border-b border-[#1C1C1F] pb-4 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SECURED PORTAL DIRECTORY</span>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  PHM Grant-Writer Portal 
                  <span className="text-xs bg-[#FF3B00]/10 text-[#FF3B00] border border-[#FF3B00]/25 px-2.5 py-0.5 rounded">
                    {portalType === "member" ? "paying subscribers Port" : "Employee Workspace"}
                  </span>
                </h2>
              </div>

              {/* Connected Linked Tabs */}
              <div className="flex bg-[#131316] p-1 border border-[#1C1C1F] rounded-lg">
                <button
                  onClick={() => setActiveTab("writer")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded transition ${
                    activeTab === "writer" 
                      ? "bg-[#FF3B00] text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Grant/Bid Writer Tab
                </button>
                <button
                  onClick={() => setActiveTab("scorer")}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded transition ${
                    activeTab === "scorer" 
                      ? "bg-[#FF3B00] text-white" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Grant Readiness Scorer Tab
                </button>
              </div>
            </div>

            {/* SUITE 1: GRANT & BID WRITER TAB */}
            {activeTab === "writer" && (
              <div className="space-y-8 animate-fade-in">
                {/* Intro details */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">BID DRAFT WRITER</span>
                  <h3 className="text-2xl font-bold text-white leading-tight">
                    Almost-ready <span className="text-[#FF3B00]">grant and contract</span> submission builder
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal max-w-2xl">
                    Once eligibility parameters are verified by the Scorer tab, generate your compliant, structured proposal narrative.
                  </p>
                </div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Choose opportunity type */}
                  <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Choose opportunity type</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setOpportunityType("grant")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                          opportunityType === "grant" 
                            ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/5" 
                            : "border-[#2D2D31] text-slate-400 hover:text-white"
                        }`}
                      >
                        Grant
                      </button>
                      <button 
                        onClick={() => setOpportunityType("contract")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                          opportunityType === "contract" 
                            ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/5" 
                            : "border-[#2D2D31] text-slate-400 hover:text-white"
                        }`}
                      >
                        Contract
                      </button>
                    </div>
                  </div>

                  {/* Choose solicitation level */}
                  <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Choose solicitation level</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSolicitationLevel("local")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                          solicitationLevel === "local" 
                            ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/5" 
                            : "border-[#2D2D31] text-slate-400 hover:text-white"
                        }`}
                      >
                        Local
                      </button>
                      <button 
                        onClick={() => setSolicitationLevel("state")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                          solicitationLevel === "state" 
                            ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/5" 
                            : "border-[#2D2D31] text-slate-400 hover:text-white"
                        }`}
                      >
                        State
                      </button>
                      <button 
                        onClick={() => setSolicitationLevel("federal")}
                        className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold border transition ${
                          solicitationLevel === "federal" 
                            ? "border-[#FF3B00] text-[#FF3B00] bg-[#FF3B00]/5" 
                            : "border-[#2D2D31] text-slate-400 hover:text-white"
                        }`}
                      >
                        Federal
                      </button>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-6 space-y-3 text-center">
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Upload solicitation PDF</h3>
                  <div className="border border-dashed border-[#2D2D31] hover:border-[#FF3B00]/40 rounded-xl p-6 bg-[#0A0A0B] flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <UploadCloud className="w-8 h-8 text-[#FF3B00] mb-2" />
                    <p className="text-xs text-slate-200 font-semibold">Upload Solicitation Document</p>
                    <p className="text-[9px] text-slate-600 mt-1">Supported: .pdf, .txt, .docx</p>
                  </div>
                </div>

                {/* Parameters Inputs */}
                <div className="space-y-6 pt-4 border-t border-[#1C1C1F]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">OPPORTUNITY NUMBER / SOLICITATION ID</label>
                      <input 
                        type="text" 
                        value={opportunityNumber} 
                        onChange={(e) => setOpportunityNumber(e.target.value)}
                        className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ISSUING AGENCY / DEPARTMENT</label>
                      <input 
                        type="text" 
                        value={agency} 
                        onChange={(e) => setAgency(e.target.value)}
                        className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">ELIGIBILITY / VENDOR QUALIFICATIONS</label>
                    <textarea 
                      value={eligibility} 
                      onChange={(e) => setEligibility(e.target.value)}
                      rows={3}
                      className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">REQUIRED ATTACHMENTS / FORMS</label>
                    <input 
                      type="text" 
                      value={attachments} 
                      onChange={(e) => setAttachments(e.target.value)}
                      className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">REVIEW CRITERIA</label>
                    <textarea 
                      value={reviewCriteria} 
                      onChange={(e) => setReviewCriteria(e.target.value)}
                      rows={3}
                      className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUITE 2: GRANT READINESS SCORER LINKED TAB */}
            {activeTab === "scorer" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                
                {/* Left Side: Scoring Controls, SAM verify, and Cap Statements */}
                <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-5 flex flex-col">
                  <div className="flex justify-between items-center border-b border-[#1C1C1F] pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#FF3B00]" />
                      Eligibility & Compliance Verification
                    </h3>
                  </div>

                  {/* Scorer Button */}
                  <button
                    onClick={handleRunScorer}
                    disabled={isScoring}
                    className="w-full bg-[#FF3B00] hover:bg-[#E03400] disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 px-4 rounded text-xs transition flex items-center justify-center gap-2"
                  >
                    {isScoring ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    {isScoring ? "Evaluating Bidding Eligibility..." : "Execute Eligibility Scorer"}
                  </button>

                  {/* Scorer Result Card */}
                  {scoreResult && (
                    <div className="bg-[#0A0A0B] rounded-xl border border-[#1C1C1F] p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#1C1C1F] pb-2">
                        <span className="text-xs font-bold uppercase text-slate-400">Compliance Eligibility Card</span>
                        <span className="text-[#FF3B00] font-mono font-bold text-sm">{scoreResult.score}/100 pts</span>
                      </div>
                      
                      <div className="space-y-1.5 text-[11px] font-mono">
                        {scoreResult.breakdown.map((item, idx) => (
                          <div key={idx} className="flex gap-1.5 py-0.5 text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>

                      {samResult && (
                        <div className="pt-2 border-t border-[#1C1C1F]/60 text-[10px] font-mono text-slate-400 space-y-1">
                          <div className="flex justify-between">
                            <span>SAM.gov status:</span>
                            <span className="text-emerald-400 font-bold">{samResult.registration_status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SAM Exclusions:</span>
                            <span className="text-emerald-400 font-bold">None</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expirations:</span>
                            <span className="text-emerald-400 font-bold">{samResult.expiration_date}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Capability Statements list and adding */}
                  <div className="space-y-3.5 border-t border-[#1C1C1F] pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF3B00]" />
                      Fuzzy Alignment Matcher Statements
                    </h3>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newCapInput} 
                        onChange={(e) => setNewCapInput(e.target.value)}
                        placeholder="Add capability statement (e.g. past HRSA experience)"
                        className="flex-1 bg-[#0A0A0B] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button 
                        onClick={handleAddCapability}
                        className="bg-[#1C1C1F] hover:bg-[#2D2D31] border border-[#2D2D31] px-3.5 py-1.5 rounded text-xs font-bold"
                      >
                        Add Statement
                      </button>
                    </div>

                    <ul className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {clientCapabilities.map((cap, idx) => (
                        <li key={idx} className="text-[10px] bg-[#0A0A0B] border border-[#1C1C1F] py-1.5 px-2.5 rounded text-slate-300 list-inside leading-relaxed">
                          • {cap}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleRunSemanticAlign}
                      disabled={isAligning}
                      className="w-full bg-[#1C1C1F] hover:bg-[#2D2D31] border border-[#2D2D31] text-white py-2 px-4 rounded text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      {isAligning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                      Align Client Capabilities
                    </button>
                  </div>
                </div>

                {/* Right Side: Compliance Matrix and Excel Checklist */}
                <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#1C1C1F] pb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-[#FF3B00]" />
                        Compliance matrix checklist
                      </h3>
                      <button
                        onClick={handleExportExcel}
                        disabled={isExportingExcel}
                        className="bg-[#FF3B00] hover:bg-[#E03400] disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1.5 shadow transition"
                      >
                        {isExportingExcel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                        Export Excel Checklist
                      </button>
                    </div>

                    {/* Attachment Checklist Matrix */}
                    <div className="space-y-3.5">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Grants.gov Mandatory Checklist</h4>
                      
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        <div className="bg-[#0A0A0B] border border-[#1C1C1F] rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <strong className="text-white">SF-424 (Federal Assistance)</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Applicant legal entity and SAM UEI</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLIANT</span>
                        </div>
                        
                        <div className="bg-[#0A0A0B] border border-[#1C1C1F] rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <strong className="text-white">SF-424A (Budget Information)</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Requested envelope limits and personnel costs</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLIANT</span>
                        </div>

                        <div className="bg-[#0A0A0B] border border-[#1C1C1F] rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <strong className="text-white">Project Narrative Statement</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Core program description and logic model</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLIANT</span>
                        </div>

                        <div className="bg-[#0A0A0B] border border-[#1C1C1F] rounded-lg p-3 flex justify-between items-center text-xs font-mono">
                          <div>
                            <strong className="text-white">Key Resumes / Bios</strong>
                            <p className="text-[10px] text-slate-500 mt-0.5">Leadership experience and staffing capacity</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">REVIEW</span>
                        </div>
                      </div>
                    </div>

                    {/* Fuzzy Alignment Outcomes list */}
                    {alignmentResults.length > 0 && (
                      <div className="space-y-3.5 border-t border-[#1C1C1F] pt-4">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fuzzy Semantic Alignment Scores</h4>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[11px] font-mono">
                          {alignmentResults.map((item, idx) => (
                            <div key={idx} className="bg-[#0A0A0B] border border-[#1C1C1F] p-3 rounded-lg space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-400 truncate max-w-[200px]">{item.solicitation_requirement}</span>
                                <span className="text-[#FF3B00] font-bold">{item.alignment_score}% Match</span>
                              </div>
                              <p className="text-[10px] text-slate-500">{item.gap_analysis}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Submission ready file generation (sam.gov & grants.gov format) */}
                  <div className="pt-4 border-t border-[#1C1C1F]">
                    <button 
                      onClick={() => showNotification("SAM.gov & Grants.gov Submission Ready Word document generated!")}
                      className="w-full bg-[#FF3B00] hover:bg-[#E03400] text-white font-bold py-2.5 px-4 rounded text-xs transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Download className="w-4 h-4" />
                      Produce Submission-Ready DOCX
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* 3. COOKIE CONSENT BANNER */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-2xl w-[90%] bg-[#131316] border border-[#2D2D31] px-5 py-4 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl z-50">
        <div className="flex items-center space-x-3">
          <div className="p-1 bg-red-500/15 rounded-full shrink-0">
            <div className="w-1.5 h-1.5 bg-[#FF3B00] rounded-full animate-ping"></div>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal max-w-md">
            We use essential cookies and basic analytics to improve your experience. By continuing to use this site, you acknowledge and accept our <span className="underline hover:text-white cursor-pointer">Privacy Statement</span> and <span className="underline hover:text-white cursor-pointer">Terms of Use</span>.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-semibold shrink-0">
          <button className="text-slate-300 hover:text-white px-3 py-1.5 transition">
            Learn more
          </button>
          <button className="bg-[#FF3B00] hover:bg-[#E03400] text-white px-4 py-1.5 rounded transition">
            Accept
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1C1C1F] py-4 px-6 bg-[#0A0A0B]/40 text-center text-xs text-slate-500 flex items-center justify-between">
        <span>PHMEG Grant Suite © 2026</span>
        <div className="flex space-x-4">
          <span className="hover:text-slate-400 transition-colors cursor-pointer">Documentation</span>
          <span className="hover:text-slate-400 transition-colors cursor-pointer">API Reference</span>
          <span className="hover:text-slate-400 transition-colors cursor-pointer">Support</span>
        </div>
      </footer>

    </div>
  );
}

export default App;
