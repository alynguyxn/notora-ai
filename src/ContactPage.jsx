import React from 'react';

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full mt-40 px-6 text-center">
      <h1 className="text-6xl font-bold mb-2 text-soft-black tracking-tight flex items-center">
        Contact
      </h1>
      <p className="text-xl text-soft-black font-medium opacity-70">
        Have questions or feedback? Please feel free to reach out!
      </p>
      <a href="mailto:hello@notora.ai" className="mt-8 text-accent-pop font-bold text-lg hover:underline">
        lyssbliss610@gmail.com
      </a>
    </div>
  );
}