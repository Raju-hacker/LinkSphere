import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, User, Eye, EyeOff, LogIn, UserPlus, Sparkles, Shield, AlertCircle } from 'lucide-react';
// @ts-ignore
import logoImage from '../assets/images/obesra_logo_1783178634841.jpg';

interface AuthModalProps {
  onSuccess: (username: string) => void;
}

export default function AuthModal({ onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const normUser = username.trim().toLowerCase();
    if (!normUser) {
      setError('Username is required.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    // Get registered users
    const localUsers = localStorage.getItem('link_vault_users');
    let registeredUsers: Record<string, string> = {};
    if (localUsers) {
      try {
        registeredUsers = JSON.parse(localUsers);
      } catch {}
    }

    if (isLogin) {
      // Login flow
      const savedPassword = registeredUsers[normUser];
      if (!savedPassword || savedPassword !== password) {
        setError('Invalid username or password.');
        return;
      }
      
      setSuccessMsg(`Welcome back, ${username}!`);
      setTimeout(() => {
        onSuccess(username);
      }, 800);
    } else {
      // Sign-up flow
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      if (registeredUsers[normUser]) {
        setError('Username is already taken.');
        return;
      }

      // Save user
      registeredUsers[normUser] = password;
      localStorage.setItem('link_vault_users', JSON.stringify(registeredUsers));
      
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        // Automatically log them in
        onSuccess(username);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020205]/90 backdrop-blur-xl z-[90] flex items-center justify-center p-4">
      {/* Dynamic graphic backgrounds */}
      <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vh] bg-blue-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-[20%] right-[30%] w-[40vw] h-[40vh] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md bg-[#0c0c14]/90 border border-white/5 shadow-2xl rounded-3xl p-8 relative overflow-hidden"
        id="auth-modal-content"
      >
        {/* Subtle upper glow line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 mb-4 border border-white/10 bg-[#050508]/60">
            <img src={logoImage} alt="Obesra Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Obesra Vault
            <Sparkles size={16} className="text-cyan-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto">
            {isLogin 
              ? 'Provide username and password to decrypt your Obesra vault.' 
              : 'Sign up to create your own localized password-protected sandbox.'
            }
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          {/* Error & Success Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 text-left"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 text-left"
              >
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Username Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block px-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <User size={15} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-white/5 focus:border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all placeholder:text-slate-600"
                id="auth-username-field"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block px-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={15} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-white/5 focus:border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all placeholder:text-slate-600"
                id="auth-password-field"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input (Sign-up only) */}
          <AnimatePresence initial={false}>
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 text-left pt-1 mb-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block px-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock size={15} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!isLogin}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 hover:bg-slate-950/80 focus:bg-slate-950 border border-white/5 focus:border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all placeholder:text-slate-600"
                      id="auth-confirm-password-field"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 mt-2"
            id="auth-submit-btn"
          >
            {isLogin ? (
              <>
                <LogIn size={14} />
                <span>Sign In To Vault</span>
              </>
            ) : (
              <>
                <UserPlus size={14} />
                <span>Create Vault Account</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Dynamic Mode Switch Links */}
        <div className="mt-6 pt-5 border-t border-white/5 relative z-10 flex flex-col items-center gap-2.5">
          <p className="text-xs text-slate-500">
            {isLogin ? "New here?" : "Already have a vault?"}
          </p>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer hover:no-underline transition-all"
            id="auth-toggle-mode-btn"
          >
            {isLogin ? "Create an account (Sign-Up)" : "Sign into existing account (Login)"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
