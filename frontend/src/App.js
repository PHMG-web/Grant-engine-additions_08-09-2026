import React, { useState } from "react";
import "@/App.css";
import { UploadCloud, ChevronDown, LogOut } from "lucide-react";

function App() {
  const [opportunityType, setOpportunityType] = useState("grant");
  const [solicitationLevel, setSolicitationLevel] = useState("federal");
  const [opportunityNumber, setOpportunityNumber] = useState("");
  const [agency, setAgency] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [attachments, setAttachments] = useState("");
  const [reviewCriteria, setReviewCriteria] = useState("");

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
      
      {/* 1. STUNNING HEADER NAVIGATION */}
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

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-sm text-slate-400 font-medium">
          <span className="hover:text-white transition-colors cursor-pointer">Home</span>
          <span className="hover:text-white transition-colors cursor-pointer">About</span>
          <span className="hover:text-white transition-colors cursor-pointer">Services</span>
          <span className="text-white border-b border-[#FF3B00] pb-1 cursor-pointer flex items-center gap-1">
            Grant Engine <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </span>
          <span className="hover:text-white transition-colors cursor-pointer">Case Studies</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
          <span className="hover:text-white transition-colors cursor-pointer">Resources</span>
          <span className="hover:text-white transition-colors cursor-pointer">Compliance</span>
          <span className="hover:text-white transition-colors cursor-pointer">Contact</span>
        </nav>

        {/* Right Buttons */}
        <div className="flex items-center space-x-3 text-sm">
          <button className="bg-[#FF3B00] hover:bg-[#E03400] text-white px-4 py-2 rounded font-bold transition text-xs tracking-wide">
            Book consultation
          </button>
          <button className="bg-[#1C1C1F] hover:bg-[#2D2D31] border border-[#2D2D31] text-white px-3 py-2 rounded font-medium text-xs transition">
            Admin
          </button>
          <span className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </span>
        </div>
      </header>

      {/* 2. BODY CONTENT */}
      <main className="flex-1 px-8 py-10 max-w-5xl w-full mx-auto space-y-10">
        
        {/* Intro */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block">INTERNAL TOOL</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
            Almost-ready <span className="text-[#FF3B00]">grant and contract</span> submission builder
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
            Build a local, state, or federal solicitation draft with an executive summary, compliance checklist, budget narrative starter, timeline/workplan starter, and next-step guidance.
          </p>
        </div>

        {/* Toggles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Step 1 */}
          <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">STEP 1</span>
            <h3 className="text-sm font-extrabold text-white">Choose opportunity type</h3>
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

          {/* Step 2 */}
          <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-5 space-y-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">STEP 2</span>
            <h3 className="text-sm font-extrabold text-white">Choose solicitation level</h3>
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

        {/* Step 3 */}
        <div className="bg-[#131316] border border-[#1C1C1F] rounded-xl p-6 space-y-4">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">STEP 3</span>
          <h3 className="text-sm font-extrabold text-white">Upload the solicitation PDF</h3>
          <p className="text-xs text-slate-500 mt-1">Upload a local, state, or federal bid / NOFO / RFP PDF to prefill the opportunity details.</p>
          
          <div className="border border-dashed border-[#2D2D31] hover:border-[#FF3B00]/50 rounded-xl p-8 text-center transition-all relative flex flex-col items-center justify-center bg-[#0C0C0E]">
            <UploadCloud className="w-8 h-8 text-[#FF3B00] mb-2.5" />
            <p className="text-xs text-slate-200 font-semibold">Upload solicitation PDF</p>
            <p className="text-[10px] text-slate-600 mt-1">Supported: .pdf</p>
          </div>
        </div>

        {/* Form Inputs Fields */}
        <div className="space-y-6 pt-4 border-t border-[#1C1C1F]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">OPPORTUNITY NUMBER / SOLICITATION ID</label>
              <input 
                type="text" 
                value={opportunityNumber} 
                onChange={(e) => setOpportunityNumber(e.target.value)}
                placeholder="E.g. HRSA-26-089"
                className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ISSUING AGENCY / DEPARTMENT</label>
              <input 
                type="text" 
                value={agency} 
                onChange={(e) => setAgency(e.target.value)}
                placeholder="E.g. Department of Health and Human Services"
                className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ELIGIBILITY / VENDOR QUALIFICATIONS</label>
            <textarea 
              value={eligibility} 
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="E.g. Nonprofits, Tribal Governments, Higher Education Institutions"
              rows={3}
              className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2.5 text-xs text-white focus:outline-none transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">REQUIRED ATTACHMENTS / FORMS</label>
            <input 
              type="text" 
              value={attachments} 
              onChange={(e) => setAttachments(e.target.value)}
              placeholder="E.g. SF-424, SF-424A, Project Narrative, Budget Narrative"
              className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2.5 text-xs text-white focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">REVIEW CRITERIA</label>
            <textarea 
              value={reviewCriteria} 
              onChange={(e) => setReviewCriteria(e.target.value)}
              placeholder="E.g. Technical Approach (30%), Budget Realism (20%), Past Performance (30%)"
              rows={3}
              className="w-full bg-[#131316] border border-[#1C1C1F] focus:border-[#FF3B00] rounded px-3 py-2.5 text-xs text-white focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

      </main>

      {/* 3. COOKIE CONSENT BANNER (As in user's screenshot) */}
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

    </div>
  );
}

export default App;
