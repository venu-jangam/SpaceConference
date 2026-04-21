import React, { useState } from 'react';
import { Rocket, Mail, Lock, User, Github, Chrome } from 'lucide-react';

import { auth, googleProvider } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Sync with our PostgreSQL backend
      const response = await axios.post('http://localhost:5000/api/auth/sync', { idToken });
      
      // Store user info and token for the backend
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/5 blur-[120px] rounded-full -z-10" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-6">
            <Rocket className="w-8 h-8 text-accent-blue animate-subtle-float" />
          </div>
          <h1 className="text-3xl font-bold font-['Outfit'] mb-2">
            {isLogin ? 'Welcome Back, Explorer' : 'Create Your Mission Log'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Access your saved conferences and alerts' : 'Start tracking global space events today'}
          </p>
        </div>

        <div className="glass-card p-8">
          <div className="space-y-4 mb-8">
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl border border-white/10 flex items-center justify-center gap-3 hover:bg-white/5 transition-all font-medium"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest"><span className="bg-space-900 px-4 text-gray-500">Or with Email</span></div>
          </div>

          <form className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Neil Armstrong" className="input-field pl-12" />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" placeholder="commander@apollo.space" className="input-field pl-12" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="password" placeholder="••••••••" className="input-field pl-12" />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 mt-4">
              {isLogin ? 'Enter Orbit' : 'Register Account'}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            {isLogin ? "New to SpaceConf? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent-blue font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
