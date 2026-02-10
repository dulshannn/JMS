import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PageShell from '../components/PageShell';

export default function DesignPortfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <Navbar />
      <PageShell title="Design Portfolio" subtitle="Your collection of custom jewellery designs">
        <div className="text-center py-12">
          <h3 className="text-2xl font-bold mb-4">Your Design Portfolio</h3>
          <p className="text-gray-400 mb-8">Here you can view and manage all your custom jewellery designs.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example design card */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="w-full h-48 bg-gray-700 rounded-xl mb-4"></div>
              <h4 className="font-semibold mb-2">Example Design</h4>
              <p className="text-sm text-gray-400 mb-4">A beautiful custom ring design</p>
              <Link to="/designs/1" className="text-[#d4af37] hover:underline">View Details</Link>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
}