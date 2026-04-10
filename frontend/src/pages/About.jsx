import React from 'react';
import { Container } from '@/components/common/Container';

const About = () => {
  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Our Heritage</span>
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.05em] mb-8">The Maison</h1>
          <div className="w-20 h-1 bg-black mx-auto mb-10" />
          <p className="text-gray-600 font-light leading-loose text-sm tracking-wide mb-8">
            Defining the art of time since our inception. We craft more than just watches; we create legacies that transcend generations. Join our pursuit of horological perfection.
          </p>
          <img 
            src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=1200" 
            alt="Craftsmanship" 
            className="w-full h-[400px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </Container>
    </div>
  );
};

export default About;
