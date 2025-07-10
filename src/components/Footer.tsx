import React from 'react';
import FoundrrIcon from '../asset/Foundrr-icon.png';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white border-t border-blue-100/30 pt-10 pb-6 px-8 mt-auto shadow-inner">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Branding */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3 mb-2">
            <img src={FoundrrIcon} alt="Foundrr Logo" className="h-10 w-10 rounded-full shadow" />
            <span className="font-bold text-xl tracking-wide">Foundrr.co</span>
          </div>
          <p className="text-sm opacity-90">Connect with co-founders, build your dream startup team, and grow in India’s startup ecosystem.</p>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm ">
            <li><Link to="/" className="hover:underline hover:text-blue-200 transition-colors">Home</Link></li>
            <li><Link to="/match" className="hover:underline hover:text-blue-200 transition-colors">Match</Link></li>
            <li><Link to="/forum" className="hover:underline hover:text-blue-200 transition-colors">Community</Link></li>
            
          </ul>
        </div>
        {/* About & Legal */}
        <div>
          <h3 className="font-semibold text-lg mb-3">About</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:underline hover:text-blue-200 transition-colors">About Foundrr</Link></li>
            <li><Link to="/privacy-policy" className="hover:underline hover:text-blue-200 transition-colors">Privacy Policy</Link></li>
            <li><a href="#terms" className="hover:underline hover:text-blue-200 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="mailto:support@foundrr.co" className="hover:underline hover:text-blue-200 transition-colors">support@foundrr.co</a>
            </li>
            {/* Social icons stylish */}
            <li className="flex space-x-4 mt-2">
              <a href="#" aria-label="LinkedIn" className="bg-white/10 hover:bg-blue-500 transition-colors rounded-full p-2 shadow-md flex items-center justify-center">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.89v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="bg-white/10 hover:bg-blue-400 transition-colors rounded-full p-2 shadow-md flex items-center justify-center">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.713-2.164-10.141-5.144a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.012 10.012 0 0 0 2.457-2.548z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="bg-white/10 hover:bg-pink-500 transition-colors rounded-full p-2 shadow-md flex items-center justify-center">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.242-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.567 5.783 2.295 7.15 2.233 8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.771.131 4.659.425 3.678 1.406c-.98.98-1.274 2.092-1.334 3.374C2.013 5.668 2 6.077 2 12c0 5.923.013 6.332.072 7.612.06 1.282.354 2.394 1.334 3.374.98.98 2.092 1.274 3.374 1.334C8.332 23.987 8.741 24 12 24s3.668-.013 4.948-.072c1.282-.06 2.394-.354 3.374-1.334.98-.98 1.274-2.092 1.334-3.374.059-1.28.072-1.689.072-7.612 0-5.923-.013-6.332-.072-7.612-.06-1.282-.354-2.394-1.334-3.374-.98-.98-2.092-1.274-3.374-1.334C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 border-t border-blue-100/30 pt-4 text-center text-xs text-blue-100/80">
        © {new Date().getFullYear()} Foundrr. All rights reserved.
      </div>
    </footer>
  );
}; 