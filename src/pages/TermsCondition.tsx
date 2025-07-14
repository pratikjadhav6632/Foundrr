import React from 'react';

const termsContent = `
Terms & Conditions:
Effective Date:
Last Updated:
________________________________________
Introduction
Welcome to Foundrr, a digital platform created for aspiring entrepreneurs, startup founders, and professionals looking to find their perfect co-founder or collaborator. These Terms and Conditions govern your use of the Foundrr website, mobile application, and related services (collectively referred to as the "Platform"). By accessing or using Foundrr, you agree to be bound by these Terms and Conditions. If you do not accept or agree to any of these terms, you must immediately discontinue use of the Platform.
Foundrr is not just a platform; it is a community — and like any community, it functions best when there is a mutual understanding of expectations, responsibilities, and respect. This document outlines the expectations we have from you and what you can expect from us.
________________________________________
Eligibility and Account Creation
To use Foundrr, you must be at least 16 years old. When creating an account, you agree to provide accurate, current, and complete information. You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
You also agree not to impersonate anyone or misrepresent any affiliation with another person, entity, or organization. Foundrr reserves the right to suspend or terminate any account that is found to be using false information or engaging in behavior that violates these terms.
________________________________________
Use of the Platform
The Foundrr platform is designed solely for professional networking and team-building purposes. You agree to use the platform only for lawful purposes and in a way that does not violate the rights of others or restrict their use and enjoyment of the platform.
You may not use the platform:
• To distribute spam or unsolicited promotional content.
• To harass, bully, or intimidate other users.
• To upload or share inappropriate, offensive, or unlawful content.
• To infringe upon the intellectual property rights of others.
• To engage in unauthorized data collection, scraping, or data mining.
• To attempt unauthorized access to the platform’s systems or interfere with its functionality.
Failure to comply with these conditions may lead to immediate termination of your account.
________________________________________
User-Generated Content
You are solely responsible for the content you upload, post, or share through the platform — including your profile information, biography, messages, and interactions. By uploading or posting content, you grant Foundrr a non-exclusive, royalty-free, worldwide license to use, store, display, and reproduce your content solely for the purpose of operating, promoting, and improving our services.
You must ensure that your content does not:
• Violate the privacy or data protection rights of others.
• Include defamatory or misleading statements.
• Contain obscene, abusive, or hateful material.
We reserve the right to remove or disable access to any content that we, at our sole discretion, consider to be in violation of these Terms or harmful to the community.
________________________________________
Platform Availability and Modifications
Foundrr strives to maintain uninterrupted access to the platform but does not guarantee that the platform will always be available, error-free, or secure. We reserve the right to suspend, withdraw, or modify any part of the service without notice, including for maintenance, upgrades, or business reasons.
We may update or change features, functionality, or content at any time. These changes may affect how you use the platform, but continued use signifies your acceptance of those changes.
________________________________________
Intellectual Property
All intellectual property rights in the Foundrr name, logo, software, design, and all content made available on the platform (except user-generated content) are the property of Foundrr or its licensors. You may not copy, reproduce, distribute, modify, or create derivative works based on any part of the platform without our prior written consent.
Your use of Foundrr does not grant you any rights to use our trademarks, trade dress, or other brand elements without explicit permission.
________________________________________
Third-Party Content and Links
Foundrr may contain links to third-party websites, services, or content that are not owned or controlled by Foundrr. We are not responsible for the content, privacy practices, or policies of such third-party platforms. Your interactions with these third-party services are governed solely by their terms and policies.
You acknowledge that Foundrr is not liable for any damage or loss caused by or in connection with your use of any third-party service.
________________________________________
Limitation of Liability
To the fullest extent permitted by applicable law, Foundrr, its founders, employees, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform. This includes, but is not limited to, damages for loss of profits, data, business opportunities, or reputation.
Our total liability for any claim arising out of these Terms or related to the platform shall not exceed the amount you paid us, if any, for the services in the twelve (12) months preceding the event giving rise to the claim.
________________________________________
Indemnification
You agree to indemnify, defend, and hold harmless Foundrr and its team from and against any claims, liabilities, damages, losses, and expenses arising out of or in any way connected with your use of the platform, your violation of these Terms, or your infringement of any third-party rights.
________________________________________
Termination
Foundrr reserves the right to suspend or terminate your account and access to the platform at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
Upon termination, your right to use the platform will cease immediately, and we may deactivate or delete your account and all associated information.
________________________________________
Governing Law and Dispute Resolution
These Terms and any disputes arising out of or in connection with them shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in Amravati MH, India.
We encourage you to contact us first to seek informal resolution before pursuing legal remedies.
________________________________________
Changes to These Terms
We may revise these Terms and Conditions from time to time. The updated version will be posted on our platform with a new effective date. Continued use of Foundrr following any changes indicates your acceptance of the revised Terms.
________________________________________
Contact Us
If you have any questions or concerns regarding these Terms, you may contact us at:
Email: support@foundrr.co
________________________________________
End of Terms & Conditions
`;

const TermsCondition: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 py-8 px-2">
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-purple-700 mb-4 text-center">Terms & Conditions</h1>
      <div className="text-gray-700 text-xs sm:text-xs space-y-4 text-justify overflow-y-auto max-h-[70vh] w-full whitespace-pre-line" style={{ fontFamily: 'inherit' }}>
        {termsContent}
      </div>
    </div>
  </div>
);

export default TermsCondition; 