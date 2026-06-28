import React from 'react';

export default function AboutPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-40 px-6 text-center animate-fade-in">
      {/* Title */}
      <h1 className="text-6xl font-bold mb-2 text-soft-black tracking-tight flex items-center">
        About
      </h1>

      {/* Subheading/Content */}
      <div className="max-w-xl">
        <p className="text-xl text-soft-black font-medium opacity-70 leading-relaxed">
          Notora Ai is built to transform the way you study. By turning your 
          complex PDFs into interactive conversations, learning is now
          smarter, faster, and more intuitive.
        </p>
        
        <p className="text-lg text-soft-black opacity-60 mt-6 leading-relaxed">
          Whether you're prepping for finals or diving into research, Notora acts as 
          your personal AI study partner, helping you extract the insights you 
          need in seconds.
        </p>
      </div>
    </div>
  );
}