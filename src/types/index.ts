export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  hsnCode?: string;
  gstRate: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  gstin?: string;
  phone?: string;
  email?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: CustomerDetails;
  items: InvoiceItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentTerms?: string;
  notes?: string;
  audioFile?: string;
  transcription?: string;
}

export interface VoiceRecording {
  id: string;
  timestamp: string;
  audioBlob: Blob;
  transcription: string;
  isProcessed: boolean;
  isSynced: boolean;
}

export interface AppState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcription: string;
  currentInvoice: Partial<Invoice>;
  language: 'en' | 'hi' | 'ta' | 'te' | 'bn';
  isOffline: boolean;
  recordings: VoiceRecording[];
}