import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TransactionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/transactions/${id}`).then(({ data }) => setTx(data.transaction)).finally(() => setLoading(false));
  }, [id]);

  const fmt = n => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
  const fmtDate = d => new Date(d).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('CampusChain', 20, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(88, 96, 100);
    doc.text('Transaction Receipt', 20, 28);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 34);

    autoTable(doc, {
      startY: 44,
      head: [['Field', 'Value']],
      body: [
        ['Transaction ID', tx._id],
        ['Amount', fmt(tx.amount)],
        ['Type', tx.type?.toUpperCase()],
        ['Status', tx.status?.toUpperCase()],
        ['From', `${tx.senderId?.name} (${tx.senderId?.campusId})`],
        ['To', `${tx.receiverId?.name} (${tx.receiverId?.campusId})`],
        ['Date', fmtDate(tx.createdAt)],
        ['Note', tx.note || '—'],
        ['Block Index', '#' + tx.blockIndex],
        ['TX Hash', tx.txHash],
        ['Prev Hash', tx.prevHash],
      ],
      headStyles: { fillColor: [26, 43, 71] },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 249, 250] },
    });

    doc.save(`campuschain-receipt-${tx._id.slice(-8)}.pdf`);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Sidebar />
        <main className="flex-1 ml-64 p-8"><div className="max-w-3xl mx-auto space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-xl" />)}</div></main>
      </div>
    );
  }

  if (!tx) return <div className="page-wrapper"><Sidebar /><main className="flex-1 ml-64 p-8"><p className="text-error">Transaction not found</p></main></div>;

  const isIncoming = tx.receiverId?._id === user?.id || tx.receiverId === user?.id;

  return (
    <div className="page-wrapper">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
          {/* Back */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-body text-sm">
            <span className="material-icons text-base">arrow_back</span>
            Back to Transactions
          </button>

          {/* Header */}
          <div className="card p-8 text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isIncoming ? 'bg-tertiary/10' : 'bg-error/10'}`}>
              <span className={`material-icons text-3xl ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
                {isIncoming ? 'call_received' : 'call_made'}
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant font-body mb-1">
              {isIncoming ? 'Money Received' : 'Money Sent'}
            </p>
            <p className={`font-headline font-bold text-4xl ${isIncoming ? 'text-tertiary' : 'text-error'}`}>
              {isIncoming ? '+' : '-'}{fmt(tx.amount)}
            </p>
            <span className={`badge-${tx.status === 'completed' ? 'success' : 'pending'} mt-3 inline-flex`}>{tx.status}</span>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'From', person: tx.senderId, icon: 'person' },
              { label: 'To', person: tx.receiverId, icon: 'person' },
            ].map(p => (
              <div key={p.label} className="card p-5">
                <p className="text-xs uppercase tracking-wide text-on-surface-variant font-body mb-3">{p.label}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{p.person?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-headline font-semibold text-on-surface text-sm">{p.person?.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.person?.campusId}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="card p-6 space-y-4">
            <h2 className="font-headline font-semibold text-on-surface">Transaction Details</h2>
            {[
              { label: 'Date & Time', value: fmtDate(tx.createdAt) },
              { label: 'Type', value: tx.type?.toUpperCase() },
              { label: 'Note', value: tx.note || '—' },
              { label: 'Block Index', value: `#${tx.blockIndex}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-surface-container last:border-0">
                <span className="text-xs uppercase tracking-wide text-on-surface-variant font-body">{row.label}</span>
                <span className="text-sm font-body text-on-surface">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Blockchain Proof */}
          <div className="card p-6 space-y-4 border-l-2 border-primary">
            <div className="flex items-center gap-2">
              <span className="material-icons text-primary">link</span>
              <h2 className="font-headline font-semibold text-on-surface">Blockchain Proof</h2>
            </div>
            <p className="text-xs text-on-surface-variant font-body">This transaction is cryptographically anchored to the CampusChain ledger via SHA-256 hash chaining.</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 font-body">Transaction Hash</p>
                <p className="font-mono text-xs bg-surface-container-highest p-3 rounded-xl break-all text-on-surface">{tx.txHash}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 font-body">Previous Hash</p>
                <p className="font-mono text-xs bg-surface-container-highest p-3 rounded-xl break-all text-on-surface-variant">{tx.prevHash}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-tertiary">
              <span className="material-icons text-base">verified</span>
              <span className="text-sm font-body font-medium">Chain integrity verified</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={downloadPDF} id="download-receipt" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <span className="material-icons text-base">download</span>
              Download Receipt
            </button>
            <button onClick={() => navigate('/transactions')} className="btn-secondary flex-1">Back to History</button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default TransactionDetail;
