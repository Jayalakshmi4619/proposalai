import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Briefcase, Mail, Lock, User, MapPin, IndianRupee, ArrowRight, Loader2 } from 'lucide-react';

const professions = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'UI UX Designer', 'Mobile App Developer', 'Content Writer',
  'Digital Marketer', 'SEO Specialist', 'Graphic Designer',
  'Video Editor', 'Business Consultant', 'Data Analyst', 'Other'
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profession: 'Full Stack Developer',
    hourlyRate: 500,
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      const profile = {
        uid: user.uid,
        email: user.email,
        name: formData.name,
        profession: formData.profession,
        hourlyRate: Number(formData.hourlyRate),
        city: formData.city,
        totalProposals: 0,
        wonProposals: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), profile);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is not enabled in your Firebase Console. Please enable it at: https://console.firebase.google.com/project/gen-lang-client-0301577346/authentication/providers');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network request failed. This usually means an ad-blocker or firewall is blocking Firebase (specifically identitytoolkit.googleapis.com). Please disable ad-blockers, check your internet connection, and try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else {
        setError(err.message || 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Left Side - Brand */}
      <div className="lg:w-1/2 bg-indigo-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center">
              <Briefcase className="text-indigo-600 h-7 w-7" />
            </div>
            <span className="text-3xl font-bold tracking-tight">ProposalCraft AI</span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-8">
            Join 15,000+ Indian freelancers winning more projects.
          </h1>
          
          <ul className="space-y-6">
            {[
              "AI-powered scope generation",
              "GST-compliant INR pricing",
              "India-specific legal clauses",
              "Professional PDF exports"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-xl font-medium">
                <div className="h-7 w-7 bg-white/20 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="relative z-10 pt-12 border-t border-white/20">
          <p className="text-white/80 italic">"ProposalCraft saved me 4 hours on my last e-commerce project proposal. The client was impressed by the detailed scope!"</p>
          <p className="mt-4 font-bold">— Rahul S., Full Stack Developer</p>
        </div>

        <div className="absolute -bottom-20 -right-20 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <div className="max-w-xl w-full">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-10 text-lg">Start your professional freelance journey today</p>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Rahul Sharma"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="rahul@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Profession</label>
              <select
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              >
                {professions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Hourly Rate (INR)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  min="100"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Mumbai"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xl transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Create Account <ArrowRight className="h-6 w-6" /></>}
              </button>
            </div>

            <div className="md:col-span-2">
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 text-slate-400">Or join with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  const provider = new GoogleAuthProvider();
                  try {
                    const result = await signInWithPopup(auth, provider);
                    const user = result.user;
                    const docRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(docRef);
                    if (!docSnap.exists()) {
                      await setDoc(docRef, {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || 'User',
                        profession: 'Freelancer',
                        hourlyRate: 500,
                        totalProposals: 0,
                        wonProposals: 0,
                        totalRevenue: 0,
                        createdAt: new Date().toISOString(),
                      });
                    }
                    navigate('/dashboard');
                  } catch (err: any) {
                    console.error("Google Registration Error:", err);
                    if (err.code === 'auth/network-request-failed') {
                      setError('Network request failed. This usually means an ad-blocker or firewall is blocking Firebase (specifically identitytoolkit.googleapis.com). Please disable ad-blockers, check your internet connection, and try again.');
                    } else {
                      setError(err.message || 'Failed to sign up with Google. Please try again.');
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                Sign up with Google
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
