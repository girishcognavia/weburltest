import { useState } from 'react';

interface LandingProps {
  onStartBuild: (url: string) => void;
}

export default function Landing({ onStartBuild }: LandingProps) {
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleTryNow = (e: React.FormEvent) => {
    e.preventDefault();
    if (websiteUrl) {
      onStartBuild(websiteUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            CognaBot
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
            Sign In
          </a>
          <a href="#" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
            Get Started
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            AI Chatbot for your site
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            CognaBot AI chatbot instantly learns from your website and uses that knowledge to answer visitor questions — automatically.
          </p>

          {/* CTA Form */}
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleTryNow} className="bg-white rounded-2xl shadow-xl p-8">
              <label className="block text-left text-lg font-semibold mb-4">
                Enter your website:
              </label>
              <div className="flex gap-4">
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://www.yourwebsite.com"
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-lg font-semibold"
                >
                  Try Now!
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                It's free. No credit card required.
              </p>
            </form>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
            <p className="text-gray-600">
              Add one line of code to your website and you're done. No complex integration needed.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Learning</h3>
            <p className="text-gray-600">
              Automatically extracts knowledge from your website content to answer questions accurately.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
            <p className="text-gray-600">
              Your AI assistant works round the clock, answering customer questions instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
