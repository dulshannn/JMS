import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';

export default function DesignDetails() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar />
      <PageShell title="Design Details" subtitle={`Viewing design ${id}`}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
            <div className="w-full h-96 bg-gray-700 rounded-xl mb-6"></div>
            <h2 className="text-2xl font-bold mb-4">Design {id}</h2>
            <p className="text-gray-300">This is a detailed view of your custom jewellery design.</p>
          </div>
        </div>
      </PageShell>
    </div>
  );
}