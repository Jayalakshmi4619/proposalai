/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useAuthStore } from './store/authStore';
import { UserProfile } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewProposalPage from './pages/NewProposalPage';
import ProposalEditorPage from './pages/ProposalEditorPage';
import ProfilePage from './pages/ProfilePage';

// Components
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import Layout from './components/layout/Layout';

function ProtectedRoute({ children }: { children?: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children ? <>{children}</> : <Outlet />;
}

import { Outlet } from 'react-router-dom';

export default function App() {
  const { setAuth, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAuth(user, docSnap.data() as UserProfile);
        } else {
          setAuth(user, null);
        }
      } else {
        setAuth(null, null);
      }
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setAuth, setInitialized]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/proposal/new" element={<NewProposalPage />} />
            <Route path="/proposal/:id" element={<ProposalEditorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}
