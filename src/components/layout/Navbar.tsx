import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { LogOut, User, Search } from 'lucide-react';

export default function Navbar() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search proposals..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{profile?.name}</p>
            <p className="text-xs text-slate-500">{profile?.profession}</p>
          </div>
          <div className="group relative">
            <button className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm hover:ring-4 hover:ring-indigo-100 transition-all">
              {profile?.name?.charAt(0)}
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <User className="h-4 w-4" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
