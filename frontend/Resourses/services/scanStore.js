// In-memory scan data store with event-driven updates.
// Clean interface so it can be replaced with a real backend later.

let scans = [];
let listeners = [];

function generateId() {
  return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function notify() {
  listeners.forEach(fn => fn(getState()));
}

export function addScan(result) {
  const scan = { ...result, id: result.id || generateId(), timestamp: result.timestamp || new Date().toISOString() };
  scans = [scan, ...scans];
  notify();
  return scan;
}

export function getScans() {
  return [...scans];
}

export function getScanById(id) {
  return scans.find(s => s.id === id) || null;
}

export function getStats() {
  const total = scans.length;
  const critical = scans.filter(s => s.riskLevel === 'Critical').length;
  const high = scans.filter(s => s.riskLevel === 'High').length;
  const medium = scans.filter(s => s.riskLevel === 'Medium').length;
  const low = scans.filter(s => s.riskLevel === 'Low').length;
  const safe = scans.filter(s => s.riskLevel === 'Safe').length;
  const avgScore = total > 0 ? Math.round(scans.reduce((sum, s) => sum + s.riskScore, 0) / total) : 0;
  return { total, critical, high, medium, low, safe, avgScore, highRisk: critical + high };
}

export function getFlaggedApps() {
  return scans.filter(s => s.riskScore >= 60).sort((a, b) => b.riskScore - a.riskScore);
}

export function getThreatIntelMetrics() {
  const highRisk = scans.filter(s => s.riskScore >= 70).length;
  const mediumRisk = scans.filter(s => s.riskScore >= 40 && s.riskScore < 70).length;
  const newlyDetected = scans.filter(s => {
    const age = Date.now() - new Date(s.timestamp).getTime();
    return age < 24 * 60 * 60 * 1000; // last 24h
  }).length;

  // Aggregate detected issues across all scans
  const allIssues = scans.flatMap(s => s.detectedIssues || []);
  const issueCounts = {};
  allIssues.forEach(issue => {
    issueCounts[issue.title] = (issueCounts[issue.title] || 0) + 1;
  });

  const topThreats = Object.entries(issueCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([title, count]) => ({ title, count }));

  return { highRisk, mediumRisk, newlyDetected, topThreats, totalEvaluated: scans.length };
}

export function getHistory() {
  return [...scans];
}

export function subscribe(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(fn => fn !== callback);
  };
}

export function getState() {
  return {
    scans: getScans(),
    stats: getStats(),
    flaggedApps: getFlaggedApps(),
    threatMetrics: getThreatIntelMetrics(),
    history: getHistory(),
  };
}
