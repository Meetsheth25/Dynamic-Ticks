import React from 'react';
import { Container } from '@/components/common/Container';

const Policy = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        <div className="max-w-3xl mx-auto mb-16">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block text-center">Legal info</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em] mb-8 text-center">Policies & Services</h1>
          <div className="w-20 h-1 bg-black mx-auto mb-16" />
          
          <div className="prose max-w-none text-gray-600 font-light leading-loose text-sm tracking-wide space-y-12">
            
            <section id="privacy">
              <h2 className="text-xl font-bold text-black uppercase tracking-widest mb-4 border-b pb-2">Privacy Policy</h2>
              <p>
                Your privacy is important to us. We securely store and process your data to provide you with the best possible experience when interacting with Dynamic Ticks. We do not sell your personal data to third parties.
              </p>
            </section>

            <section id="terms">
              <h2 className="text-xl font-bold text-black uppercase tracking-widest mb-4 border-b pb-2">Terms of Service</h2>
              <p>
                By using our website and services, you agree to our Terms of Service. All content, designs, and branding remain the property of Dynamic Ticks. Unauthorized use of our materials is strictly prohibited.
              </p>
            </section>

            <section id="shipping">
               <h2 className="text-xl font-bold text-black uppercase tracking-widest mb-4 border-b pb-2">Shipping & Delivery</h2>
               <p>
                 We offer global fully insured shipping on all orders. Deliveries typically take 3-7 business days depending on your location. A signature is required upon delivery to ensure your luxury timepiece reaches you safely.
               </p>
            </section>
            
            <section id="returns">
               <h2 className="text-xl font-bold text-black uppercase tracking-widest mb-4 border-b pb-2">Returns & Warranty</h2>
               <p>
                 Returns are accepted within 30 days of purchase, provided the timepiece is unworn and all protective seals remain intact. All Dynamic Ticks watches come with a 5-year international warranty covering manufacturing defects.
               </p>
            </section>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default Policy;
