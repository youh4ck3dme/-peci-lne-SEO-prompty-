
import React from 'react';

const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true">
      <div className="orb absolute w-52 h-52 bg-white/10 rounded-full filter blur-2xl top-1/4 left-[10%]"></div>
      <div className="orb absolute w-40 h-40 bg-white/10 rounded-full filter blur-2xl top-3/5 right-[15%]"></div>
      <div className="orb absolute w-24 h-24 bg-white/10 rounded-full filter blur-2xl top-[78%] left-[60%]"></div>
    </div>
  );
};

export default BackgroundOrbs;
