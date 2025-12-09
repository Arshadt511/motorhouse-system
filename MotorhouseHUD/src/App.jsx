import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, Activity, Zap, ShieldCheck, Cpu, Car, Wifi, Database, Printer } from 'lucide-react';

// --- YOUR CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyAZq49d8HxmGO_ERZqB6LC2o8ToT1GczbU",
  authDomain: "motorhouse-af894.firebaseapp.com",
  databaseURL: "https://motorhouse-af894-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "motorhouse-af894",
  storageBucket: "motorhouse-af894.firebasestorage.app",
  messagingSenderId: "491547998232",
  appId: "1:491547998232:web:a86795a4755ca59709eb6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(100);

  // --- 1. REAL-TIME DATABASE LISTENER ---
  useEffect(() => {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveJobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setJobs(liveJobs);
    }, (error) => {
      console.error("Database Error:", error);
      setSystemHealth(40);
    });
    return () => unsubscribe();
  }, []);

  // --- 2. INVOICE GENERATOR ---
  const printInvoice = (job) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const htmlContent = `
      <html>
      <head>
        <title>INVOICE - ${job.reg}</title>
        <style>
          body { font-family: 'Helvetica Neue', sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #000; }
          .logo span { color: #06b6d4; }
          .company-info { text-align: right; font-size: 12px; line-height: 1.4; color: #666; }
          .box { background: #f8fafc; padding: 15px; border-radius: 8px; width: 45%; }
          .box h3 { margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 0; font-size: 12px; text-transform: uppercase; }
          .table td { padding: 15px 0; border-bottom: 1px solid #eee; }
          .total-section { text-align: right; }
          .grand-total { font-size: 24px; font-weight: bold; color: #000; margin-top: 10px; }
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MOTOR HOUSE <span>BEDFORD</span></div>
          <div class="company-info">
            87 High Street, Clapham, Bedford, MK41 6AQ<br>
            Tel: 01234 225570 | FCA No: 1000208
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:40px;">
          <div class="box">
            <h3>Bill To</h3>
            <strong>Customer Ref: MH-Guest</strong><br>
            Vehicle: ${job.make} ${job.model}<br>
            Reg: <strong>${job.reg}</strong>
          </div>
          <div class="box">
            <h3>Invoice Details</h3>
            Invoice #: INV-${job.id.substring(0,6).toUpperCase()}<br>
            Date: ${new Date().toLocaleDateString()}<br>
            Status: ${job.status}
          </div>
        </div>
        <table class="table">
          <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            <tr><td>${job.service || 'Standard Service & Diagnostics'}</td><td>1</td><td>£150.00</td><td>£150.00</td></tr>
            <tr><td>Oil Filter & Consumables</td><td>1</td><td>£25.00</td><td>£25.00</td></tr>
            <tr><td>Environmental Disposal Fee</td><td>1</td><td>£5.00</td><td>£5.00</td></tr>
          </tbody>
        </table>
        <div class="total-section">
          <div class="grand-total">Total: £216.00</div>
        </div>
        <div class="footer">Motor House Beds Ltd is authorised and regulated by the Financial Conduct Authority.</div>
        <script>window.onload = function() { window.print(); }</script>
      </body></html>`;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- 3. AI SIMULATION ---
  const triggerAIScan = async () => {
    setScanning(true);
    setTimeout(async () => {
        const mockVehicles = [
            { reg: 'MH24 HUD', make: 'Porsche', model: '911 GT3 RS', status: 'Analysis Required' },
            { reg: 'LX73 ROV', make: 'Land Rover', model: 'Defender 130', status: 'Awaiting Parts' },
            { reg: 'TS23 LLA', make: 'Tesla', model: 'Model X Plaid', status: 'Charging' }
        ];
        const randomCar = mockVehicles[Math.floor(Math.random() * mockVehicles.length)];
        try {
            await addDoc(collection(db, "jobs"), {
                reg: randomCar.reg,
                make: randomCar.make,
                model: randomCar.model,
                status: randomCar.status,
                health: Math.floor(Math.random() * 40) + 60,
                createdAt: serverTimestamp()
            });
        } catch (e) { console.error(e); }
        setScanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 text-slate-200 selection:bg-cyan-500 selection:text-black overflow-hidden relative font-sans bg-slate-950">

      {/* GRID BACKGROUND */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black_70%,transparent_100%)] pointer-events-none"></div>

      {/* RESPONSIVE HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4 relative z-10">
        <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-cyan-950 border border-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
                <Car className="text-cyan-400" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                    MOTOR HOUSE <span className="text-cyan-400">HUD</span>
                </h1>
                <p className="text-[10px] text-cyan-600 font-mono tracking-[0.2em] uppercase">Mobile Access // Online</p>
            </div>
        </div>

        <div className="flex gap-4 font-mono text-xs text-slate-400 bg-slate-900/50 p-2 rounded-lg border border-slate-800 backdrop-blur-sm w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
                <Database size={14} className={jobs.length > 0 ? "text-green-500" : "text-slate-600"} />
                <span>DB: {jobs.length > 0 ? 'ON' : 'WAITING'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Zap size={14} className={systemHealth > 80 ? "text-cyan-400" : "text-red-500"} />
                <span>PWR: {systemHealth}%</span>
            </div>
        </div>
      </header>

      {/* DASHBOARD GRID */}
      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">

        {/* CONTROL PANEL (Top on Mobile, Left on Desktop) */}
        <div className="lg:col-span-1 space-y-4 md:space-y-6 order-1">
            <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <Scan className="text-cyan-400" />
                    FLEET ENTRY
                </h2>

                <button
                    onClick={triggerAIScan}
                    disabled={scanning}
                    className="w-full py-4 bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900/80 text-cyan-400 font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3 rounded-lg group relative overflow-hidden active:scale-95"
                >
                    {scanning && (
                        <motion.div
                            className="absolute inset-0 bg-cyan-400/20"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        />
                    )}
                    {scanning ? 'SCANNING...' : 'INITIATE SCAN'}
                </button>
            </div>
        </div>

        {/* LIVE FEED (Bottom on Mobile, Right on Desktop) */}
        <div className="lg:col-span-3 order-2">
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Activity className="text-cyan-400" />
                    LIVE JOBS
                </h2>
                <span className="text-xs px-2 py-1 bg-cyan-950 border border-cyan-800 rounded text-cyan-400 font-mono">
                    {jobs.length} ACTIVE
                </span>
            </div>

            <div className="space-y-3 pb-20 md:pb-0 h-[500px] md:h-[600px] overflow-y-auto pr-1">
                <AnimatePresence>
                    {jobs.length === 0 && (
                        <div className="text-center text-slate-600 py-20">
                            Waiting for vehicles... Click "Initiate Scan".
                        </div>
                    )}
                    {jobs.map((job) => (
                        <motion.div
                            key={job.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/80 backdrop-blur border border-slate-700/50 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between group hover:border-cyan-500/50 transition-all shadow-lg"
                        >
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-12 h-12 bg-slate-950 rounded-lg flex items-center justify-center border border-slate-800 group-hover:border-cyan-500/30 transition-colors shrink-0">
                                    <Cpu className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">{job.reg}</h3>
                                    <p className="text-cyan-500 font-medium text-sm">{job.make} {job.model}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider text-right">Status</p>
                                    <p className="font-bold text-slate-200 text-sm">{job.status}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                      onClick={(e) => { e.stopPropagation(); printInvoice(job); }}
                                      className="p-3 bg-cyan-950/50 hover:bg-cyan-500 hover:text-black rounded-lg transition text-cyan-400 border border-cyan-500/20"
                                      title="Print Invoice"
                                  >
                                      <Printer size={18} />
                                  </button>
                                  <ShieldCheck className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>

      </main>
    </div>
  );
}


