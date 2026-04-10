import React from 'react';
import { Container } from '@/components/common/Container';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Get in Touch</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em] mb-8">Client Care</h1>
          <div className="w-20 h-1 bg-black mx-auto mb-10" />
          <p className="text-gray-600 font-light leading-loose text-sm tracking-wide">
             We are here to assist you with any inquiries regarding our collections, your orders, or our services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
            <div className="flex flex-col items-center text-center p-8 bg-[var(--bg-soft)] rounded-lg hover:shadow-lg transition-shadow duration-300">
              <Mail className="w-6 h-6 mb-4 text-[var(--accent)]" />
              <h3 className="font-bold mb-2 uppercase tracking-wide text-sm">Email</h3>
              <p className="text-sm text-gray-500 font-light">support@dynamicticks.com</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-[var(--bg-soft)] rounded-lg hover:shadow-lg transition-shadow duration-300">
              <Phone className="w-6 h-6 mb-4 text-[var(--accent)]" />
              <h3 className="font-bold mb-2 uppercase tracking-wide text-sm">Phone</h3>
              <p className="text-sm text-gray-500 font-light">+1 (800) 123-4567</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-[var(--bg-soft)] rounded-lg hover:shadow-lg transition-shadow duration-300">
              <MapPin className="w-6 h-6 mb-4 text-[var(--accent)]" />
              <h3 className="font-bold mb-2 uppercase tracking-wide text-sm">Boutique</h3>
              <p className="text-sm text-gray-500 font-light">123 Horology Ave, Geneva</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Contact;
