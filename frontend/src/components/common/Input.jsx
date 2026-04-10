import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col mb-8 w-full group">
      {label && (
        <label className="mb-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 group-focus-within:text-black transition-colors">
          {label}
        </label>
      )}
      <input 
        className={twMerge(
          clsx(
            "w-full bg-white border-b border-gray-100 py-3 text-[11px] uppercase font-bold tracking-widest text-black focus:outline-none focus:border-black transition-all placeholder:text-gray-200",
            className
          )
        )}
        {...props}
      />
    </div>
  );
};
