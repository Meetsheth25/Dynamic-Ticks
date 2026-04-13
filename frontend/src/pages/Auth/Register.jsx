import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, googleLogin } from '@/store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { UserPlus, MoveRight, ShieldCheck } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector(state => state.auth);

  const googleHandleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google Token Response:", tokenResponse);
      const resultAction = await dispatch(googleLogin(tokenResponse.access_token));
      if (googleLogin.fulfilled.match(resultAction)) {
        const userInfo = resultAction.payload;
        if (userInfo.isAdmin) navigate('/admin');
        else navigate('/');
      }
    },
    onError: () => setLocalError('Google Login Failed'),
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (name && email && password) {
      const resultAction = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(resultAction)) {
        navigate('/verify-otp', { state: { email, isRegistration: true } });
      }
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-32 pb-20 fade-in">
      <Container className="max-w-lg">
        
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-6 block">Membership / Discovery</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight mb-6">
            Initialize Account
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs mx-auto">Join our exclusive circle of collectors and gain access to heritage timepieces.</p>
        </div>

        <div className="bg-[#FBFBFB] p-12 border border-gray-50 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none">
             <UserPlus className="w-64 h-64" />
          </div>

          <form onSubmit={handleRegister} className="relative z-10">
            {(localError || authError) && (
              <div className="p-4 border border-rose-100 bg-rose-50/50 mb-10 text-center">
                 <p className="text-[9px] uppercase tracking-widest text-rose-500 font-bold">{localError || authError}</p>
              </div>
            )}
            
            <Input 
              type="text" 
              label="Full Name / Identification" 
              placeholder="Your Formal Name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />

            <Input 
              type="email" 
              label="Electronic Mail / Contact" 
              placeholder="Registry Email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            
            <Input 
              type="password" 
              label="Secure Passkey" 
              placeholder="Create Signature Code"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />

            <div className="mt-4 mb-12 flex items-center gap-3">
               <ShieldCheck className="w-3.5 h-3.5 text-black" />
               <span className="text-[8px] uppercase tracking-[0.2em] text-gray-400 font-bold">Encrypted Member Security</span>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400"
            >
              {loading ? 'Initializing...' : 'Create Member Identity'}
              {!loading && <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
            </button>

            <div className="mt-8 flex flex-col items-center">
              <div className="relative w-full mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-[#FBFBFB] px-4 text-gray-300">Or Register With</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => googleHandleLogin()}
                className="w-full py-5 bg-white border border-black/10 flex items-center justify-center gap-5 hover:bg-black hover:text-white transition-all duration-500 group shadow-sm hover:shadow-xl"
              >
                <div className="bg-white p-1 rounded-sm group-hover:scale-110 transition-transform duration-500">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"
                    />
                    <path
                      fill="#34A853"
                      d="M16.04 18.013c-1.09.693-2.414 1.078-3.84 1.078-2.6 0-4.806-1.72-5.594-4.039l-4.025 3.116c1.944 3.941 6.046 6.582 10.778 6.582 2.924 0 5.623-1.026 7.742-2.738l-5.06-4z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.843 12.182c0-.796-.073-1.56-.208-2.301H12v4.354h6.645c-.287 1.543-1.157 2.852-2.464 3.73l5.06 4c2.962-2.731 4.673-6.756 4.673-11.233Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M1.24 17.348l4.026-3.116c-.08-.23-.134-.473-.134-.732 0-.258.054-.502.134-.732L1.24 6.652a6.974 6.974 0 0 0 0 10.696Z"
                    />
                  </svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Register with Google</span>
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-12">
           <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-4">
             Already a Member?
           </p>
           <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-black border-b border-black pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
             Authorize Access
           </Link>
        </div>
      </Container>
    </div>
  );
};

export default Register;
