import React from 'react';

export const OngcMrplLogo = ({ size = "normal" }) => {
  const isLarge = size === "large";

  return (
    <div className="flex items-center gap-3">
      {/* ONGC MRPL Official Green Badge Logo */}
      <div
        className={`bg-[#1e7a3e] text-white rounded-lg flex flex-col items-center justify-center font-bold tracking-tight shadow-md border border-emerald-500/30 ${
          isLarge ? 'w-14 h-14 p-1.5' : 'w-10 h-10 p-1'
        }`}
      >
        {/* ONGC Iconic Emblem Graphic SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white fill-current"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flame / Derrick Ring */}
          <circle cx="50" cy="45" r="28" fill="none" stroke="currentColor" strokeWidth="8" />
          <path d="M 50 15 L 50 65 M 35 65 L 65 65 M 35 45 L 65 45 M 40 30 L 60 30" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
          <path d="M 20 78 L 80 78" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
        <div className="text-[7px] font-black tracking-tighter leading-none mt-0.5 uppercase text-center font-mono">
          ONGC MRPL
        </div>
      </div>
    </div>
  );
};

export default OngcMrplLogo;
