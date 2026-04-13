import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { logout } from '@/store/slices/authSlice';
import { Container } from '@/components/common/Container';

const Navbar = () => {
  const { totalQuantity } = useSelector(state => state.cart);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect logic
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === '/';

  return (
    <nav 
      className={`fixed top-0 w-full z-50 transition-all duration-500 py-4 ${
        isScrolled || !isHome 
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <Container className="flex items-center justify-between">
        
        {/* Left: Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/catalog" 
            className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[var(--accent)] ${
              isScrolled || !isHome ? 'text-black' : 'text-white'
            }`}
          >
            Collections
          </Link>
          <Link 
            to="/catalog?category=Luxury" 
            className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[var(--accent)] ${
              isScrolled || !isHome ? 'text-black' : 'text-white'
            }`}
          >
            Luxury
          </Link>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="flex flex-col items-center">
          <span className={`text-xl font-bold uppercase tracking-[0.3em] transition-colors ${
            isScrolled || !isHome ? 'text-black' : 'text-white'
          }`}>
            Dynamic Ticks
          </span>
          <span className="text-[8px] uppercase tracking-[0.4em] text-[var(--accent)] font-medium">
            Luxury Horology
          </span>
        </Link>
        
        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const term = e.target.search.value;
              if (term) window.location.href = `/catalog?search=${term}`;
            }}
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 overflow-hidden ${
              isScrolled || !isHome 
                ? 'border-black/10 bg-gray-50/50 hover:bg-white focus-within:border-black focus-within:bg-white focus-within:shadow-sm' 
                : 'border-white/20 bg-white/5 hover:bg-white/10 focus-within:border-white/50 focus-within:bg-white/10'
            }`}
          >
            <Search className={`w-3.5 h-3.5 ${isScrolled || !isHome ? 'text-gray-400' : 'text-white/70'}`} />
            <input 
              name="search"
              type="text" 
              placeholder="Search..." 
              className={`bg-transparent border-none outline-none text-[10px] uppercase tracking-widest w-20 focus:w-32 transition-all duration-500 placeholder:font-medium ${
                isScrolled || !isHome 
                  ? 'text-black placeholder:text-gray-400' 
                  : 'text-white placeholder:text-white/60'
              }`}
            />
          </form>

          <Link to="/cart" className={`relative transition-colors hover:text-[var(--accent)] ${
            isScrolled || !isHome ? 'text-black' : 'text-white'
          }`}>
            <ShoppingCart className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md">
                {totalQuantity}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/orders" 
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[var(--accent)] ${
                  isScrolled || !isHome ? 'text-black' : 'text-white'
                }`}
              >
                Orders
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin" 
                  className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors hover:text-[var(--accent)] ${
                    isScrolled || !isHome ? 'text-black' : 'text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
              <button 
                onClick={() => dispatch(logout())} 
                className={`text-[10px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity ${
                  isScrolled || !isHome ? 'text-black' : 'text-white'
                }`}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className={`transition-colors hover:text-[var(--accent)] ${
              isScrolled || !isHome ? 'text-black' : 'text-white'
            }`}>
              <User className="w-5 h-5" />
            </Link>
          )}

          {/* Mobile Toggle */}
          <button 
            className={`md:hidden transition-colors ${
              isScrolled || !isHome ? 'text-black' : 'text-white'
            }`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </Container>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-0 h-screen bg-black text-white transition-transform duration-500 z-40 p-8 flex flex-col items-center justify-center gap-8 ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <button 
          className="absolute top-6 right-6"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="w-8 h-8" />
        </button>

        <Link to="/catalog" className="text-xl uppercase tracking-[0.3em] font-light">Collections</Link>
        <Link to="/catalog?category=Luxury" className="text-xl uppercase tracking-[0.3em] font-light">Luxury</Link>
        <Link to="/cart" className="text-xl uppercase tracking-[0.3em] font-light">Cart ({totalQuantity})</Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/orders" className="text-xl uppercase tracking-[0.3em] font-light">Orders</Link>
            {user?.role === 'admin' && <Link to="/admin" className="text-xl uppercase tracking-[0.3em] font-light text-[var(--accent)]">Admin Panel</Link>}
            <button 
              onClick={() => dispatch(logout())} 
              className="mt-4 text-sm uppercase tracking-[0.2em] text-gray-500"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link to="/login" className="text-xl uppercase tracking-[0.3em] font-light">Sign In</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
