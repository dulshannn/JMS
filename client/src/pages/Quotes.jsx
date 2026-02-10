import React from 'react';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';

export default function Quotes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar />
      <PageShell title="Quotes" subtitle="View and manage your quotes">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Your Quotes</h3>
          <p className="text-gray-400">No quotes yet.</p>
        </div>
      </PageShell>
    </div>
  );
}