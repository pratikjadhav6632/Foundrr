import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 py-8 px-2">
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-purple-700 mb-4 text-center">Privacy & Policy</h1>
      <p className="text-gray-600 mb-6 text-center">
        This is a placeholder for your Privacy and Policy content. Please update this section with your actual privacy practices, data handling, and user rights information.
      </p>
      <div className="text-gray-700 text-sm space-y-4 text-justify">
        <p><strong>Information Collection:</strong> Describe what information you collect from users and how it is used.</p>
        <p><strong>Data Security:</strong> Explain how you protect user data and privacy.</p>
        <p><strong>User Rights:</strong> Inform users about their rights regarding their data.</p>
        <p><strong>Contact:</strong> Provide a way for users to contact you regarding privacy concerns.</p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy; 