import React, { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { getRequiredDocs } from '@/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Card, InfoBox } from '@/components/common';
import DocumentUpload from '@/components/financial/DocumentUpload';
import SignatureCanvas from '@/components/financial/SignatureCanvas';
import toast from 'react-hot-toast';

interface Step7Props { onNext: () => void; }

const Step7Documents: React.FC<Step7Props> = ({ onNext }) => {
  const { documents, updateDocuments, loan, employment } = useAppStore();
  const { files, addFiles, removeFile } = useFileUpload(documents.files);

  const requiredDocs = getRequiredDocs(loan.type, employment.type);

  // Fixed: use useCallback + explicit sync instead of useEffect to avoid infinite loop
  const handleAddFiles = useCallback(async (newFiles: File[]) => {
    await addFiles(newFiles);
    // Files updated in hook state; sync on next render via handleNext
  }, [addFiles]);

  const handleNext = () => {
    if (files.length === 0) {
      toast.error('Please upload at least one document');
      return;
    }
    if (!documents.signature) {
      toast.error('Please capture your e-signature before continuing');
      return;
    }
    // Sync files to store right before advancing
    updateDocuments({ files });
    onNext();
  };

  const handleSig = useCallback((sig: string | null) => {
    updateDocuments({ signature: sig });
  }, [updateDocuments]);

  return (
    // Fixed: wraps in a proper form with id="step-form" so ApplyPage triggerStepForm works
    <form
      id="step-form"
      onSubmit={(e) => { e.preventDefault(); handleNext(); }}
      noValidate
    >
      <Card title="Document Upload" subtitle="Upload required documents · PDF, PNG, JPG · Max 5MB each" icon="📎">
        <InfoBox type="info" icon="📋">
          <strong>Required for your application:</strong>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {requiredDocs.map((doc) => (
              <span
                key={doc}
                className="bg-[#EEF2FF] text-[#3730A3] px-2.5 py-1 rounded-full text-[11px] font-medium"
              >
                {doc}
              </span>
            ))}
          </div>
        </InfoBox>

        <DocumentUpload
          files={files}
          onAdd={handleAddFiles}
          onRemove={removeFile}
        />
      </Card>

      <Card title="E-Signature" subtitle="Your digital signature serves as your official authorization" icon="✍">
        <SignatureCanvas
          onSave={handleSig}
          label="Draw your signature — it will be digitally attached to the application"
          height={150}
        />
        <p className="text-[12px] text-gray-500 mt-3 leading-relaxed">
          By signing, I declare that all information provided is accurate and complete.
          I authorize SkyVault Lending to perform KYC, credit bureau checks, and
          document verification as per RBI guidelines.
        </p>
      </Card>
    </form>
  );
};

export default Step7Documents;
