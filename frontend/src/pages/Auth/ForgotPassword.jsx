import React, { useState } from 'react';
import axios from 'axios';
import { Container } from '@/components/common/Container';
import { Input } from '@/components/common/Input';
import { MoveRight, Mail } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setMessage(data.message);
      // Wait a moment for the user to see the success message
      setTimeout(() => {
        navigate('/verify-otp', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-32 pb-20 fade-in">
      <Container className="max-w-lg">
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-6 block">Passkey Recovery / Security</span>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-[0.1em] text-black leading-tight mb-6">
            Recover Passkey
          </h1>
          <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-medium max-w-xs mx-auto">Initialize recovery protocols for your unique access credentials.</p>
        </div>

        <div className="bg-[#FBFBFB] p-12 border border-gray-50 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-[0.02] pointer-events-none">
            <Mail className="w-64 h-64" />
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
              type="email"
              label="Registered Email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-6 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[var(--accent)] transition-all duration-500 shadow-xl flex items-center justify-center gap-6 group disabled:bg-gray-400 mt-8"
            >
              {loading ? 'Processing...' : 'Request Recovery'}
              {!loading && <MoveRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />}
            </button>
          </form>
        </div>

        <div className="text-center mt-12">
          <Link to="/login" className="text-[10px] uppercase tracking-[0.3em] font-black text-black border-b border-black pb-1 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all">
            Return to Authentication
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default ForgotPassword;
