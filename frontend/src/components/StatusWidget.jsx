import { useState, useEffect } from 'react';
import axios from 'axios';
import { Server, Database, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const StatusWidget = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      setStatus(response.data);
    } catch {
      setStatus({ status: 'ERROR', database: { connected: false } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all"
      >
        <span className={`relative flex h-2 w-2`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${loading ? 'bg-gray-400' : status?.status === 'OK' ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${loading ? 'bg-gray-500' : status?.status === 'OK' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
        </span>
        <span className="text-xs font-medium uppercase tracking-wider text-slate-600 dark:text-slate-300">
          System {loading ? 'Checking...' : status?.status}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-64 p-4 glass rounded-2xl z-50 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              System Infrastructure
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Server size={14} /> API Backend
                </div>
                {status?.status === 'OK' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Database size={14} /> PostgreSQL
                </div>
                {status?.database?.connected ? <CheckCircle2 size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-rose-500" />}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest">Uptime</div>
                <div className="text-xs font-mono">{status?.uptime ? `${Math.floor(status.uptime / 60)}m ${Math.floor(status.uptime % 60)}s` : 'N/A'}</div>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatusWidget;
