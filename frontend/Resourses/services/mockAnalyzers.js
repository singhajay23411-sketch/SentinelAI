// Mock AI analysis engines.
// Each function returns Promise<ScanResult> with realistic delays.
// Replace the body of each function with real API calls later.

function createDeterministicRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  let seed = Math.abs(hash) || 1;
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function cyrb128(str) {
  let h1 = 1779033703, h2 = 3024733165, h3 = 3362453659, h4 = 2804903375;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function generateDeterministicId(seed) {
  const hash = cyrb128(seed || 'default');
  return 'scan_' + hash[0].toString(36) + '_' + hash[1].toString(36);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRiskLevel(score) {
  if (score >= 90) return 'Critical';
  if (score >= 70) return 'High';
  if (score >= 50) return 'Medium';
  if (score >= 25) return 'Low';
  return 'Safe';
}

const appNames = ['CryptoGroww Pro', 'InvestEasy Plus', 'QuickTrade Hub', 'WealthGuard', 'StockMaster AI', 'PayFast Wallet', 'MoneyGrow App', 'TrustInvest Pro', 'SecureBank Lite', 'FinanceBot'];
const developers = ['Nexus Dev Corp', 'GlobalNet Solutions', 'Unknown Developer', 'QuickApps Ltd', 'TrustTech Inc', 'CryptoLabs', 'FinDev Studios', 'AppForge LLC', 'SecureSoft', 'Digital Ventures'];
const issuePool = {
  permissions: [
    { severity: 'Critical', title: 'SMS Access', description: 'App requests SMS read/send permissions without clear justification.' },
    { severity: 'High', title: 'Camera & Microphone', description: 'Background audio/video capture capabilities detected.' },
    { severity: 'High', title: 'Accessibility Service Abuse', description: 'App requests accessibility services to overlay UI elements.' },
    { severity: 'Medium', title: 'Location Tracking', description: 'Continuous background location tracking enabled.' },
    { severity: 'Medium', title: 'Contact Access', description: 'App reads entire contact list without clear need.' },
  ],
  behavior: [
    { severity: 'Critical', title: 'Data Exfiltration', description: 'Detected outbound data transmission to unknown servers.' },
    { severity: 'Critical', title: 'Banking Trojan Pattern', description: 'Overlay attack signatures found matching known banking trojans.' },
    { severity: 'High', title: 'Background Crypto Mining', description: 'Suspicious CPU usage pattern consistent with cryptocurrency mining.' },
    { severity: 'High', title: 'Dynamic Code Loading', description: 'App loads executable code from remote servers at runtime.' },
    { severity: 'Medium', title: 'Screen Recording', description: 'Screen capture capability detected in background service.' },
  ],
  content: [
    { severity: 'High', title: 'Fake Investment Claims', description: 'Guaranteed returns and unrealistic profit promises detected in content.' },
    { severity: 'High', title: 'Brand Impersonation', description: 'App icon and name closely resemble a legitimate financial brand.' },
    { severity: 'Medium', title: 'Scam Keywords', description: 'Multiple fraud-associated keywords found in description text.' },
    { severity: 'Medium', title: 'Fake Reviews', description: 'Review pattern analysis suggests artificial review generation.' },
    { severity: 'Low', title: 'Grammar Issues', description: 'Multiple grammatical errors suggest non-professional development.' },
  ],
  web: [
    { severity: 'Critical', title: 'Phishing Indicators', description: 'Login form mimics a known financial institution without proper domain.' },
    { severity: 'High', title: 'No SSL Certificate', description: 'Website does not use HTTPS encryption for data transmission.' },
    { severity: 'High', title: 'Hidden Redirects', description: 'Multiple redirect chains detected leading to suspicious domains.' },
    { severity: 'Medium', title: 'Recently Registered Domain', description: 'Domain was registered less than 30 days ago.' },
    { severity: 'Medium', title: 'Suspicious Forms', description: 'Forms collecting sensitive financial data without proper security.' },
    { severity: 'Low', title: 'Missing Privacy Policy', description: 'No privacy policy or terms of service found on the website.' },
  ],
};

function buildResult(type, overrides = {}, seed = 'default') {
  const rand = createDeterministicRandom(seed);
  
  const randomBetween = (min, max) => {
    return Math.floor(rand() * (max - min + 1)) + min;
  };
  
  const pickRandom = (arr, count) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  };

  const riskScore = overrides.riskScore ?? randomBetween(15, 98);
  const riskLevel = getRiskLevel(riskScore);
  const appName = overrides.appName || appNames[randomBetween(0, appNames.length - 1)];
  const developer = overrides.developer || developers[randomBetween(0, developers.length - 1)];

  const issueCategories = type === 'website' ? [issuePool.web, issuePool.content] : [issuePool.permissions, issuePool.behavior, issuePool.content];
  const allPossibleIssues = issueCategories.flat();
  const issueCount = riskScore >= 70 ? randomBetween(4, 6) : riskScore >= 40 ? randomBetween(2, 4) : randomBetween(0, 2);
  const detectedIssues = pickRandom(allPossibleIssues, issueCount);

  const permissionsList = ['android.permission.INTERNET', 'android.permission.READ_PHONE_STATE', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.CAMERA', 'android.permission.READ_CONTACTS', 'android.permission.SEND_SMS', 'android.permission.RECORD_AUDIO', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.RECEIVE_BOOT_COMPLETED'];
  const permissions = pickRandom(permissionsList, randomBetween(3, 8));

  const recommendations = [];
  if (riskScore >= 70) recommendations.push('Immediately uninstall this application and change any passwords used with it.');
  if (riskScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (riskScore >= 30) recommendations.push('Verify the developer identity through official channels before trusting this app.');
  recommendations.push('Report this application to the relevant app store if suspicious activity is confirmed.');
  if (type === 'website') recommendations.push('Do not click any links or download files from this website.');

  const verdicts = {
    Critical: 'This application exhibits multiple critical security threats and has been classified as extremely dangerous. Immediate removal is strongly recommended.',
    High: 'Significant security concerns have been identified. This application shows patterns commonly associated with fraudulent software.',
    Medium: 'This application shows some suspicious indicators that warrant further investigation before continued use.',
    Low: 'Minor concerns detected. The application appears mostly legitimate but has some unusual characteristics.',
    Safe: 'No significant threats detected. This application appears to be legitimate and safe for use.',
  };

  return {
    id: generateDeterministicId(seed),
    type,
    appName,
    developer,
    riskScore,
    riskLevel,
    summary: `AI analysis ${riskScore >= 70 ? 'flagged critical threats' : riskScore >= 40 ? 'identified some concerns' : 'found no major issues'} in ${appName} by ${developer}. Risk score: ${riskScore}/100.`,
    detectedIssues,
    permissions,
    recommendations,
    evidence: [
      { type: 'metric', label: 'Threat Score', value: `${riskScore}/100` },
      { type: 'metric', label: 'Issues Found', value: `${detectedIssues.length}` },
      { type: 'text', label: 'Analysis Engine', value: 'SentinelAI v3.2 Neural Classifier' },
      { type: 'text', label: 'Scan Duration', value: `${randomBetween(3, 8)}s` },
    ],
    metadata: overrides.metadata || {},
    timestamp: new Date('2026-07-06T10:00:00Z').toISOString(),
    aiVerdict: verdicts[riskLevel],
    ...overrides,
    riskScore,
    riskLevel,
  };
}

// ── Play Store Analysis ──────────────────────────────────────────────────
export async function analyzePlayStore(url, onProgress) {
  const stages = [
    { progress: 15, status: 'Fetching App Metadata...', detail: 'Connecting to Play Store API to retrieve app information.' },
    { progress: 35, status: 'Extracting App Details...', detail: 'Parsing app name, developer, downloads, permissions, and version.' },
    { progress: 55, status: 'Running Similarity Analysis...', detail: 'Comparing icon, name, and behavior against known threat patterns.' },
    { progress: 75, status: 'AI Security Assessment...', detail: 'Neural network evaluating permission combinations and risk indicators.' },
    { progress: 90, status: 'Generating Report...', detail: 'Compiling comprehensive threat analysis and recommendations.' },
  ];

  // Fire the API request in parallel
  const apiPromise = fetch('http://127.0.0.1:8080/analyze-playstore-app', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Analysis failed');
    }
    return res.json();
  }).catch(async (err) => {
    if (err.message && err.message !== 'Failed to fetch' && !err.message.includes('fetch')) {
      throw err;
    }
    
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      throw new Error('Network disconnected');
    }
    
    try {
      const healthCheckPromise = fetch('http://127.0.0.1:8080/health', {
        method: 'GET',
        mode: 'no-cors'
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 3000)
      );
      
      await Promise.race([healthCheckPromise, timeoutPromise]);
      throw new Error('CORS blocked or API endpoint unavailable on port 8080');
    } catch (checkErr) {
      if (checkErr.message === 'timeout') {
        throw new Error('API request timed out (service is unresponsive)');
      } else if (checkErr.message && (checkErr.message.includes('CORS') || checkErr.message.includes('unavailable'))) {
        throw checkErr;
      } else {
        throw new Error('Backend service not running on port 8080');
      }
    }
  });

  for (const stage of stages) {
    await delay(400);
    onProgress?.(stage);
  }

  const responseData = await apiPromise;

  onProgress?.({ progress: 100, status: 'Analysis Complete', detail: 'Security report generated successfully.' });

  const appDetails = responseData.app_details;
  const analysis = responseData.analysis;
  const riskScore = analysis.risk_score;
  const riskLevel = getRiskLevel(riskScore);

  const detectedIssues = [];
  if (analysis.breakdown.name.risk >= 50) {
    detectedIssues.push({
      severity: analysis.breakdown.name.risk >= 90 ? 'Critical' : 'High',
      title: 'Brand Impersonation',
      description: `App name is highly similar to '${analysis.breakdown.name.matched}' (${analysis.breakdown.name.similarity}% similarity).`
    });
  }
  if (analysis.breakdown.developer.risk >= 50) {
    detectedIssues.push({
      severity: 'High',
      title: 'Developer Mismatch',
      description: `Developer name '${appDetails.developer}' does not match expected developer '${analysis.breakdown.developer.expected}'.`
    });
  }
  if (analysis.breakdown.description.risk >= 50) {
    detectedIssues.push({
      severity: 'High',
      title: 'Suspicious Description Keywords',
      description: `Detected fraud-associated keywords: ${analysis.breakdown.description.keywords_found.join(', ')}.`
    });
  }
  if (analysis.breakdown.installs.risk >= 50) {
    detectedIssues.push({
      severity: 'Medium',
      title: 'Low Install Count',
      description: analysis.breakdown.installs.note
    });
  }

  const recommendations = [];
  if (riskScore >= 70) recommendations.push('Immediately uninstall this application and change any passwords used with it.');
  if (riskScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (riskScore >= 30) recommendations.push('Verify the developer identity through official channels before trusting this app.');
  recommendations.push('Report this application to the relevant app store if suspicious activity is confirmed.');

  const verdicts = {
    Critical: 'This application exhibits multiple critical security threats and has been classified as extremely dangerous. Immediate removal is strongly recommended.',
    High: 'Significant security concerns have been identified. This application shows patterns commonly associated with fraudulent software.',
    Medium: 'This application shows some suspicious indicators that warrant further investigation before continued use.',
    Low: 'Minor concerns detected. The application appears mostly legitimate but has some unusual characteristics.',
    Safe: 'No significant threats detected. This application appears to be legitimate and safe for use.',
  };

  const evidence = [
    { type: 'metric', label: 'Threat Score', value: `${riskScore}/100` },
    { type: 'metric', label: 'Ratings Count', value: `${(appDetails.ratings || 0).toLocaleString()}` },
    { type: 'text', label: 'Analysis Engine', value: 'SentinelAI Play Store Scraper' },
    { type: 'text', label: 'Category/Genre', value: appDetails.genre || 'Finance' }
  ];

  return {
    id: generateDeterministicId(url),
    type: 'playstore',
    appName: appDetails.title,
    developer: appDetails.developer,
    riskScore,
    riskLevel,
    summary: `Real-time Play Store analysis completed. ${riskScore >= 70 ? 'Flagged critical threats' : riskScore >= 40 ? 'Identified some concerns' : 'Found no major issues'} in ${appDetails.title} by ${appDetails.developer}. Risk score: ${riskScore}/100.`,
    detectedIssues,
    permissions: [],
    recommendations,
    evidence,
    metadata: {
      playStoreUrl: url,
      downloads: appDetails.installs,
      category: appDetails.genre,
      contentRating: appDetails.content_rating,
      version: appDetails.version || 'N/A',
      rating: appDetails.score ? Number(appDetails.score).toFixed(1) : 'N/A',
    },
    timestamp: responseData.timestamp || new Date('2026-07-06T10:00:00Z').toISOString(),
    aiVerdict: verdicts[riskLevel],
  };
}

// ── Manual Verification ──────────────────────────────────────────────────
export async function analyzeManual(formData, onProgress) {
  const stages = [
    { progress: 20, status: 'Parsing Input Data...', detail: 'Processing app name, description, and developer information.' },
    { progress: 40, status: 'Checking Scam Keywords...', detail: 'Scanning text for fraud-associated patterns and promises.' },
    { progress: 60, status: 'Name Similarity Check...', detail: 'Comparing app name against database of legitimate financial apps.' },
    { progress: 80, status: 'AI Risk Assessment...', detail: 'Evaluating developer trust score and content authenticity.' },
    { progress: 95, status: 'Compiling Report...', detail: 'Generating detailed verification report.' },
    { progress: 100, status: 'Verification Complete', detail: 'Manual verification report ready.' },
  ];

  for (const stage of stages) {
    await delay(500);
    onProgress?.(stage);
  }

  const seed = formData.appName + '_' + (formData.developer || 'unknown');

  return buildResult('manual', {
    appName: formData.appName,
    developer: formData.developer || 'Not Specified',
    metadata: {
      providedDescription: formData.description,
      website: formData.website || 'N/A',
      apkLink: formData.apkLink || 'N/A',
    },
  }, seed);
}

// ── APK Security Scanner ──────────────────────────────────────────────────
export async function analyzeAPK(file, onProgress) {
  // Step 1: Request upload ticket
  const ticketRes = await fetch('http://127.0.0.1:8080/api/v1/scans/upload-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: file.name, file_size: file.size }),
  });
  
  if (!ticketRes.ok) {
    throw new Error('Failed to initialize upload ticket on backend.');
  }
  
  const { scan_id, upload_url } = await ticketRes.json();
  onProgress?.({ progress: 5, status: 'Uploading APK...', detail: `Initialized upload ticket for ${file.name}` });

  // Step 2: Perform binary PUT upload of the file
  const uploadRes = await fetch(upload_url, {
    method: 'PUT',
    body: file,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to upload APK file binary.');
  }
  onProgress?.({ progress: 15, status: 'File Uploaded', detail: 'APK binary successfully uploaded.' });

  // Step 3: Trigger the scan pipeline
  const triggerRes = await fetch('http://127.0.0.1:8080/api/v1/scans/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scan_id }),
  });

  if (!triggerRes.ok) {
    throw new Error('Failed to start scan execution pipeline.');
  }

  // Step 4: Poll status
  let status = 'QUEUED';
  let progress = 15;
  let attempts = 0;
  const maxAttempts = 60; // Max 60 seconds

  while (status !== 'COMPLETED' && status !== 'FAILED' && attempts < maxAttempts) {
    await delay(1000);
    attempts++;
    
    const statusRes = await fetch(`http://127.0.0.1:8080/api/v1/scans/status/${scan_id}`);
    if (!statusRes.ok) {
      continue; // Retry next time
    }
    
    const statusData = await statusRes.json();
    status = statusData.status;
    progress = statusData.progress;
    onProgress?.({
      progress: progress,
      status: statusData.current_stage || 'Processing...',
      detail: statusData.detail || 'Analyzing APK structure...'
    });
  }

  if (status !== 'COMPLETED') {
    throw new Error('APK analysis timed out or failed on the server.');
  }

  // Step 5: Retrieve finalized report and format it for the frontend
  const resultsRes = await fetch(`http://127.0.0.1:8080/api/v1/scans/results/${scan_id}`);
  if (!resultsRes.ok) {
    throw new Error('Failed to fetch analysis report.');
  }

  const report = await resultsRes.json();

  // ── Detected Issues ─────────────────────────────────────────────────────
  // Read the structured findings array returned by the backend.
  // Each entry already has: { severity, title, description, recommendation }.
  // This is the ONLY source of truth — no keyword guessing, no fallbacks.
  const detectedIssues = Array.isArray(report.findings)
    ? report.findings.map(f => ({
        severity:    f.severity,
        title:       f.title,
        description: f.description,
      }))
    : [];

  // ── Risk score & level ──────────────────────────────────────────────────
  const riskScore = report.risk_score ?? 0;
  const threatLevel = report.threat_level || 'SAFE';
  const riskLevelFormatted =
    threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1).toLowerCase();

  // ── AI Verdict ──────────────────────────────────────────────────────────
  // Read directly from the backend — generated from actual findings.
  // Never use a hardcoded lookup table.
  const aiVerdict = report.ai_verdict || 'No verdict available.';

  // ── Recommendations ─────────────────────────────────────────────────────
  // Read directly from the backend — deduplicated from finding recommendations.
  const recommendations = Array.isArray(report.recommendations)
    ? report.recommendations
    : [];

  // ── Permissions ─────────────────────────────────────────────────────────
  const rawPerms = report.permissions;
  const permissions = Array.isArray(rawPerms)
    ? rawPerms
    : Array.isArray(rawPerms?.requested)
      ? rawPerms.requested
      : [];

  // ── Evidence ────────────────────────────────────────────────────────────
  // Findings count must always reflect the actual number of generated findings.
  const evidence = [
    { type: 'metric', label: 'Threat Score',  value: `${riskScore}/100` },
    { type: 'metric', label: 'Findings',      value: `${detectedIssues.length}` },
    { type: 'text',   label: 'Analysis Engine', value: 'SentinelAI Androguard Parser' },
  ];
  if (report.metadata?.package_name) {
    evidence.push({ type: 'text', label: 'Package', value: report.metadata.package_name });
  }
  if (report.metadata?.obfuscation) {
    evidence.push({ type: 'text', label: 'Obfuscation', value: report.metadata.obfuscation });
  }

  return {
    id:          report.scan_id || scan_id,
    type:        'apk',
    appName:     report.app_name || 'Unknown Application',
    developer:   report.metadata?.package_name
                   ? report.metadata.package_name.split('.').slice(0, 2).join('.')
                   : 'External Developer',
    riskScore,
    riskLevel:   riskLevelFormatted,
    summary: `APK security scan ${riskScore >= 70 ? 'flagged critical threats' : riskScore >= 40 ? 'identified some concerns' : 'found no major issues'} in ${report.app_name || 'this application'}. Risk score: ${riskScore}/100.`,
    aiVerdict,
    detectedIssues,
    permissions,
    recommendations,
    evidence,
    timestamp:   report.timestamp || new Date().toISOString(),
    metadata:    report.metadata || {},
  };
}

// ── Website Analyzer ─────────────────────────────────────────────────────
export async function analyzeWebsite(url, onProgress) {
  const stages = [
    { progress: 15, status: 'Checking SSL Certificate...', detail: 'Validating HTTPS encryption and certificate authority.' },
    { progress: 30, status: 'WHOIS Lookup...', detail: 'Retrieving domain registration and ownership information.' },
    { progress: 50, status: 'Content Analysis...', detail: 'Scanning page content for investment scam indicators.' },
    { progress: 65, status: 'Phishing Detection...', detail: 'Checking against known phishing URL databases.' },
    { progress: 80, status: 'Redirect Chain Analysis...', detail: 'Tracing URL redirects for suspicious destinations.' },
    { progress: 92, status: 'Trust Score Calculation...', detail: 'Computing overall website trust score.' },
    { progress: 100, status: 'Analysis Complete', detail: 'Website security report generated.' },
  ];

  for (const stage of stages) {
    await delay(500);
    onProgress?.(stage);
  }

  const rand = createDeterministicRandom(url);
  const randomBetween = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

  const hasSSL = url.startsWith('https');
  const domainAge = randomBetween(1, 3650);

  return buildResult('website', {
    appName: new URL(url.startsWith('http') ? url : 'https://' + url).hostname,
    developer: 'Domain Owner',
    riskScore: hasSSL ? randomBetween(10, 75) : randomBetween(50, 98),
    metadata: {
      url,
      ssl: hasSSL ? 'Valid (Let\'s Encrypt)' : 'Not Found',
      domainAge: domainAge > 365 ? `${Math.floor(domainAge / 365)} years` : `${domainAge} days`,
      whois: randomBetween(0, 1) ? 'Privacy Protected' : 'Public',
      https: hasSSL ? 'Enabled' : 'Disabled',
      blacklisted: randomBetween(0, 5) === 0 ? 'Yes (Google Safe Browsing)' : 'No',
      redirects: randomBetween(0, 4),
      suspiciousForms: randomBetween(0, 3),
      dangerousJS: randomBetween(0, 2),
    },
  }, url);
}
