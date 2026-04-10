import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/common/Container';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

          <div className="md:col-span-5">
            <Link to="/" className="inline-block mb-8">
              <span className="text-2xl font-bold uppercase tracking-[0.3em] text-white">
                Dynamic Ticks
              </span>
              <div className="h-0.5 w-12 bg-[var(--accent)] mt-1"></div>
            </Link>
            <p className="text-gray-400 font-light max-w-sm leading-loose text-sm tracking-wide mb-8">
              Defining the art of time since our inception. We craft more than just watches; we create legacies that transcend generations. Join our pursuit of horological perfection.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="text-white hover:text-[var(--accent)] transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-white mb-8 uppercase tracking-[0.2em] text-xs">The Maison</h3>
            <ul className="flex flex-col gap-4 text-sm font-light text-gray-400 tracking-wide">
              <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">Our Story</Link></li>
              <li><Link to="/about" className="hover:text-[var(--accent)] transition-colors">Craftsmanship</Link></li>
              <li><Link to="/catalog" className="hover:text-[var(--accent)] transition-colors">Collections</Link></li>
              <li><Link to="/catalog" className="hover:text-[var(--accent)] transition-colors">Bespoke</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="font-medium text-white mb-8 uppercase tracking-[0.2em] text-xs">Client Care</h3>
            <ul className="flex flex-col gap-4 text-sm font-light text-gray-400 tracking-wide">
              <li><Link to="/contact" className="hover:text-[var(--accent)] transition-colors">Contact</Link></li>
              <li><Link to="/shipping-status" className="hover:text-[var(--accent)] transition-colors">Shipping</Link></li>
              <li><Link to="/policy#returns" className="hover:text-[var(--accent)] transition-colors">Returns</Link></li>
              <li><Link to="/policy#returns" className="hover:text-[var(--accent)] transition-colors">Warranty</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-medium text-white mb-8 uppercase tracking-[0.2em] text-xs">Newsletter</h3>
            <p className="text-gray-400 text-sm font-light mb-6 tracking-wide">Subscribe to receive updates on new launches and exclusive events.</p>
            <div className="flex border-b border-gray-700 pb-2">
              <input
                type="email"
                placeholder="Your Email"
                className="bg-transparent border-none text-white text-sm font-light focus:ring-0 w-full placeholder:text-gray-600 uppercase tracking-widest"
              />
              <button className="text-[var(--accent)] text-xs uppercase font-medium tracking-widest ml-4 hover:scale-105 transition-transform">
                Join
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-[0.2em] text-gray-600">
          <p>&copy; {new Date().getFullYear()} Dynamic Ticks. Swiss Heritage. Global Spirit.</p>
          <div className="flex gap-8 mt-6 md:mt-0">
            <Link to="/policy#privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/policy#terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/policy" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
