import React, { useState } from 'react';

const Feedback: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    try {
      // Placeholder: send feedback to backend API
      const res = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 py-8 px-2">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 sm:p-12 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-purple-700 mb-2 text-center">We Value Your Feedback!</h1>
        <p className="text-gray-600 mb-6 text-center">Let us know your thoughts, suggestions, or issues. Your feedback helps us improve Foundrr.</p>
        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="Your Name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Feedback</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              placeholder="Share your thoughts..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-60"
          >
            {loading ? 'Sending...' : 'Send Feedback'}
          </button>
        </form>
        {status === 'success' && (
          <div className="mt-4 text-green-600 font-semibold">Thank you for your feedback!</div>
        )}
        {status === 'error' && (
          <div className="mt-4 text-red-600 font-semibold">Failed to send feedback. Please try again later.</div>
        )}
      </div>
    </div>
  );
};

export default Feedback; 