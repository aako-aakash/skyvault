import React from 'react';
import { Modal } from '@/components/common';
import Button from '@/components/common/Button';
import { useAppStore } from '@/store/useAppStore';
import { loadDraft, clearDraft, formatINR } from '@/utils';

interface ResumeModalProps {
  show: boolean;
  onResume: () => void;
  onFresh: () => void;
}

const ResumeModal: React.FC<ResumeModalProps> = ({ show, onResume, onFresh }) => {
  const draft = loadDraft<Record<string, any>>();
  const savedAt = draft?._ts
    ? new Date(draft._ts).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
      })
    : 'earlier';

  return (
    <Modal show={show} title="Resume Your Application?" size="md">
      <div className="text-center mb-4">
        <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
          📋
        </div>
      </div>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-5">
        We found a saved draft from <strong className="text-gray-800">{savedAt}</strong>.
        {draft?.loan?.type && (
          <>
            {' '}Loan: <strong className="text-gray-800">
              {draft.loan.type.charAt(0).toUpperCase() + draft.loan.type.slice(1)} Loan
            </strong>
            {draft.loan.amount && ` · ${formatINR(draft.loan.amount)}`}
          </>
        )}
        <br /><br />
        Would you like to continue from where you left off?
      </p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" size="md" onClick={onFresh}>
          Start Fresh
        </Button>
        <Button variant="primary" size="md" onClick={onResume}>
          Resume Draft →
        </Button>
      </div>
    </Modal>
  );
};

export default ResumeModal;
