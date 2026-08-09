import React, { useState, useEffect } from "react";
import "@/App.css";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  UploadCloud, 
  FileSpreadsheet, 
  Play, 
  RefreshCw, 
  FileCode, 
  Trash2, 
  Download, 
  ChevronRight, 
  Flame, 
  Settings, 
  FileCheck2,
  Check,
  CheckSquare
} from "lucide-react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

function App() {
  const [activeTab, setActiveTab] = useState("playground");

  // -------------------------
  // Playground State
  // -------------------------
  const [pdfFile, setPdfFile] = useState(null);
  const [docxFile, setDocxFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [docxFileName, setDocxFileName] = useState("");
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [isParsingDocx, setIsParsingDocx] = useState(false);
  
  // Results
  const [extractedNofo, setExtractedNofo] = useState(null);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState([]);
  const [detectedIssues, setDetectedIssues] = useState([]);

  // -------------------------
  // Auto-Correction State
  // -------------------------
  const [correctFile, setCorrectFile] = useState(null);
  const [correctFileName, setCorrectFileName] = useState("");
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctedData, setCorrectedData] = useState(null); // { fixes_made, diff, file_b64, filename }

  // -------------------------
  // Excel Export State
  // -------------------------
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Status message
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Helper to trigger b64 file download in browser
  const downloadB64File = (base64Data, filename) => {
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Corrected DOCX downloaded successfully!");
    } catch (err) {
      showNotification("Failed to download corrected DOCX: " + err.message, "error");
    }
  };

  // Upload & Parse PDF
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handleParsePdf = async () => {
    if (!pdfFile) {
      showNotification("Please select a PDF file first.", "error");
      return;
    }
    setIsParsingPdf(true);
    setExtractedNofo(null);

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await axios.post(`${API}/parse-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setExtractedNofo(res.data.data);
        showNotification("NOFO PDF parsed successfully!");
      } else {
        showNotification(res.data.error || "Failed to parse PDF", "error");
      }
    } catch (err) {
      showNotification("Connection error: " + err.message, "error");
    } finally {
      setIsParsingPdf(false);
    }
  };

  // Upload & Parse DOCX
  const handleDocxUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDocxFile(file);
    setDocxFileName(file.name);
  };

  const handleParseDocx = async () => {
    if (!docxFile) {
      showNotification("Please select a DOCX file first.", "error");
      return;
    }
    setIsParsingDocx(true);
    setExtractedPlaceholders([]);
    setDetectedIssues([]);

    const formData = new FormData();
    formData.append("file", docxFile);

    try {
      const res = await axios.post(`${API}/parse-docx`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setExtractedPlaceholders(res.data.placeholders || []);
        setDetectedIssues(res.data.issues || []);
        showNotification("Proposal DOCX template parsed successfully!");
      } else {
        showNotification(res.data.error || "Failed to parse DOCX", "error");
      }
    } catch (err) {
      showNotification("Connection error: " + err.message, "error");
    } finally {
      setIsParsingDocx(false);
    }
  };

  // Auto-Correction DOCX upload & correction
  const handleCorrectDocxUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCorrectFile(file);
    setCorrectFileName(file.name);
    setCorrectedData(null);
  };

  const handleAutoCorrectDocx = async () => {
    if (!correctFile) {
      showNotification("Please select a DOCX file to correct first.", "error");
      return;
    }
    setIsCorrecting(true);
    setCorrectedData(null);

    const formData = new FormData();
    formData.append("file", correctFile);

    try {
      const res = await axios.post(`${API}/correct-docx`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setCorrectedData(res.data);
        showNotification(`Brace corrections complete! ${res.data.fixes_made} issue(s) fixed.`);
      } else {
        showNotification(res.data.error || "Failed to correct DOCX", "error");
      }
    } catch (err) {
      showNotification("Connection error: " + err.message, "error");
    } finally {
      setIsCorrecting(false);
    }
  };

  // Export Excel Compliance Checklist
  const handleExportExcel = async () => {
    if (!extractedNofo) {
      showNotification("Please parse a NOFO PDF first in the Playground tab.", "error");
      return;
    }
    if (extractedPlaceholders.length === 0) {
      showNotification("Please parse a Proposal DOCX template first in the Playground tab.", "error");
      return;
    }

    setIsExportingExcel(true);
    try {
      const res = await axios.post(`${API}/export-checklist`, {
        nofo_data: extractedNofo,
        placeholders: extractedPlaceholders
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Banner / Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Grant Automation Engine
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Harden Edition</span>
            </h1>
            <p className="text-xs text-slate-400">Targeted parsing, malformed detection, brace auto-correction, and Excel audit</p>
          </div>
        </div>

        {/* Global Notification */}
        {notification && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-all duration-300 shadow-lg ${
            notification.type === "success" 
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" 
              : "bg-red-500/15 border-red-500/30 text-red-400"
          }`}>
            {notification.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Tabs Controls */}
        <nav className="flex space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("playground")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "playground" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Play className="w-4 h-4" />
            Compliance Playground
          </button>
          <button
            onClick={() => setActiveTab("corrections")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "corrections" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileCode className="w-4 h-4" />
            Brace Corrections & Diff
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === "matrix" 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Compliance Matrix
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* COMPLIANCE PLAYGROUND TAB */}
        {activeTab === "playground" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: PDF Uploader & NOFO Parsing */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="text-indigo-400 w-5 h-5" />
                  <h2 className="text-lg font-bold text-white">1. NOFO PDF Parsing</h2>
                </div>
                <span className="text-xs text-slate-500">PDF to Structured Intelligence</span>
              </div>

              {/* PDF Dropzone */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-colors relative flex flex-col items-center justify-center bg-slate-900/40">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                <p className="text-sm text-slate-300 font-medium">
                  {pdfFileName ? pdfFileName : "Drag and drop NOFO PDF file here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts standard PDF files up to 25MB</p>
              </div>

              <button
                onClick={handleParsePdf}
                disabled={isParsingPdf || !pdfFile}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/25"
              >
                {isParsingPdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isParsingPdf ? "Extracting & Structuring NOFO..." : "Run NOFO Extractor"}
              </button>

              {/* Extracted NOFO Outputs */}
              {extractedNofo && (
                <div className="mt-4 bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3 flex-1 overflow-auto max-h-[350px]">
                  <h3 className="text-sm font-semibold text-slate-300 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Extracted Federal Parameters
                  </h3>
                  <div className="space-y-2.5 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Opportunity Number</span>
                      <strong className="text-white">{extractedNofo.opportunity_number || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Assistance Listing</span>
                      <strong className="text-white">{extractedNofo.assistance_listing || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Federal Agency</span>
                      <strong className="text-white">{extractedNofo.agency || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Eligibility Requirements</span>
                      <p className="text-slate-300 mt-0.5">{extractedNofo.eligibility || "null"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Award Ceiling</span>
                        <strong className="text-indigo-400">{extractedNofo.award_ceiling || "null"}</strong>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Award Floor</span>
                        <strong className="text-indigo-400">{extractedNofo.award_floor || "null"}</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Total Program Funding</span>
                      <strong className="text-white">{extractedNofo.total_program_funding || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Cost Sharing or Match</span>
                      <strong className="text-white">{extractedNofo.cost_sharing || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Submission Deadline</span>
                      <strong className="text-emerald-400">{extractedNofo.deadline || "null"}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Program Purpose</span>
                      <p className="text-slate-300 text-xs mt-0.5">{extractedNofo.program_purpose || "null"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: DOCX Uploader & Template Placement Analysis */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FileCode className="text-indigo-400 w-5 h-5" />
                  <h2 className="text-lg font-bold text-white">2. Proposal DOCX Scanner</h2>
                </div>
                <span className="text-xs text-slate-500">Scan Template & Braces</span>
              </div>

              {/* DOCX Dropzone */}
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-colors relative flex flex-col items-center justify-center bg-slate-900/40">
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <UploadCloud className="w-10 h-10 text-slate-500 mb-2" />
                <p className="text-sm text-slate-300 font-medium">
                  {docxFileName ? docxFileName : "Drag and drop Proposal DOCX here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">Accepts standard .docx files up to 25MB</p>
              </div>

              <button
                onClick={handleParseDocx}
                disabled={isParsingDocx || !docxFile}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2.5 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/25"
              >
                {isParsingDocx ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {isParsingDocx ? "Analyzing DOCX Templates..." : "Scan DOCX Placeholders"}
              </button>

              {/* Extracted DOCX Placeholders & Issues */}
              {(extractedPlaceholders.length > 0 || detectedIssues.length > 0) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-auto max-h-[350px]">
                  
                  {/* Placeholders Card */}
                  <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Detected Placeholders</span>
                      <span className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-mono text-xxs">{extractedPlaceholders.length} Found</span>
                    </h4>
                    <ul className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                      {extractedPlaceholders.map((ph, idx) => (
                        <li key={idx} className="text-xs bg-slate-950 py-1 px-2.5 rounded border border-slate-800 font-mono text-indigo-300 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          {`{${ph}}`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Issues/Warnings Card */}
                  <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                      <span>Malformed Braces / Tokens</span>
                      <span className={`px-1.5 py-0.2 rounded font-mono text-xxs ${
                        detectedIssues.length > 0 ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"
                      }`}>{detectedIssues.length} Issues</span>
                    </h4>
                    {detectedIssues.length > 0 ? (
                      <ul className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                        {detectedIssues.map((issue, idx) => (
                          <li key={idx} className="text-xs bg-red-500/5 text-red-300 py-1.5 px-2.5 rounded border border-red-500/25 flex gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center py-6 space-y-1">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Perfect Document Quality</span>
                        <span className="text-xs text-slate-500">All braces are perfectly matched</span>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: AUTO CORRECTION & SIDE-BY-SIDE DIFF */}
        {activeTab === "corrections" && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center space-x-2">
                <FileCode className="text-indigo-400 w-5.5 h-5.5" />
                <div>
                  <h2 className="text-lg font-bold text-white">Side-by-Side Brace Correction Diff</h2>
                  <p className="text-xs text-slate-400">Instantly fix unmatched curly braces with an audit-ready side-by-side view</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full">Secure local correction</span>
            </div>

            {/* Selector Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div className="md:col-span-2">
                <span className="text-xs text-slate-500 block mb-1">Select a DOCX file needing corrections</span>
                <input
                  type="file"
                  accept=".docx"
                  id="diff-upload"
                  onChange={handleCorrectDocxUpload}
                  className="hidden"
                />
                <label 
                  htmlFor="diff-upload"
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-4 py-2 text-sm font-mono text-slate-300 flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{correctFileName ? correctFileName : "Choose unmatched_braces_test_proposal.docx..."}</span>
                  <UploadCloud className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                </label>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">&nbsp;</span>
                <button
                  onClick={handleAutoCorrectDocx}
                  disabled={isCorrecting || !correctFile}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-2 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  {isCorrecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isCorrecting ? "Correcting..." : "Auto-Correct Braces"}
                </button>
              </div>
            </div>

            {/* Visual Diff View */}
            {correctedData && (
              <div className="space-y-4">
                
                {/* Stats Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm text-slate-300">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <span>Total Fixes Applied:</span>
                      <strong className="text-indigo-400 font-mono text-base">{correctedData.fixes_made}</strong>
                    </div>
                    {correctedData.fixes_made > 0 && (
                      <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded">Highly stable parser substitution</span>
                    )}
                  </div>
                  <button
                    onClick={() => downloadB64File(correctedData.file_b64, correctedData.filename)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Corrected DOCX
                  </button>
                </div>

                {/* Diff Viewer Grid */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-400">Fixed Line Differences</h3>
                  {correctedData.diff && correctedData.diff.length > 0 ? (
                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                      {correctedData.diff.map((item, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
                          {/* Location header */}
                          <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex justify-between items-center text-xs">
                            <span className="font-mono text-slate-400 font-medium">{item.location}</span>
                            <span className="text-indigo-400 font-medium">{item.fixes} corrections</span>
                          </div>
                          
                          {/* Left-right Split Screen */}
                          <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Original */}
                            <div className="bg-red-500/5 p-4 border-r border-slate-800">
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block mb-1.5 font-mono">Original Line</span>
                              <p className="text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed line-through decoration-red-500/40">
                                {item.original}
                              </p>
                            </div>
                            
                            {/* Corrected */}
                            <div className="bg-emerald-500/5 p-4">
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5 font-mono">Corrected Line</span>
                              <p className="text-white font-mono text-xs whitespace-pre-wrap leading-relaxed">
                                {item.corrected}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/40 rounded-xl border border-slate-800/60 p-8 text-center flex flex-col items-center space-y-2">
                      <CheckCircle className="w-10 h-10 text-emerald-400" />
                      <span className="text-sm font-bold text-white">Perfect Document File</span>
                      <p className="text-xs text-slate-500">All placeholders are matched. Corrected file downloaded identically.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB: COMPLIANCE CHECKLIST & MATRIX */}
        {activeTab === "matrix" && (
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col space-y-5">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="text-indigo-400 w-5.5 h-5.5" />
                <div>
                  <h2 className="text-lg font-bold text-white">Interactive Grant Compliance Matrix</h2>
                  <p className="text-xs text-slate-400">Bridges extracted federal constraints directly with proposal document sections</p>
                </div>
              </div>
              
              <button
                onClick={handleExportExcel}
                disabled={isExportingExcel || !extractedNofo || extractedPlaceholders.length === 0}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold py-2 px-4 rounded-xl flex items-center gap-2 transition shadow-md"
              >
                {isExportingExcel ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4.5 h-4.5" />}
                {isExportingExcel ? "Generating Audit Checklist..." : "Export Compliance Excel"}
              </button>
            </div>

            {/* Checklist Matrix Area */}
            {(!extractedNofo || extractedPlaceholders.length === 0) ? (
              <div className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-slate-600" />
                <h3 className="text-base font-bold text-slate-300">Awaiting Upload Data</h3>
                <p className="text-xs text-slate-500 max-w-md">
                  To view and export the Excel compliance checklist, please complete <strong>both</strong> PDF parsing and Proposal DOCX scanning on the Compliance Playground first.
                </p>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-1.5 px-3.5 rounded-lg border border-slate-700 transition"
                >
                  Return to Playground
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-6 items-center justify-between">
                  <div className="text-xs text-slate-400 leading-relaxed">
                    Checklist maps placeholders dynamically to parsed values. Match status is computed using fuzzy matching rules.
                  </div>
                  <div className="flex gap-4 text-xs font-medium">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500/25 border border-emerald-500 rounded-full"></span> Matched</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-500/25 border border-amber-500 rounded-full"></span> Manual Matching Required</span>
                  </div>
                </div>

                {/* Simulated Grid list of Matrix matches */}
                <div className="border border-slate-800/80 rounded-xl overflow-hidden shadow">
                  <table className="w-full border-collapse text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 font-medium text-xs border-b border-slate-800">
                      <tr>
                        <th className="p-4">DOCX Placeholder</th>
                        <th className="p-4">Matched NOFO Field</th>
                        <th className="p-4">Extracted NOFO Value</th>
                        <th className="p-4">Fuzzy Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {extractedPlaceholders.map((ph, idx) => {
                        const phNorm = ph.toLowerCase().replace(/[\s_-]/g, "");
                        
                        // Find match
                        let matchedField = "None";
                        let extractedValue = "Not found in NOFO";
                        let isMatched = false;

                        Object.entries(extractedNofo).forEach(([k, v]) => {
                          if (k !== "raw_text" && k.toLowerCase().replace(/[\s_-]/g, "") === phNorm) {
                            matchedField = k;
                            extractedValue = v;
                            isMatched = true;
                          }
                        });

                        return (
                          <tr key={idx} className="hover:bg-slate-900/80 transition-colors">
                            <td className="p-4 font-mono text-indigo-400 font-semibold">{`{${ph}}`}</td>
                            <td className="p-4 text-slate-200">{matchedField}</td>
                            <td className="p-4 text-slate-400 max-w-[280px] truncate">{String(extractedValue)}</td>
                            <td className="p-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                isMatched 
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isMatched ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                                {isMatched ? "Matched" : "Review Required"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 bg-slate-950/40 text-center text-xs text-slate-500 flex items-center justify-between">
        <span>Emergent Grant Automation Engine © 2026</span>
        <div className="flex space-x-4">
          <span className="hover:text-slate-400 transition-colors">Documentation</span>
          <span className="hover:text-slate-400 transition-colors">API Reference</span>
          <span className="hover:text-slate-400 transition-colors">Support</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
