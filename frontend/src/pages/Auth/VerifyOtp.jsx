import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { Input } from '@/components/common/Input';
import { MoveRight, ShieldCheck } from 'lucide-react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const isRegistration = location.state?.isRegistration;

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e, isResend = false) => {
    if (e) e.preventDefault();
    if (!email) {
      setError('Session expired. Please start again.');
      return;
    }

    if (isResend) {
      if (!canResend) return;
      setResending(true);
      setError('');
      try {
        const reason = isRegistration ? 'registration' : 'forgot-password';
        await axios.post('/api/auth/resend-otp', { email, reason }); 
        setMessage('New OTP sent to your email.');
        setTimer(60);
        setCanResend(false);
      } catch (err) {
        setError('Failed to resend OTP.');
      } finally {
        setResending(false);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
      if (data.verified) {
        // If it was registration and successfully verified
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 2500);
      } else {
        // Forgotten password case
        navigate('/reset-password', { state: { email, otp } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-32 pb-20 fade-in">
      <Container className="max-w-lg">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-6 block">Identity Verification / {isRegistration ? 'Activation' : 'Secure Vault'}</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight mb-6">
            {isRegistration ? 'Activate Account' : 'Verify OTP'}
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs mx-auto">Please enter the 6-digit code sent to your registered email address.</p>
        </div>

        <div className="bg-[#FBFBFB] p-12 border border-gray-50 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none">
            <ShieldCheck className="w-64 h-64" />
          </div>

          <form onSubmit={handleSubmit} className="relative z-10">
            {message && (
              <div className="p-4 border border-emerald-100 bg-emerald-50/50 mb-10 text-center">
                <p className="text-[9px] uppercase tracking-widest text-emerald-600 font-bold">{message}</p>
              </div>
            )}

            {error && (
              <div className="p-4 border border-rose-100 bg-rose-50/50 mb-10 text-center">
                <p className="text-[9px] uppercase tracking-widest text-rose-500 font-bold">{error}</p>
              </div>
            )}

            <Input
              type="text"
              label="6-Digit CODE"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400 mt-8"
            >
              {loading ? 'Authenticating...' : 'Validate Access'}
              {!loading && <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="text-center mt-12 flex flex-col gap-6">
          <button 
            type="button"
            onClick={(e) => handleSubmit(null, true)}
            disabled={resending || timer > 0}
            className="text-[10px] uppercase tracking-[0.3em] font-black text-black border-b border-black pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all cursor-pointer disabled:opacity-50 mx-auto w-fit"
          >
            {resending ? 'Resending...' : timer > 0 ? `Resend in ${timer}s` : "Didn't receive code? Resend"}
          </button>
          
          <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 hover:text-black transition-all">
             Cancel Protocol
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default VerifyOtp;
