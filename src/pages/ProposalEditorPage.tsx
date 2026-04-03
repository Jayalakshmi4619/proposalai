import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProposalStore } from '../store/proposalStore';
import { regenerateSectionAI } from '../services/aiService';
import { 
  Save, 
  Download, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  ChevronRight,
  Edit3,
  Trash2,
  Plus,
  Loader2,
  FileText,
  IndianRupee,
  Calendar,
  Shield,
  X,
  Briefcase
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Proposal, ScopePhase, Milestone, PricingItem, ContractClause } from '../types';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ProposalEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { getProposal, updateProposal } = useProposalStore();
  
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('summary');
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await getProposal(id);
        if (data) {
          setProposal(data);
        } else {
          navigate('/dashboard');
        }
        setLoading(false);
      }
    };
    load();
  }, [id, getProposal, navigate]);

  const exportSummaryPDF = async () => {
    if (!summaryRef.current || !proposal) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(summaryRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Summary-${proposal.title.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error("Summary Export Failed:", error);
      alert("Failed to export summary PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handleSave = async () => {
    if (!proposal || !id) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updatedProposal = {
        ...proposal,
        totalValueInr: proposal.pricingBreakdown.total,
        updatedAt: new Date().toISOString()
      };
      await updateProposal(id, updatedProposal);
      setProposal(updatedProposal);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (section: string, feedback: string = "") => {
    if (!proposal || !profile) return;
    setRegenerating(section);
    try {
      const newData = await regenerateSectionAI(section, proposal, feedback, profile);
      setProposal({ ...proposal, [section]: newData });
    } catch (error) {
      console.error("Regeneration failed:", error);
    } finally {
      setRegenerating(null);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const exportPDF = async () => {
    if (!previewRef.current || !proposal) return;
    
    setExporting(true);
    console.log("Starting PDF Export...");
    try {
      // Ensure all images are loaded
      const images = previewRef.current.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('proposal-preview');
          if (el) {
            el.style.height = 'auto';
            el.style.overflow = 'visible';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const contentHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = contentHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
      heightLeft -= pdfHeight;

      // Subsequent pages
      while (heightLeft > 0) {
        position = heightLeft - contentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, contentHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Proposal-${proposal.title.replace(/\s+/g, '-')}.pdf`);
      console.log("PDF Export Complete");
    } catch (error) {
      console.error("PDF Export Failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium">Loading proposal editor...</p>
      </div>
    );
  }

  if (!proposal) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
      {/* Left Panel - Controls */}
      <div className="lg:w-[400px] space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Proposal Title</label>
            <input
              type="text"
              value={proposal.title}
              onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
              className="w-full text-xl font-bold text-slate-900 border-none p-0 focus:ring-0 outline-none"
            />
          </div>

          <div className="space-y-1 mb-8">
            <SectionNav 
              label="Executive Summary" 
              active={activeSection === 'summary'} 
              onClick={() => scrollToSection('summary')} 
            />
            <SectionNav 
              label="Scope of Work" 
              active={activeSection === 'scope'} 
              onClick={() => scrollToSection('scope')} 
            />
            <SectionNav 
              label="Timeline & Milestones" 
              active={activeSection === 'timeline'} 
              onClick={() => scrollToSection('timeline')} 
            />
            <SectionNav 
              label="Pricing Breakdown" 
              active={activeSection === 'pricing'} 
              onClick={() => scrollToSection('pricing')} 
            />
            <SectionNav 
              label="Contract Clauses" 
              active={activeSection === 'clauses'} 
              onClick={() => scrollToSection('clauses')} 
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                "w-full py-3 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70",
                saveSuccess ? "bg-emerald-600 shadow-emerald-100" : "bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700"
              )}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : 
               saveSuccess ? <><CheckCircle className="h-5 w-5" /> Saved!</> : 
               <><Save className="h-5 w-5" /> Save Changes</>}
            </button>
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Download className="h-5 w-5" /> Export Full Proposal</>}
            </button>
            <button
              onClick={() => exportSummaryPDF()}
              disabled={exporting}
              className="w-full py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {exporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><FileText className="h-5 w-5" /> One-Page Summary</>}
            </button>
            <button className="w-full py-3 bg-white text-slate-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 text-sm font-medium">
              <Copy className="h-4 w-4" /> Copy Share Link
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">Proposal Status</label>
            <select
              value={proposal.status}
              onChange={(e) => setProposal({ ...proposal, status: e.target.value as any })}
              className={cn(
                "w-full px-4 py-2 rounded-xl text-sm font-bold outline-none transition-all",
                proposal.status === 'won' ? "bg-emerald-50 text-emerald-600" :
                proposal.status === 'lost' ? "bg-red-50 text-red-600" :
                proposal.status === 'sent' ? "bg-blue-50 text-blue-600" :
                "bg-slate-50 text-slate-600"
              )}
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="flex-1 space-y-8">
        <div 
          id="proposal-preview"
          ref={previewRef} 
          className="bg-white shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden border border-slate-100 min-h-[1000px]"
        >
          {/* PDF Header */}
          <div className="p-12 bg-indigo-600 text-white">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">Project Proposal</h1>
                <p className="text-indigo-100 text-lg font-medium">{proposal.title}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-1">Prepared By</p>
                <p className="text-xl font-bold">{profile?.name}</p>
                <p className="text-indigo-100">{profile?.profession}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/20">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-2">Client Details</p>
                <p className="text-2xl font-bold">{proposal.clientName || 'Valued Client'}</p>
                <p className="text-indigo-100">{proposal.clientEmail || 'Contact details not provided'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-indigo-200 mb-2">Proposal Info</p>
                <p className="text-lg font-bold">ID: PC-{id?.slice(0, 6).toUpperCase()}</p>
                <p className="text-indigo-100">Issued: {formatDate(proposal.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-16">
            {/* Executive Summary */}
            <SectionWrapper 
              id="section-summary"
              title="Executive Summary" 
              icon={FileText} 
              onRegenerate={() => handleRegenerate('executiveSummary')}
              loading={regenerating === 'executiveSummary'}
            >
              <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                {proposal.executiveSummary}
              </p>
            </SectionWrapper>

            {/* Scope of Work */}
            <SectionWrapper 
              id="section-scope"
              title="Scope of Work" 
              icon={Briefcase} 
              onRegenerate={() => handleRegenerate('scopeOfWork')}
              loading={regenerating === 'scopeOfWork'}
            >
              <div className="space-y-8">
                {proposal.scopeOfWork.map((phase, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold">
                          {phase.phaseNumber}
                        </span>
                        <h4 className="text-xl font-bold text-slate-900">{phase.phase}</h4>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        {phase.duration}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{phase.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.deliverables.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SectionWrapper>

            {/* Timeline */}
            <SectionWrapper 
              id="section-timeline"
              title="Timeline & Milestones" 
              icon={Calendar} 
              onRegenerate={() => handleRegenerate('timeline')}
              loading={regenerating === 'timeline'}
            >
              <div className="overflow-hidden border border-slate-100 rounded-2xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Milestone</th>
                      <th className="px-6 py-4">Day</th>
                      <th className="px-6 py-4">Payment %</th>
                      <th className="px-6 py-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {proposal.timeline.map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{m.milestone}</td>
                        <td className="px-6 py-4 text-slate-600">{m.day}</td>
                        <td className="px-6 py-4 text-indigo-600 font-bold">{m.paymentPercentage}%</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">{formatCurrency(m.amountInr)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionWrapper>

            {/* Pricing */}
            <SectionWrapper 
              id="section-pricing"
              title="Pricing Breakdown" 
              icon={IndianRupee} 
              onRegenerate={() => handleRegenerate('pricingBreakdown')}
              loading={regenerating === 'pricingBreakdown'}
            >
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl">
                <div className="space-y-4 mb-8">
                  {proposal.pricingBreakdown.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-white/10">
                      <div>
                        <p className="font-bold">{item.task}</p>
                        <p className="text-xs text-slate-400">{item.hours} hrs @ {formatCurrency(item.ratePerHour)}/hr</p>
                      </div>
                      <p className="font-bold">{formatCurrency(item.amount)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3 text-right">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(proposal.pricingBreakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Buffer ({proposal.pricingBreakdown.bufferPercentage}%)</span>
                    <span>{formatCurrency(proposal.pricingBreakdown.buffer)}</span>
                  </div>
                  {proposal.pricingBreakdown.gstApplicable && (
                    <div className="flex justify-between text-emerald-400">
                      <span>GST ({proposal.pricingBreakdown.gstPercentage}%)</span>
                      <span>{formatCurrency(proposal.pricingBreakdown.gstAmount)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Total Project Value</p>
                      <p className="text-sm text-indigo-300 italic">{proposal.pricingBreakdown.totalInWords}</p>
                    </div>
                    <p className="text-5xl font-black text-indigo-400">{formatCurrency(proposal.pricingBreakdown.total)}</p>
                  </div>
                </div>
              </div>
            </SectionWrapper>

            {/* Contract Clauses */}
            <SectionWrapper 
              id="section-clauses"
              title="Terms & Conditions" 
              icon={Shield} 
              onRegenerate={() => handleRegenerate('contractClauses')}
              loading={regenerating === 'contractClauses'}
            >
              <div className="grid grid-cols-1 gap-6">
                {proposal.contractClauses.map((clause, i) => (
                  <div key={i} className="relative group">
                    <div className="flex items-start gap-4 p-6 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        clause.enabled !== false ? "bg-indigo-600 border-indigo-600" : "border-slate-200"
                      )}>
                        {clause.enabled !== false && <CheckCircle className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-bold text-slate-900">{clause.title}</h5>
                          {clause.isRecommended && (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">Recommended</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{clause.content}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const newClauses = [...proposal.contractClauses];
                        newClauses[i].enabled = clause.enabled === false ? true : false;
                        setProposal({ ...proposal, contractClauses: newClauses });
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </SectionWrapper>
          </div>
          
          {/* PDF Footer */}
          <div className="p-12 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm mb-4">This proposal is valid for {proposal.validityPeriod}.</p>
            <div className="flex justify-center gap-24 mt-12">
              <div className="w-48 border-t border-slate-300 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Freelancer Signature</p>
                <p className="font-bold text-slate-900">{profile?.name}</p>
              </div>
              <div className="w-48 border-t border-slate-300 pt-4">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Client Signature</p>
                <p className="text-slate-300 italic">Signature & Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Summary Template for PDF Export */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={summaryRef}
          className="w-[800px] p-12 bg-white text-slate-900 font-sans"
        >
          <div className="border-b-4 border-indigo-600 pb-6 mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tight text-indigo-600 mb-2">Project Proposal</h1>
            <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-500">
              <p>Client Name: {proposal.clientName || 'Valued Client'}</p>
              <p className="text-right">Date: {formatDate(new Date().toISOString())}</p>
              <p>Project Title: {proposal.title}</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Executive Summary</h2>
              <p className="text-slate-700 leading-relaxed">{proposal.executiveSummary}</p>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Scope of Work</h2>
              <ul className="space-y-2">
                {proposal.scopeOfWork.slice(0, 6).map((phase, i) => (
                  <li key={i} className="flex items-start gap-2 text-slate-700">
                    <span className="text-indigo-600 font-bold">•</span>
                    <span>{phase.phase}: {phase.deliverables.slice(0, 2).join(', ')}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Timeline</h2>
              <ul className="space-y-2">
                {proposal.timeline.slice(0, 4).map((m, i) => (
                  <li key={i} className="flex justify-between text-slate-700">
                    <span>{m.milestone}</span>
                    <span className="font-bold text-indigo-600">{m.day}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Pricing (INR)</h2>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 font-bold">Subtotal</span>
                  <span className="font-bold">{formatCurrency(proposal.pricingBreakdown.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-lg font-black uppercase">Total Amount</span>
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(proposal.pricingBreakdown.total)}</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-1">Contract Terms</h2>
              <ul className="space-y-2 text-sm text-slate-600 italic">
                <li>• Payment: {proposal.paymentTerms.advance}% advance, {proposal.paymentTerms.delivery}% on completion.</li>
                <li>• Delivery: As per the agreed timeline milestones.</li>
                <li>• Revisions: {proposal.revisionPolicy}</li>
                <li>• Support: 30 days post-launch technical support.</li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-end">
            <div className="text-xs text-slate-400">
              <p>Generated by ProposalCraft AI</p>
              <p>Professional Freelance Consultant Tool</p>
            </div>
            <div className="w-48 border-t border-slate-900 pt-2 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-400">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionNav({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50"
      )}
    >
      {label}
      {active && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

function SectionWrapper({ id, title, icon: Icon, children, onRegenerate, loading }: any) {
  return (
    <div id={id} className="relative group scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={onRegenerate}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Regenerate Section"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
          </button>
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit Section">
            <Edit3 className="h-5 w-5" />
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
