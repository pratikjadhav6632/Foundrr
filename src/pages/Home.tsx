import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {  Handshake, Users, MessageCircle, Zap, Star, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: < Handshake className="w-8 h-8 text-purple-600 mb-2" />, title: 'Smart Matching', desc: 'Get matched with co-founders based on your skills and vision.', to: '/match'
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-purple-600 mb-2" />, title: 'Real-time Chat', desc: 'Connect instantly with your matches and start building.', to: '/messages'
    },
    {
      icon: <Users className="w-8 h-8 text-purple-600 mb-2" />, title: 'Community Forum', desc: 'Share, learn, and grow with other entrepreneurs.', to: '/forum'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-20 home-hero">
        <div className="container mx-auto text-center">
          <motion.h1 
            className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find Your Perfect
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent block">
              Co-Founder
            </span>
          </motion.h1>
          <motion.p 
            className="text-base sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-lg sm:max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Swipe, Match, Build. The future of entrepreneurship starts with finding the right partner.
          </motion.p>
          {!user && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-purple-600 text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          )}
          {user && (
            <motion.div
              className="flex flex-col items-center justify-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="text-lg font-semibold text-purple-700 mb-4">Welcome back! What would you like to do?</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 w-full max-w-3xl">
                {features.map((f, i) => (
                  <div
                    key={f.title}
                    className="bg-white/70 p-6 rounded-xl shadow flex flex-col items-center cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-purple-300"
                    onClick={() => navigate(f.to)}
                  >
                    {f.icon}
                    <div className="font-bold mb-1">{f.title}</div>
                    <div className="text-gray-600 text-sm text-center">{f.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white/50">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">Why Choose Foundrr?</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md sm:max-w-2xl mx-auto">
              We've revolutionized how founders connect, making it as easy as swiping right.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: < Handshake className="w-8 h-8" />,
                title: "Smart Matching",
                description: "Our algorithm matches you with co-founders based on skills, experience, and vision alignment."
              },
              {
                icon: <MessageCircle className="w-8 h-8" />,
                title: "Real-time Chat",
                description: "Connect instantly with matched co-founders and start building your future together."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Forum",
                description: "Share unfiltered thoughts, get advice, and learn from other entrepreneurs."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-purple-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Reviews Carousel Section */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">What Our Users Say</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-md sm:max-w-2xl mx-auto">
              Real stories from founders who found their perfect match.
            </p>
          </div>
          <UserReviewsCarousel />
        </div>
      </section>

      {/* Stats Section
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            {[
              { number: "10K+", label: "Active Founders" },
              { number: "500+", label: "Successful Matches" },
              { number: "100+", label: "Startups Launched" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="p-4 sm:p-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-2 sm:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4 sm:mb-6">Ready to Find Your Co-Founder?</h2>
            <p className="text-purple-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-md sm:max-w-2xl mx-auto">
              Join thousands of entrepreneurs who've found their perfect business partner on CoFounderMatch.
            </p>
            {user&&(
            <Link 
              to="/match" 
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              Start Matching Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            )}
             {!user&&(
            <Link 
              to="/login" 
              className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2"
            >
              Start  Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const reviews = [
  {
    username: 'Namita K',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    company: 'TechNova',
    review: 'Foundrr helped me find the perfect technical co-founder. We launched our startup in just 3 months!',
    rating: 5
  },
  {
    username: 'Raj Sharma',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    company: '',
    lookingFor: 'Business Co-founder',
    review: 'I was looking for a business partner and found someone who shares my vision. Highly recommended!',
    rating: 4
  },
  {
    username: 'PriyaS',
    profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
    company: 'EduSpark',
    review: 'The matching algorithm is spot on. We connected, built a team, and got funded!',
    rating: 5
  },
  {
    username: 'MikeD',
    profileImage: 'https://randomuser.me/api/portraits/men/85.jpg',
    company: '',
    lookingFor: 'Technical Co-founder',
    review: 'Great platform for serious founders. The community is supportive and active.',
    rating: 4
  }
];

function UserReviewsCarousel() {
  const [index, setIndex] = React.useState(0);
  const review = reviews[index];

  const handlePrev = () => setIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));

  return (
    <div className="max-w-xl mx-auto relative">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handlePrev} aria-label="Previous" className="p-2 rounded-full hover:bg-purple-100 transition">
          <ArrowLeft className="w-6 h-6 text-purple-600" />
        </button>
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-2">
            {reviews.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === index ? 'bg-purple-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <button onClick={handleNext} aria-label="Next" className="p-2 rounded-full hover:bg-purple-100 transition">
          <ArrowRight className="w-6 h-6 text-purple-600" />
        </button>
      </div>
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center"
      >
        <img
          src={review.profileImage}
          alt={review.username}
          className="w-20 h-20 rounded-full object-cover mb-4 border-4 border-purple-100"
        />
        <div className="text-lg font-semibold mb-1">{review.username}</div>
        <div className="text-purple-600 mb-2 text-sm font-medium">
          {review.company ? review.company : `Looking for: ${review.lookingFor}`}
        </div>
        <div className="text-gray-700 mb-4 text-center">"{review.review}"</div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill={i < review.rating ? '#facc15' : 'none'} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}