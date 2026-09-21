import React from 'react';
import { Download, Edit, FileText, IndianRupee } from 'lucide-react';
import { Invoice } from '../types';
import { InvoiceGenerator } from '../utils/invoiceGenerator';

interface InvoicePreviewProps {
  invoice: Invoice;
  onEdit: () => void;
  onDownload: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  onEdit,
  onDownload,
}) => {
  const { subtotal, totalGST, grandTotal } = InvoiceGenerator.calculateInvoiceTotal(invoice.items);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Invoice Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDownload}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Invoice Header */}
        <div className="text-center mb-6 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">TAX INVOICE</h2>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Invoice No: {invoice.invoiceNumber}</span>
            <span>Date: {new Date(invoice.date).toLocaleDateString('en-IN')}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Bill To:</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium text-gray-800">{invoice.customer.name}</p>
            {invoice.customer.address && (
              <p className="text-gray-600 mt-1">{invoice.customer.address}</p>
            )}
            {invoice.customer.gstin && (
              <p className="text-gray-600 mt-1">GSTIN: {invoice.customer.gstin}</p>
            )}
            {invoice.customer.phone && (
              <p className="text-gray-600 mt-1">Phone: {invoice.customer.phone}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-3 text-left">Description</th>
                <th className="border border-gray-300 p-3 text-center">Qty</th>
                <th className="border border-gray-300 p-3 text-right">Rate</th>
                <th className="border border-gray-300 p-3 text-right">Amount</th>
                <th className="border border-gray-300 p-3 text-center">GST %</th>
                <th className="border border-gray-300 p-3 text-right">GST Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => {
                const gst = InvoiceGenerator.calculateGST(item.amount, item.gstRate);
                const gstAmount = gst.cgst + gst.sgst + gst.igst;
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-3">{item.description}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-3 text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-right">₹{item.amount.toFixed(2)}</td>
                    <td className="border border-gray-300 p-3 text-center">{item.gstRate}%</td>
                    <td className="border border-gray-300 p-3 text-right">₹{gstAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-sm">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Total GST:</span>
                <span className="font-medium">₹{totalGST.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-orange-200">
                <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                <span className="text-lg font-bold text-orange-600 flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />
                  {grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">Notes:</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{invoice.notes}</p>
          </div>
        )}

        {/* Signature */}
        <div className="text-right">
          <div className="inline-block">
            <p className="text-gray-600 mb-4">Authorized Signatory</p>
            <div className="w-40 h-12 border-b border-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};