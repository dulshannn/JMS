import React from 'react';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';

export default function InvoiceGenerator() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar />
      <PageShell title="Invoice Generator" subtitle="Create and manage invoices">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Invoice Generator</h3>
          <p className="text-gray-400">This feature is under construction.</p>
        </div>
      </PageShell>
    </div>
  );
}