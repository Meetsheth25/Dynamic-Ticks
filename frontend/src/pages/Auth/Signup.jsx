import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, googleLogin } from '@/store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { UserPlus, MoveRight, ShieldCheck } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error: authError } = useSelector(state => state.auth);

  const handleGoogleSuccess = async (credentialResponse) => {
    const resultAction = await dispatch(googleLogin(credentialResponse.credential));
    if (googleLogin.fulfilled.match(resultAction)) {
      const userInfo = resultAction.payload;
      if (userInfo.isAdmin) navigate('/admin');
      else navigate('/');
    }
  };

  const handleGoogleError = () => {
    setLocalError('Google Login Failed');
  };

  const handleSignup = async (e) => {
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
          {/* Subtle icon background */}
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none">
             <UserPlus className="w-64 h-64" />
          </div>

          <form onSubmit={handleSignup} className="relative z-10">
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

              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="square"
                  size="large"
                />
              </div>
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

export default Signup;
