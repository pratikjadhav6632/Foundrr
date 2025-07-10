import React from 'react';

const HelpSupport: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-8 px-2">
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Help & Support</h1>
      <p className="text-gray-600 mb-6 text-center">
        This is a placeholder for your Help and Support content. Please update this section with FAQs, contact information, and support resources for your users.
      </p>
      <div className="text-gray-700 text-sm space-y-4 text-justify">
        <p><strong>FAQs:</strong> Add frequently asked questions and answers here.</p>
        <p><strong>Contact Support:</strong> Provide an email or form for users to reach out for help.</p>
        <p><strong>Resources:</strong> Link to guides, tutorials, or community forums.</p>
      </div>
    </div>
  </div>
);

export default HelpSupport; 