import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { profileService } from '../services/profileService';

export const ProfileSetup: React.FC = () => {
  const { user, updateProfile, profile, setProfile } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    name: user?.name || '',
    age: '',
    experience: '',
    interestedField: '',
    bio: '',
    skills: [] as string[],
    lookingFor: '',
    isFounder: false,
    companyName: '',
    location: '',
    qualification: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      toast.error('Valid age is required');
      return;
    }
    if (!formData.experience) {
      toast.error('Experience is required');
      return;
    }
    if (!formData.interestedField) {
      toast.error('Interested field is required');
      return;
    }
    if (!formData.bio.trim()) {
      toast.error('Bio is required');
      return;
    }
    if (!formData.skills.length) {
      toast.error('Please add at least one skill');
      return;
    }
    if (!formData.lookingFor.trim()) {
      toast.error('Looking For is required');
      return;
    }
    setLoading(true);
    try {
      if (!user) throw new Error('User not found');
      const newProfile = await profileService.createProfile({
        userId: user.$id,
        username: formData.username,
        name: formData.name,
        age: parseInt(formData.age),
        experience: formData.experience,
        interestedField: formData.interestedField,
        bio: formData.bio,
        skills: formData.skills,
        lookingFor: formData.lookingFor,
        isFounder: formData.isFounder,
        companyName: formData.companyName || '',
        location: formData.location || '',
        qualification: formData.qualification || '',
        profileImage: undefined,
      });
      setProfile && setProfile(newProfile);
      toast.success('Profile setup complete!');
      navigate('/match');
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.target === document.activeElement) {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-8 sm:py-12">
      <motion.div 
        className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Complete Your Profile</h1>
          <p className="text-gray-600 text-sm sm:text-base">Tell us about yourself to find the perfect co-founder</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Enter your age"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Experience Level
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                required
              >
                <option value="">Select experience</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="Enter your location (e.g., San Francisco, CA)"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Interested Field
            </label>
            <select
              value={formData.interestedField}
              onChange={(e) => setFormData(prev => ({ ...prev, interestedField: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              required
            >
              <option value="">Select field</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Education">Education</option>
              <option value="SaaS">SaaS</option>
              <option value="Mobile Apps">Mobile Apps</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="Tell us about yourself and your entrepreneurial journey..."
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-3">
              {formData.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs sm:text-sm flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
                placeholder="Add a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-xs sm:text-base"
              >
                Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Looking For
            </label>
            <input
              type="text"
              value={formData.lookingFor}
              onChange={(e) => setFormData(prev => ({ ...prev, lookingFor: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="e.g., Technical Co-founder, Business Co-founder"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Qualification
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="Your highest qualification"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFounder}
              onChange={e => setFormData(prev => ({ ...prev, isFounder: e.target.checked }))}
              className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-xs sm:text-sm text-gray-700">I am a founder</span>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Company Name (if any)
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-xs sm:text-base"
              placeholder="Enter your company name"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};