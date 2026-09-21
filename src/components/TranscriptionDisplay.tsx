import React from 'react';
import { FileText, Copy, Check } from 'lucide-react';

interface TranscriptionDisplayProps {
  transcription: string;
  isTranscribing: boolean;
}

export const TranscriptionDisplay: React.FC<TranscriptionDisplayProps> = ({
  transcription,
  isTranscribing,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-800">Transcription</h3>
        </div>
        
        {transcription && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative">
        <div className={`min-h-[120px] p-4 rounded-lg border transition-all ${
          isTranscribing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
        }`}>
          {isTranscribing && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-xs">Live</span>
              </div>
            </div>
          )}
          
          {transcription ? (
            <div className="text-gray-800 leading-relaxed">
              {transcription}
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Start recording to see transcription here...
            </div>
          )}
        </div>
      </div>

      {transcription && (
        <div className="mt-4 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="font-medium text-yellow-800 mb-1">Next Steps:</p>
          <p>Review the transcription and click "Generate Invoice" to create your GST-compliant invoice.</p>
        </div>
      )}
    </div>
  );
};