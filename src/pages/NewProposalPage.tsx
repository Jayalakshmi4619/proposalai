import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProposalStore } from '../store/proposalStore';
import { generateProposalAI } from '../services/aiService';
import { 
  Briefcase, 
  ArrowRight, 
  Loader2, 
  Info, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const projectTypes = [
  'Web Application', 'Mobile App (iOS + Android)', 'Mobile App (Android only)',
  'UI UX Design', 'Content Writing', 'SEO & Digital Marketing',
  'E-Commerce Store', 'API Development', 'Data Analytics', 'Business Consulting', 'Other'
];

const clientTypes = [
  'Individual', 'Startup (< 10 people)', 'Small Business', 'Medium Enterprise', 
  'Large Enterprise', 'Government', 'NGO'
];

const loadingMessages = [
  "🔍 Analyzing your project requirements...",
  "📋 Crafting detailed scope of work...",  
  "💰 Calculating optimal pricing in INR...",
  "📜 Drafting India-specific contract clauses...",
  "⚖️ Adding payment protection terms...",
  "✨ Finalizing your professional proposal..."
];

export default function NewProposalPage() {
  const { user, profile } = useAuthStore();
  const { addProposal } = useProposalStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    rawDescription: '',
    projectType: 'Web Application',
    clientType: 'Startup (< 10 people)',
    complexity: 'standard',
    clientName: '',
    clientEmail: '',
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleGenerate clicked. Profile:", profile, "User:", user);
    if (!profile || !user) {
      console.warn("Cannot generate: Profile or User is missing.");
      setError("Please ensure you are logged in and your profile is complete.");
      return;
    }

    setLoading(true);
    setError('');
    
    // Rotate loading messages
    const interval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    try {
      console.log("Calling generateProposalAI...");
      const proposal = await generateProposalAI(
        formData.rawDescription,
        formData.projectType,
        formData.clientType,
        formData.complexity,
        profile,
        formData.clientName
      );

      console.log("Proposal generated successfully. Saving to Firestore...");
      const id = await addProposal(proposal);
      
      if (id) {
        console.log("Proposal saved with ID:", id);
        clearInterval(interval);
        navigate(`/proposal/${id}`);
      } else {
        throw new Error("Failed to save proposal to database.");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error("Generation/Save failed:", err);
      setError(err.message || 'Failed to generate proposal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="relative mb-12">
              <div className="h-32 w-32 border-4 border-indigo-100 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Generating Your Proposal</h2>
            <p className="text-xl text-slate-600 font-medium animate-bounce">
              {loadingMessages[loadingMsgIdx]}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 bg-indigo-600 text-white">
              <h1 className="text-3xl font-bold mb-2">Describe Your Project</h1>
              <p className="text-indigo-100">More detail = better proposal. Include features, tech stack, and timeline.</p>
            </div>

            <form onSubmit={handleGenerate} className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-lg font-bold text-slate-900">Tell us about the project</label>
                <textarea
                  required
                  minLength={50}
                  value={formData.rawDescription}
                  onChange={(e) => setFormData({...formData, rawDescription: e.target.value})}
                  className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg leading-relaxed"
                  placeholder="Example: Client wants a food delivery mobile app with customer ordering, restaurant dashboard, delivery tracking, and Razorpay payment integration. React Native frontend, Node.js backend. Budget around ₹1,20,000. Deadline 60 days."
                />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Min 50 characters</span>
                  <span>{formData.rawDescription.length} characters</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="e.g. Swiggy, Zomato, or Individual"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Project Type</label>
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData({...formData, projectType: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {projectTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Client Type</label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => setFormData({...formData, clientType: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      {clientTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Complexity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['basic', 'standard', 'premium'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setFormData({...formData, complexity: c})}
                          className={cn(
                            "py-3 rounded-xl text-sm font-bold capitalize transition-all",
                            formData.complexity === c 
                              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                              : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading || formData.rawDescription.length < 50}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  Generate Proposal <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
