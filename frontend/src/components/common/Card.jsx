import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        clsx(
          "bg-white border border-gray-50 shadow-premium transition-all duration-700",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
