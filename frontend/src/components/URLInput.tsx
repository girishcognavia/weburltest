import { useState } from 'react';

interface URLInputProps {
  onSubmit: (url: string, clientId: string, device: 'desktop' | 'tablet' | 'mobile') => void;
  loading: boolean;
}

export default function URLInput({ onSubmit, loading }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [clientId, setClientId] = useState('demo-client-123');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (!clientId.trim()) {
      setError('Client ID is required');
      return;
    }

    onSubmit(url, clientId, device);
  };

  const exampleUrls = [
    'https://example.com',
    'https://www.wikipedia.org',
    'https://www.github.com',
  ];

  return (
    <div className="card max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Website Preview with Chatbot
      </h1>
      <p className="text-gray-600 mb-6">
        Enter a website URL to see it with your chatbot overlay
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-field"
            disabled={loading}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {exampleUrls.map((exampleUrl) => (
            <button
              key={exampleUrl}
              type="button"
              onClick={() => setUrl(exampleUrl)}
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              disabled={loading}
            >
              Try {exampleUrl}
            </button>
          ))}
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span>
            Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client ID
              </label>
              <input
                type="text"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Preview
              </label>
              <div className="flex gap-2">
                {(['desktop', 'tablet', 'mobile'] as const).map((deviceOption) => (
                  <button
                    key={deviceOption}
                    type="button"
                    onClick={() => setDevice(deviceOption)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      device === deviceOption
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    disabled={loading}
                  >
                    {deviceOption.charAt(0).toUpperCase() + deviceOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading Preview...
              </span>
            ) : (
              'Preview Website'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
