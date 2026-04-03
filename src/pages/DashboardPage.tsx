import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProposalStore } from '../store/proposalStore';
import { 
  FileText, 
  CheckCircle, 
  Send, 
  Clock, 
  TrendingUp, 
  Plus, 
  MoreVertical, 
  Copy, 
  Download, 
  Trash2,
  Search,
  Filter,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../lib/utils';
import { Proposal } from '../types';
import jsPDF from 'jspdf';

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const { proposals, loading, fetchProposals, updateProposal, deleteProposal, addProposal } = useProposalStore();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all';
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchProposals(user.uid);
    }
  }, [user, fetchProposals]);

  const filteredProposals = proposals.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: proposals.length,
    won: proposals.filter(p => p.status === 'won').length,
    quoted: proposals.reduce((acc, p) => acc + (p.totalValueInr || 0), 0),
    revenue: proposals.filter(p => p.status === 'won').reduce((acc, p) => acc + (p.totalValueInr || 0), 0),
  };

  const handleDuplicate = async (proposal: Proposal) => {
    const newProposal = {
      ...proposal,
      id: undefined,
      title: `Copy of ${proposal.title}`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await addProposal(newProposal);
    if (user) fetchProposals(user.uid);
  };

  const handleStatusChange = async (id: string, status: Proposal['status']) => {
    await updateProposal(id, { status });
  };

  const handleDownloadPDF = (proposal: Proposal) => {
    console.log("Downloading PDF for:", proposal.title);
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Project Proposal", 20, 25);
    
    doc.setFontSize(12);
    doc.text(proposal.title, 20, 35);
    
    // Content
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.setFontSize(16);
    doc.text("Executive Summary", 20, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    const summaryLines = doc.splitTextToSize(proposal.executiveSummary, 170);
    doc.text(summaryLines, 20, 65);
    
    let y = 65 + (summaryLines.length * 5) + 15;
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.text("Pricing", 20, y);
    
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Project Value: ${formatCurrency(proposal.pricingBreakdown.total)}`, 20, y + 10);
    doc.text(`Status: ${proposal.status.toUpperCase()}`, 20, y + 17);
    
    doc.save(`Proposal-${proposal.title.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, {profile?.name} 👋</h1>
          <p className="text-slate-500">You have {stats.total} proposals in your pipeline.</p>
        </div>
        <Link
          to="/proposal/new"
          className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="h-5 w-5" />
          <span>New Proposal</span>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={FileText} 
          label="Total Proposals" 
          value={stats.total.toString()} 
          color="indigo" 
          trend="+12% this month"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Won Projects" 
          value={stats.won.toString()} 
          color="emerald" 
          trend={`${((stats.won / (stats.total || 1)) * 100).toFixed(0)}% win rate`}
        />
        <StatCard 
          icon={TrendingUp} 
          label="Total Quoted" 
          value={formatCurrency(stats.quoted)} 
          color="amber" 
          trend="In pipeline"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Revenue Won" 
          value={formatCurrency(stats.revenue)} 
          color="violet" 
          trend="Confirmed deals"
        />
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['all', 'draft', 'sent', 'won', 'lost'].map((f) => (
            <Link
              key={f}
              to={`/dashboard?filter=${f}`}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap",
                filter === f 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {f}
            </Link>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Proposals Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-medium">Loading your proposals...</p>
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalCard 
              key={proposal.id} 
              proposal={proposal} 
              onDuplicate={() => handleDuplicate(proposal)}
              onStatusChange={(status) => handleStatusChange(proposal.id!, status)}
              onDelete={() => deleteProposal(proposal.id!)}
              onDownload={() => handleDownloadPDF(proposal)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No proposals found</h3>
          <p className="text-slate-500 mb-8 max-w-sm">
            {searchTerm || filter !== 'all' 
              ? "Try adjusting your filters or search term to find what you're looking for."
              : "Ready to win your next project? Create your first professional proposal in under 2 minutes."}
          </p>
          <Link
            to="/proposal/new"
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            Create Your First Proposal
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4", colors[color])}>
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{value}</h3>
      <p className="text-xs font-medium text-slate-400">{trend}</p>
    </div>
  );
}

function ProposalCard({ proposal, onDuplicate, onStatusChange, onDelete, onDownload }: { 
  proposal: Proposal, 
  onDuplicate: () => void,
  onStatusChange: (status: Proposal['status']) => void,
  onDelete: () => void,
  onDownload: () => void
}) {
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    draft: "bg-slate-100 text-slate-600",
    sent: "bg-blue-100 text-blue-600",
    won: "bg-emerald-100 text-emerald-600",
    lost: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", statusColors[proposal.status])}>
            {proposal.status}
          </span>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <MoreVertical className="h-5 w-5 text-slate-400" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl py-1 z-20">
                <button onClick={() => { onStatusChange('won'); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Mark as Won
                </button>
                <button onClick={() => { onStatusChange('lost'); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Mark as Lost
                </button>
                <div className="h-px bg-slate-100 my-1" />
                <button onClick={() => { onDuplicate(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <Copy className="h-4 w-4" /> Duplicate
                </button>
                <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <Link to={`/proposal/${proposal.id}`} className="block group-hover:text-indigo-600 transition-colors">
          <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{proposal.title}</h3>
          <p className="text-slate-500 text-sm mb-4">{proposal.clientName || 'Unnamed Client'} · {proposal.projectType}</p>
        </Link>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div>
            <p className="text-xs text-slate-400 mb-1">Total Value</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(proposal.totalValueInr || 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Created</p>
            <p className="text-sm font-medium text-slate-600">{formatDate(proposal.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-slate-50 flex items-center justify-between">
        <Link 
          to={`/proposal/${proposal.id}`}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          View Details <ArrowRight className="h-4 w-4" />
        </Link>
        <button 
          onClick={onDownload}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Download PDF"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
