import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as store from '../../Resourses/services/scanStore.js';

const ScanContext = createContext(null);

export function ScanProvider({ children }) {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsub = store.subscribe((newState) => {
      setState(newState);
    });
    return unsub;
  }, []);

  const addScan = useCallback((result) => {
    return store.addScan(result);
  }, []);

  const getScanById = useCallback((id) => {
    return store.getScanById(id);
  }, []);

  const value = {
    scans: state.scans,
    stats: state.stats,
    flaggedApps: state.flaggedApps,
    threatMetrics: state.threatMetrics,
    history: state.history,
    addScan,
    getScanById,
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScanContext() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error('useScanContext must be used within ScanProvider');
  return ctx;
}
