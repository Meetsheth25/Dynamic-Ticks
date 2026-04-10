import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Container = ({ children, className, ...props }) => {
  return (
    <div 
      className={twMerge(
        clsx(
          "max-w-7xl mx-auto px-4 md:px-6 w-full",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
