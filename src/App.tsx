import React, { useState, useEffect } from 'react';
import { Mic, FileText, Download, Settings, Zap, WifiOff } from 'lucide-react';
import { VoiceRecorder } from './components/VoiceRecorder';
import { TranscriptionDisplay } from './components/TranscriptionDisplay';
import { InvoicePreview } from './components/InvoicePreview';
import { InvoiceForm } from './components/InvoiceForm';
import { LanguageSelector } from './components/LanguageSelector';
import { Invoice } from './types';
import { InvoiceGenerator } from './utils/invoiceGenerator';
import { OfflineManager } from './utils/offlineManager';

function App() {
  const [currentStep, setCurrentStep] = useState<'record' | 'preview' | 'edit'>('record');
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice>>({});
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Sync offline data when connection is restored
      OfflineManager.syncOfflineData();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleTranscription = (text: string) => {
    setTranscription(prev => prev + ' ' + text);
    setIsTranscribing(true);
    setTimeout(() => setIsTranscribing(false), 1000);
  };

  const generateInvoice = () => {
    if (!transcription.trim()) return;

    const parsedInvoice = InvoiceGenerator.parseVoiceToInvoice(transcription);
    setCurrentInvoice(parsedInvoice);
    setCurrentStep('preview');

    // Save to offline storage
    if (isOffline) {
      OfflineManager.saveOfflineData({
        type: 'invoice',
        invoice: parsedInvoice,
        transcription,
      });
    }
  };

  const handleInvoiceSave = (invoice: Partial<Invoice>) => {
    setCurrentInvoice(invoice);
    setCurrentStep('preview');
  };

  const downloadInvoice = () => {
    if (!currentInvoice.invoiceNumber) return;

    const completeInvoice = currentInvoice as Invoice;
    const htmlContent = InvoiceGenerator.generatePDFContent(completeInvoice);
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${completeInvoice.invoiceNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetApp = () => {
    setCurrentStep('record');
    setTranscription('');
    setCurrentInvoice({});
    setIsTranscribing(false);
  };

  const steps = [
    { key: 'record', label: 'Record Voice', icon: Mic },
    { key: 'preview', label: 'Preview Invoice', icon: FileText },
    { key: 'edit', label: 'Edit Details', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Voice-to-Invoice</h1>
                <p className="text-sm text-gray-600">For Indian MSMEs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {isOffline && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline Mode</span>
                </div>
              )}
              
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isCompleted = 
                (step.key === 'record' && transcription) ||
                (step.key === 'preview' && currentInvoice.invoiceNumber);

              return (
                <React.Fragment key={step.key}>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-orange-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${
                      isCompleted ? 'bg-green-300' : 'bg-gray-300'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <LanguageSelector
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {currentStep === 'record' && (
              <>
                <VoiceRecorder
                  onTranscription={handleTranscription}
                  isOffline={isOffline}
                  language={language}
                />
                
                <TranscriptionDisplay
                  transcription={transcription}
                  isTranscribing={isTranscribing}
                />

                {transcription && (
                  <div className="text-center">
                    <button
                      onClick={generateInvoice}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                    >
                      <FileText className="w-5 h-5" />
                      Generate Invoice
                    </button>
                  </div>
                )}
              </>
            )}

            {currentStep === 'edit' && (
              <InvoiceForm
                invoice={currentInvoice}
                onSave={handleInvoiceSave}
                onCancel={() => setCurrentStep('preview')}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {(currentStep === 'preview' && currentInvoice.invoiceNumber) && (
              <InvoicePreview
                invoice={currentInvoice as Invoice}
                onEdit={() => setCurrentStep('edit')}
                onDownload={downloadInvoice}
              />
            )}

            {currentStep === 'record' && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Use</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Select Language</p>
                      <p className="text-sm text-gray-600">Choose your preferred language for voice input</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Record Your Voice</p>
                      <p className="text-sm text-gray-600">Click start and speak your invoice details clearly</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Generate Invoice</p>
                      <p className="text-sm text-gray-600">Review transcription and create GST-compliant invoice</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Example:</strong> "Customer name is Rajesh Kumar, address 123 MG Road Mumbai, 
                    item laptop computer quantity 2 rate 50000 rupees, GST 18 percent"
                  </p>
                </div>
              </div>
            )}

            {currentStep === 'preview' && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setCurrentStep('edit')}
                    className="w-full text-left p-3 rounded-lg border border-gray-300 hover:border-orange-400 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">Edit Invoice Details</div>
                    <div className="text-sm text-gray-600">Modify customer info, items, or amounts</div>
                  </button>
                  <button
                    onClick={downloadInvoice}
                    className="w-full text-left p-3 rounded-lg border border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Invoice
                    </div>
                    <div className="text-sm text-gray-600">Save as HTML file for printing or sharing</div>
                  </button>
                  <button
                    onClick={resetApp}
                    className="w-full text-left p-3 rounded-lg border border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800">Create New Invoice</div>
                    <div className="text-sm text-gray-600">Start fresh with a new voice recording</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;