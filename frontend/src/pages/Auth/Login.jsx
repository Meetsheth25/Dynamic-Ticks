import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, googleLogin } from '@/store/slices/authSlice';
import { loginEmployee } from '@/store/slices/employeeSlice';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { Lock, MoveRight, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: userLoading, error: authError } = useSelector(state => state.auth);
  const { loading: empLoading } = useSelector(state => state.employee);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (email && password) {
      // 1. Try to login as a regular User / Admin
      const resultAction = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(resultAction)) {
        const userInfo = resultAction.payload;
        if (userInfo.isAdmin) navigate('/admin');
        else navigate('/');
      } else {
        // If resultAction.payload has a status, we can be smart
        const status = resultAction.payload?.status;
        const errorMessage = resultAction.payload?.message || resultAction.payload;

        // If user was found but has issues (403 Unverified, 401 Wrong Password), stop there
        if (status === 403 || status === 401) {
          setLocalError(errorMessage);
          return;
        }

        // 2. If User login fails (likely 404), try Employee login
        const empResultAction = await dispatch(loginEmployee({ email, password }));

        if (loginEmployee.fulfilled.match(empResultAction)) {
          const empInfo = empResultAction.payload;
          if (empInfo.role === 'manager') navigate('/manager/dashboard');
          else if (empInfo.role === 'staff') navigate('/staff/dashboard');
          else if (empInfo.role === 'delivery') navigate('/delivery/dashboard');
        } else {
          // If BOTH fail, display the most relevant error
          // If the employee check gave a 404, but the first check also gave a 404, simple "User not found"
          // If first check gave a weird error, prefer that.
          setLocalError(empResultAction.payload?.message || resultAction.payload?.message || "Invalid credentials");
        }
      }
    }
  };

  const loading = userLoading || empLoading;

  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-32 pb-20 fade-in">
      <Container className="max-w-lg">

        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-6 block">Heritage Access / Authentication</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight mb-6">
            Unified Login
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs mx-auto">Authorize your access to the exclusive registry.</p>
        </div>

        <div className="bg-[#FBFBFB] p-12 border border-gray-50 shadow-2xl relative overflow-hidden">
          {/* Subtle logo background */}
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none">
            <Lock className="w-64 h-64" />
          </div>

          <form onSubmit={handleLogin} className="relative z-10">
            {(localError || authError) && (
              <div className="p-4 border border-rose-100 bg-rose-50/50 mb-10 text-center">
                <p className="text-[9px] uppercase tracking-widest text-rose-500 font-bold">{localError || authError}</p>
              </div>
            )}

            <Input
              type="text"
              label="Client / Employee Email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Access Passkey"
              placeholder="Secure Code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex justify-end mb-12">
              <Link to="/forgot-password" size="sm" className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-300 hover:text-black transition-colors">Recover Passkey</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400"
            >
              {loading ? 'Authenticating...' : 'Authorize Access'}
              {!loading && <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
            </button>

            <div className="mt-8 flex flex-col items-center">
              <div className="relative w-full mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-bold">
                  <span className="bg-[#FBFBFB] px-4 text-gray-300">Or Continue With</span>
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


            {localError && localError.includes("register first") && (
              <div className="mt-6">
                <Link 
                  to="/signup"
                  className="w-full border border-black text-black py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 flex items-center justify-center gap-6 group"
                >
                  Go to Register
                  <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            )}

            {localError && localError.includes("Forgot Password") && (
              <div className="mt-6">
                <Link 
                  to="/forgot-password"
                  className="w-full border border-black text-black py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 flex items-center justify-center gap-6 group"
                >
                  Forgot Password?
                  <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            )}
          </form>
        </div>

        <div className="text-center mt-12">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-400 font-bold mb-4">
            New to the Registry?
          </p>
          <Link to="/signup" className="text-[10px] uppercase tracking-[0.3em] font-black text-black border-b border-black pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
            Initialize Account
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default Login;
