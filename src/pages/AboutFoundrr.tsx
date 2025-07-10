import React, { useState } from 'react';
import './Profile.css'; // Reuse some styles for rounded images

const founder = {
  name: 'Founder',
  img: 'https://randomuser.me/api/portraits/men/32.jpg',
  about: `A founder is the visionary who initiates the startup journey, bringing ideas to life and setting the direction for the team. Founders are driven, resilient, and passionate about solving real-world problems. They inspire others to join their mission and build something impactful from the ground up.`
};

const cofounder = {
  name: 'Co-founder',
  img: 'https://randomuser.me/api/portraits/women/44.jpg',
  about: `A co-founder is the crucial partner who complements the founder’s strengths, shares the same vision, and brings unique skills to the table. Together, founders and co-founders form the backbone of any successful startup, supporting each other through challenges and celebrating every win as a team.`
};

const aboutFoundrr = `🔹 About Foundrr\n\nFoundrr is India’s first platform designed to help entrepreneurs find the right co-founder — not just someone with skills, but someone who shares the same vision, mindset, and drive to build.\n\nWe started Foundrr because we know the reality: building a startup alone is tough. Many great ideas never take off simply because founders couldn’t find the right person to build with. That’s where we come in.\n\nFoundrr lets you create a profile based on your strengths, goals, and what you're building. Whether you're a developer, marketer, product thinker, or hustler — you can match with others who complement your skillset and share your ambition. It’s not just about swiping through profiles; it’s about meaningful discovery, smart filters, and real connections.\n\nOur mission is to make sure no founder builds alone. We’re building a space where India’s next generation of makers, dreamers, and doers come together to start up — faster and stronger.\n\nBecause at the core of every successful startup… is the right team.\nAnd every founder deserves to find theirs.\n\nBuild bold. Build with Foundrr.`;

const cards = [founder, cofounder];

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
      <div className="w-full max-w-xl flex flex-col items-center">
        <div className="flex justify-center mb-4">
          <button
            className={`mx-2 px-4 py-2 rounded-full font-semibold ${active === 0 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActive(0)}
          >
            Founder
          </button>
          <button
            className={`mx-2 px-4 py-2 rounded-full font-semibold ${active === 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActive(1)}
          >
            Co-founder
          </button>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center transition-all duration-300 w-full">
          <img
            src={cards[active].img}
            alt={cards[active].name}
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-300 mb-4 shadow-md"
          />
          <h2 className="text-2xl font-bold text-purple-700 mb-2">{cards[active].name}</h2>
          <p className="text-gray-700 text-center text-lg">{cards[active].about}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutFoundrr; 