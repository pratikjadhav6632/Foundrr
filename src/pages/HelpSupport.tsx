import React from 'react';

const HelpSupport: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 py-8 px-2">
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Help & Support</h1>
      
      <div className="text-gray-700 text-sm space-y-4 text-justify">
        <div className="mb-4">
          <strong>FAQs:</strong>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <span className="font-semibold">Q: What is Foundrr?</span><br/>
              <span className="ml-2">A: Foundrr is a platform designed to help entrepreneurs and startups find co-founders, connect, and collaborate.</span>
            </li>
            <li>
              <span className="font-semibold">Q: How do I reset my password?</span><br/>
              <span className="ml-2">A: Click on the 'Forgot Password' link on the login page and follow the instructions to reset your password.</span>
            </li>
            <li>
              <span className="font-semibold">Q: How can I contact support?</span><br/>
              <span className="ml-2">A: You can email us at <a href="mailto:support@foundrr.co" className="text-blue-600 underline">support@foundrr.co</a> for any assistance.</span>
            </li>
            <li>
              <span className="font-semibold">Q: Is my data secure on Foundrr?</span><br/>
              <span className="ml-2">A: Yes, we take data security seriously and use industry-standard practices to protect your information.</span>
            </li>
          </ul>
        </div>
        <p><strong>Contact Support:</strong><a href="tomail:support@foundrr.co">support@foundrr.co</a></p>
      </div>
    </div>
  </div>
);

export default HelpSupport; 