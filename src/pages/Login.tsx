
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Input, Button } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, registerAsync, firebaseLoginAsync, clearError } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { auth, googleProvider, facebookProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

const Login: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [tenantName, setTenantName] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Clear error when switching modes
    useEffect(() => {
        dispatch(clearError());
    }, [isLogin, dispatch]);

    const handleAction = async () => {
        if (isLogin) {
            const result = await dispatch(loginAsync({ email, password }));
            if (loginAsync.fulfilled.match(result)) {
                navigate('/dashboard');
            }
        } else {
            const result = await dispatch(registerAsync({ email, password, name, tenantName }));
            if (registerAsync.fulfilled.match(result)) {
                // Switch to login after successful registration
                setIsLogin(true);
            }
        }
    };

    const handleFirebaseLogin = async (provider: any) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();

            const actionResult = await dispatch(firebaseLoginAsync(idToken));
            if (firebaseLoginAsync.fulfilled.match(actionResult)) {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Firebase Login Error", error);
            // Error is handled by slice, but we can also log it here
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-[#25D366] selection:text-white">
            {/* Left Decoration / Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-16">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#25D366,transparent_50%)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-black italic shadow-[0_0_30px_rgba(37,211,102,0.4)]">A</div>
                    <span className="text-2xl font-black text-white tracking-tighter">Agently</span>
                </div>

                <div className="relative z-10 space-y-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black text-white leading-none tracking-tighter"
                    >
                        The Enterprise <br />
                        <span className="text-[#25D366]">WhatsApp</span> <br />
                        Control Center.
                    </motion.h1>
                    <p className="text-xl text-gray-400 font-bold max-w-lg leading-relaxed">
                        Scale your business communication with the world's most powerful WhatsApp CRM and Automation layer.
                    </p>

                    <div className="grid grid-cols-2 gap-8 pt-8">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#25D366] border border-white/10"><CheckCircle2 /></div>
                            <h4 className="text-white font-bold">Official WABA</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-bold">Direct integration with Meta for maximum reliability and scalability.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#25D366] border border-white/10"><ShieldCheck /></div>
                            <h4 className="text-white font-bold">Secure Infrastructure</h4>
                            <p className="text-xs text-gray-500 leading-relaxed font-bold">Enterprise-grade security and multi-tenancy architecture baked in.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                    <span>© 2024 Agently Inc.</span>
                    <div className="h-px w-12 bg-white/10" />
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-[#25D366] transition-colors">Privacy</a>
                        <a href="#" className="hover:text-[#25D366] transition-colors">Terms</a>
                    </div>
                </div>
            </div>

            {/* Right Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f9fafb]">
                <div className="w-full max-w-md space-y-12">
                    <div className="space-y-4">
                        <div className="lg:hidden flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">A</div>
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">Agently</span>
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
                        <p className="text-gray-500 font-bold">
                            {isLogin ? 'Access your enterprise dashboard' : 'Join the elite businesses using Agently'}
                        </p>
                    </div>

                    {/* Error banner */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700"
                        >
                            <AlertCircle size={18} />
                            <span className="text-sm font-bold">{error}</span>
                        </motion.div>
                    )}

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAction(); }}>
                        {!isLogin && (
                            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                                <Input label="Full Name" placeholder="e.g. Alex Rivera" value={name} onChange={(e: any) => setName(e.target.value)} />
                                <Input label="Business Name" placeholder="e.g. My Agency" value={tenantName} onChange={(e: any) => setTenantName(e.target.value)} />
                            </div>
                        )}
                        <Input label="Business Email" placeholder="admin@demo.com" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
                        <Input label="Security Password" placeholder="••••••••••••" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />

                        {isLogin && (
                            <div className="flex justify-end">
                                <button type="button" className="text-xs font-black uppercase text-[#25D366] hover:underline tracking-widest">Forgot Password?</button>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                className="w-full h-14 bg-gray-900 hover:bg-black rounded-2xl text-lg shadow-2xl shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><Loader2 size={20} className="animate-spin" /> Processing...</>
                                ) : (
                                    <>{isLogin ? 'Enter Console' : 'Create Organization Account'} <ArrowRight size={20} /></>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Demo Credentials Hint */}
                    {isLogin && (
                        <div className="p-4 bg-[#25D366]/5 border border-[#25D366]/20 rounded-2xl">
                            <p className="text-xs font-bold text-gray-600">
                                <span className="text-[#25D366] font-black">Demo:</span> admin@demo.com / admin123
                            </p>
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
                            <span className="bg-[#f9fafb] px-6">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleFirebaseLogin(googleProvider)}
                            className="flex-1 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.24-1.92 4.28-1.2 1.2-3.08 2.4-6.4 2.4-5.24 0-9.48-4.24-9.48-9.48s4.24-9.48 9.48-9.48c2.84 0 4.92 1.12 6.44 2.56l2.32-2.32C19 1.12 16.12 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c3.68 0 6.44-1.2 8.64-3.52 2.24-2.24 2.96-5.44 2.96-8.08 0-.64-.04-1.24-.12-1.84H12.48z" /></svg>
                            Google Cloud
                        </button>
                        <button
                            onClick={() => handleFirebaseLogin(facebookProvider)}
                            className="flex-1 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#0165E1" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.03 4.43 11.02 10.12 11.94v-8.44H7.08v-3.5h3.04V9.41c0-3.01 1.8-4.67 4.54-4.67 1.31 0 2.68.23 2.68.23v2.96h-1.52c-1.49 0-1.96.93-1.96 1.88v2.26h3.32l-.53 3.5h-2.79v8.44C19.57 23.09 24 18.1 24 12.07z" /></svg>
                            Meta ID
                        </button>
                    </div>

                    <div className="text-center pt-8">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <span className="text-[#25D366] font-black">
                                {isLogin ? "Sign up for 14-day trial" : "Log in to console"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
