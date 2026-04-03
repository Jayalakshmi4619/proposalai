import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  User, 
  Settings, 
  CheckCircle, 
  Send, 
  Clock,
  Briefcase
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'All Proposals', path: '/dashboard?filter=all' },
  { icon: CheckCircle, label: 'Won Projects', path: '/dashboard?filter=won' },
  { icon: Send, label: 'Sent Proposals', path: '/dashboard?filter=sent' },
  { icon: Clock, label: 'Drafts', path: '/dashboard?filter=draft' },
  { icon: User, label: 'My Profile', path: '/profile' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col sticky top-0 h-screen overflow-hidden">
      <div className="p-6 flex items-center gap-3 flex-shrink-0">
        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <Briefcase className="text-white h-6 w-6" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">ProposalCraft</span>
      </div>

      <div className="px-4 mb-6 flex-shrink-0">
        <Link
          to="/proposal/new"
          className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/20"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Proposal</span>
        </Link>
      </div>

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = (location.pathname + location.search) === item.path || 
                          (item.path === '/dashboard' && location.pathname === '/dashboard' && !location.search);
          
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-indigo-600/10 text-indigo-400" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-400" : "text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <Link
          to="/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-all"
        >
          <Settings className="h-5 w-5 text-slate-500" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
