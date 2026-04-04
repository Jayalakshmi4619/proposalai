import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  Star,
  Users,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Briefcase className="text-white h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">ProposalCraft AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Login</Link>
            <Link to="/register" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <Globe className="h-4 w-4" />
              <span>🇮🇳 Built for Indian Freelancers</span>
            </div>
            <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] mb-6">
              Win More Projects with <span className="text-indigo-600">AI-Powered</span> Proposals
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Describe your project in plain text. Get a complete scope document, 
              INR pricing with GST, and legal clauses in under 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
                Start Free <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p>Joined by 15,000+ Indian freelancers</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-slate-900 rounded-3xl p-4 shadow-2xl shadow-indigo-200 relative z-10">
              <img 
                src="https://picsum.photos/seed/dashboard/1200/800" 
                alt="Dashboard Preview" 
                className="rounded-2xl opacity-90"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 h-64 w-64 bg-indigo-600/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 h-64 w-64 bg-violet-600/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">2-4 hrs</p>
            <p className="text-slate-500 text-sm">Saved per proposal</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">15M+</p>
            <p className="text-slate-500 text-sm">Target Freelancers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">100%</p>
            <p className="text-slate-500 text-sm">GST-ready pricing</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-indigo-600 mb-1">₹0</p>
            <p className="text-slate-500 text-sm">Setup cost</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything you need to close deals faster</h2>
            <p className="text-lg text-slate-600">Stop wasting time on formatting and estimation. Let AI handle the heavy lifting while you focus on your craft.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Smart Scope Generator", desc: "Claude AI creates detailed phase-by-phase deliverables based on your brief." },
              { icon: CheckCircle, title: "INR Pricing + GST", desc: "Automatic calculation of project costs with Indian tax compliance built-in." },
              { icon: ShieldCheck, title: "Legal Contract Clauses", desc: "Protect your work with India-specific jurisdiction and payment terms." },
              { icon: FileText, title: "Professional PDF Export", desc: "Download beautiful, client-ready PDFs with your branding in one click." },
              { icon: Star, title: "Milestone Timeline", desc: "Visual payment schedules that ensure you get paid for every step." },
              { icon: Users, title: "Proposal History", desc: "Track all your wins, losses, and drafts in a centralized dashboard." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-xl transition-all"
              >
                <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="text-white h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">ProposalCraft AI</span>
            </div>
            <p className="max-w-xs mb-8">
              Empowering Indian freelancers to build professional businesses with AI-driven tools.
            </p>
            <div className="flex gap-4">
              {/* Social icons */}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-sm">
          <p>© 2026 ProposalCraft AI. All rights reserved. Built with ❤️ in India.</p>
        </div>
      </footer>
    </div>
  );
}
