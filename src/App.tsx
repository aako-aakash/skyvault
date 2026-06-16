import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header      from '@/components/layout/Header';
import Footer      from '@/components/layout/Footer';
import Routes      from '@/routes';
import ResumeModal from '@/pages/ResumeModal';
import { useAppStore }          from '@/store/useAppStore';
import { loadDraft, clearDraft } from '@/utils';

const App: React.FC = () => {
  const { loadDraft: loadFromStore, resetApplication } = useAppStore();
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    // Check for existing draft on mount
    const draft = loadDraft<Record<string, any>>();
    if (draft && (draft.loan?.type || draft.personal?.fullName)) {
      setShowResume(true);
    }
  }, []);

  const handleResume = () => {
    loadFromStore();
    setShowResume(false);
  };

  const handleFresh = () => {
    clearDraft();
    resetApplication();
    setShowResume(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 px-5 py-6" role="main" id="main-content">
        <div className="max-w-[920px] mx-auto">
          <Routes />
        </div>
      </main>

      <Footer />

      {/* Resume Draft Modal */}
      <ResumeModal
        show={showResume}
        onResume={handleResume}
        onFresh={handleFresh}
      />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1F2937',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            maxWidth: '360px',
          },
          success: { iconTheme: { primary: '#27AE60', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#E74C3C', secondary: '#fff' } },
        }}
      />
    </div>
  );
};

export default App;
