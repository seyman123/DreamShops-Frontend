import React from 'react';

const AdminPanel = () => {
  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center">
      <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">⚙️ Yönetici Paneli</h1>
        <p className="text-gray-300 text-lg mb-6">Yönetici paneli yakında geliyor!</p>
        <p className="text-gray-400">Bu sayfa henüz Tailwind CSS'e dönüştürülmemiştir.</p>
      </div>
    </div>
  );
};

export default AdminPanel;