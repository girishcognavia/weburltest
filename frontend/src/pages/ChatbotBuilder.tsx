import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_PROXY_API_URL || 'https://shaky-rats-tickle.loca.lt';

type Step = 'processing' | 'preview' | 'customize' | 'deploy';

interface ChatbotBuilderProps {
  websiteUrl: string;
  onBack: () => void;
}

export default function ChatbotBuilder({ websiteUrl, onBack }: ChatbotBuilderProps) {

  const [step, setStep] = useState<Step>('processing');
  const [, setChatbotId] = useState('');
  const [embedCode, setEmbedCode] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [, setProcessing] = useState(true);

  useEffect(() => {
    if (websiteUrl) {
      processChatbot();
    }
  }, [websiteUrl]);

  const processChatbot = async () => {
    try {
      setProcessing(true);

      // Generate unique chatbot ID
      const botId = `bot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setChatbotId(botId);

      // Fetch and process website content
      await axios.get(`${API_URL}/api/proxy`, {
        params: { url: websiteUrl, client_id: botId }
      });

      // Generate embed code
      const code = generateEmbedCode(botId, websiteUrl);
      setEmbedCode(code);

      // Set preview URL
      setPreviewUrl(`${API_URL}/api/proxy?url=${encodeURIComponent(websiteUrl)}&client_id=${botId}`);

      // Move to preview step
      setTimeout(() => {
        setProcessing(false);
        setStep('preview');
      }, 2000);
    } catch (error) {
      console.error('Error processing chatbot:', error);
      setProcessing(false);
    }
  };

  const generateEmbedCode = (botId: string, url: string) => {
    return `<!-- CognaBot Widget -->
<script>
(function() {
  var script = document.createElement('script');
  script.src = '${API_URL}/widget.js';
  script.setAttribute('data-chatbot-id', '${botId}');
  script.setAttribute('data-website-url', '${url}');
  script.async = true;
  document.head.appendChild(script);
})();
</script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(embedCode);
    alert('Embed code copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              CognaBot
            </h1>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Website:</span> {websiteUrl}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'processing' ? 'text-purple-600' : step === 'preview' || step === 'customize' || step === 'deploy' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'processing' ? 'bg-purple-100' : step === 'preview' || step === 'customize' || step === 'deploy' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step === 'preview' || step === 'customize' || step === 'deploy' ? '✓' : '1'}
              </div>
              <span className="font-medium">Processing</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${step === 'preview' ? 'text-purple-600' : step === 'customize' || step === 'deploy' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'preview' ? 'bg-purple-100' : step === 'customize' || step === 'deploy' ? 'bg-green-100' : 'bg-gray-100'}`}>
                {step === 'customize' || step === 'deploy' ? '✓' : '2'}
              </div>
              <span className="font-medium">Preview</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-200"></div>
            <div className={`flex items-center gap-2 ${step === 'deploy' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'deploy' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                3
              </div>
              <span className="font-medium">Get Code</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {step === 'processing' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-6"></div>
            <h2 className="text-2xl font-bold mb-2">Processing your website...</h2>
            <p className="text-gray-600">Extracting content and building knowledge base</p>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Preview Your Chatbot</h2>
              <p className="text-gray-600">See how the chatbot looks on your website</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="Chatbot Preview"
              />
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setStep('deploy')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Looks Good! Get Embed Code →
              </button>
            </div>
          </div>
        )}

        {step === 'deploy' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Add to Your Website</h2>
              <p className="text-gray-600">Copy and paste this code before the closing &lt;/body&gt; tag</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 mb-6">
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{embedCode}</code>
              </pre>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={copyEmbedCode}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                📋 Copy Embed Code
              </button>
              <button
                onClick={onBack}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Create Another Chatbot
              </button>
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">📚 Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Copy the embed code above</li>
                <li>Open your website's HTML file or CMS</li>
                <li>Paste the code before the closing &lt;/body&gt; tag</li>
                <li>Save and publish your website</li>
                <li>The chatbot will appear on your website automatically!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
