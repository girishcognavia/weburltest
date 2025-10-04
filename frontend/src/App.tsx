import { useState } from 'react';
import Landing from './pages/Landing';
import ChatbotBuilder from './pages/ChatbotBuilder';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'builder'>('landing');
  const [websiteUrl, setWebsiteUrl] = useState('');

  const handleStartBuild = (url: string) => {
    setWebsiteUrl(url);
    setCurrentPage('builder');
  };

  const handleBackToHome = () => {
    setCurrentPage('landing');
    setWebsiteUrl('');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <Landing onStartBuild={handleStartBuild} />
      )}
      {currentPage === 'builder' && (
        <ChatbotBuilder websiteUrl={websiteUrl} onBack={handleBackToHome} />
      )}
    </>
  );
}

export default App;
