import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-sans font-bold transition-all duration-500 px-12 py-5 tracking-[0.4em] uppercase text-[9px] disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] outline-none shadow-premium";
  
  const variants = {
    primary: "bg-black text-white hover:bg-[var(--accent)] hover:text-black",
    secondary: "bg-[var(--accent)] text-black hover:bg-black hover:text-white",
    outline: "border border-black bg-transparent text-black hover:bg-black hover:text-white",
    ghost: "bg-transparent text-black hover:bg-gray-50",
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], className))} 
      {...props}
    >
      {children}
    </button>
  );
};
