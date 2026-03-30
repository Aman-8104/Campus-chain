import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import QRCode from 'qrcode';

const ReceiveMoney = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    if (user?.campusId && canvasRef.current) {
      const payload = JSON.stringify({ campusId: user.campusId, email: user.email, name: user.name });
      QRCode.toCanvas(canvasRef.current, payload, { width: 220, margin: 2, color: { dark: '#1A2B47', light: '#ffffff' } }, () => setQrGenerated(true));
    }
  }, [user]);

  const copyId = () => { navigator.clipboard.writeText(user?.campusId || ''); };

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-md mx-auto text-center space-y-6">
          <div>
            <h1 className="font-headline font-bold text-3xl text-on-surface">Receive Money</h1>
            <p className="text-on-surface-variant font-body mt-2">Share your QR code or Campus ID to receive payments.</p>
          </div>

          {/* QR Card */}
          <div className="card p-8 flex flex-col items-center space-y-5">
            <div className="relative">
              <div className="w-56 h-56 bg-surface-low rounded-xl flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} className={`transition-opacity duration-500 ${qrGenerated ? 'opacity-100' : 'opacity-0'}`} />
                {!qrGenerated && <div className="skeleton w-full h-full" />}
              </div>
            </div>

            <div>
              <p className="font-headline font-bold text-on-surface text-xl">{user?.name}</p>
              <p className="text-on-surface-variant text-sm font-body mt-1">{user?.email}</p>
            </div>

            {/* Campus ID chip */}
            <div className="bg-secondary-container rounded-full px-5 py-2.5 flex items-center gap-3">
              <span className="font-mono text-on-secondary-container font-semibold text-sm">{user?.campusId}</span>
              <button onClick={copyId} className="text-secondary hover:text-primary transition-colors">
                <span className="material-icons text-base">content_copy</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant font-body px-4">
              Anyone can scan this QR code or enter your Campus ID to send you money instantly.
            </p>
          </div>

          {/* Share options */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'share', label: 'Share Link' },
              { icon: 'download', label: 'Save QR Code' },
            ].map(a => (
              <button key={a.label} className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm">
                <span className="material-icons text-base">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>

          {/* Notice */}
          <div className="card-container p-4 flex gap-3 text-left">
            <span className="material-icons text-primary text-xl flex-shrink-0">security</span>
            <p className="text-xs text-on-surface-variant font-body">
              Payments received via QR are instantly settled and recorded on the CampusChain blockchain ledger.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ReceiveMoney;
