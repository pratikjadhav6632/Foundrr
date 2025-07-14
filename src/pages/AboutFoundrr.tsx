import React, { useState } from 'react';
import './Profile.css'; // Reuse some styles for rounded images


const aboutFoundrr = `🔹 About Foundrr\n\nFoundrr is India’s first platform designed to help entrepreneurs find the right co-founder — not just someone with skills, but someone who shares the same vision, mindset, and drive to build.\n\nWe started Foundrr because we know the reality: building a startup alone is tough. Many great ideas never take off simply because founders couldn’t find the right person to build with. That’s where we come in.\n\nFoundrr lets you create a profile based on your strengths, goals, and what you're building. Whether you're a developer, marketer, product thinker, or hustler — you can match with others who complement your skillset and share your ambition. It’s not just about swiping through profiles; it’s about meaningful discovery, smart filters, and real connections.\n\nOur mission is to make sure no founder builds alone. We’re building a space where India’s next generation of makers, dreamers, and doers come together to start up — faster and stronger.\n\nBecause at the core of every successful startup… is the right team.\nAnd every founder deserves to find theirs.\n\nBuild bold. Build with Foundrr.`;



const AboutFoundrr: React.FC = () => {
  const [active, setActive] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-8 px-2">
      <h1 className="text-4xl font-bold mb-6 text-purple-700">About Foundrr</h1>
      <div className="max-w-2xl bg-white rounded-2xl shadow-lg p-6 mb-10">
        {aboutFoundrr.split('\n').map((line, idx) => (
          <p key={idx} className="mb-2 text-gray-700 text-lg leading-relaxed">{line}</p>
        ))}
      </div>
    
    </div>
  );
};

export default AboutFoundrr; 