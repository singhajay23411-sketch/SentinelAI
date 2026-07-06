// Mock AI analysis engines.
// Each function returns Promise<ScanResult> with realistic delays.

function generateId() {
  return 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function buildResult(type, overrides = {}) {
  const threatScore = overrides.threatScore ?? randomBetween(15, 98);
  const trustScore = overrides.trustScore ?? Math.max(0, 100 - threatScore - randomBetween(5, 15));
  const confidenceScore = overrides.confidenceScore ?? randomBetween(60, 95);
  
  let verificationStatus = 'Unknown';
  if (threatScore >= 80) verificationStatus = 'Critical Threat';
  else if (threatScore >= 60) verificationStatus = 'High Risk Fraud';
  else if (threatScore >= 40) verificationStatus = 'Suspicious';
  else if (trustScore >= 80) verificationStatus = 'Trusted Financial Application';
  else if (trustScore >= 50) verificationStatus = 'Likely Legitimate';
  else verificationStatus = 'Needs Review';

  const appName = overrides.appName || appNames[randomBetween(0, appNames.length - 1)];
  const developer = overrides.developer || developers[randomBetween(0, developers.length - 1)];

  const issueCategories = type === 'website' ? [issuePool.web, issuePool.content] : [issuePool.permissions, issuePool.behavior, issuePool.content];
  const allPossibleIssues = issueCategories.flat();
  const issueCount = threatScore >= 70 ? randomBetween(4, 6) : threatScore >= 40 ? randomBetween(2, 4) : randomBetween(0, 2);
  const detectedIssues = pickRandom(allPossibleIssues, issueCount);

  const permissionsList = ['android.permission.INTERNET', 'android.permission.READ_PHONE_STATE', 'android.permission.ACCESS_FINE_LOCATION', 'android.permission.CAMERA', 'android.permission.READ_CONTACTS', 'android.permission.SEND_SMS', 'android.permission.RECORD_AUDIO', 'android.permission.READ_EXTERNAL_STORAGE', 'android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.RECEIVE_BOOT_COMPLETED'];
  const permissions = pickRandom(permissionsList, randomBetween(3, 8));

  const recommendations = [];
  if (threatScore >= 70) recommendations.push('Immediately uninstall this application and change any passwords used with it.');
  if (threatScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (threatScore >= 30) recommendations.push('Verify the developer identity through official channels before trusting this app.');
  recommendations.push('Report this application to the relevant app store if suspicious activity is confirmed.');
  if (type === 'website') recommendations.push('Do not click any links or download files from this website.');

  const verdicts = {
    'Critical Threat': 'This application exhibits multiple critical security threats and has been classified as extremely dangerous. Immediate removal is strongly recommended.',
    'High Risk Fraud': 'Significant security concerns have been identified. This application shows patterns commonly associated with fraudulent software.',
    'Suspicious': 'This application shows some suspicious indicators that warrant further investigation before continued use.',
    'Needs Review': 'Minor concerns detected. The application appears mostly legitimate but has some unusual characteristics.',
    'Likely Legitimate': 'No significant threats detected. This application appears to be legitimate.',
    'Trusted Financial Application': 'No significant threats detected. This application appears to be highly trusted and safe for use.',
    'Trusted Application': 'No significant threats detected. This application appears to be highly trusted and safe for use.',
  };

  return {
    id: generateId(),
    type,
    appName,
    developer,
    trustScore,
    threatScore,
    confidenceScore,
    verificationStatus,
    summary: `AI analysis ${threatScore >= 70 ? 'flagged critical threats' : threatScore >= 40 ? 'identified some concerns' : 'found no major issues'} in ${appName} by ${developer}. Threat score: ${threatScore}/100.`,
    detectedIssues,
    permissions,
    recommendations,
    evidence: [
      { type: 'metric', label: 'Threat Score', value: `${threatScore}/100` },
      { type: 'metric', label: 'Issues Found', value: `${detectedIssues.length}` },
      { type: 'text', label: 'Analysis Engine', value: 'SentinelAI v3.2 Neural Classifier' },
      { type: 'text', label: 'Scan Duration', value: `${randomBetween(3, 8)}s` },
    ],
    metadata: overrides.metadata || {},
    timestamp: new Date().toISOString(),
    aiVerdict: verdicts[verificationStatus] || 'Assessment unavailable.',
    ...overrides,
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
  });

  for (const stage of stages) {
    await delay(randomBetween(300, 600));
    onProgress?.(stage);
  }

  const responseData = await apiPromise;

  onProgress?.({ progress: 100, status: 'Analysis Complete', detail: 'Security report generated successfully.' });

  const appDetails = responseData.app_details;
  const analysis = responseData.analysis;
  
  const trustScore = analysis.trust_score || 0;
  const threatScore = analysis.threat_score || 0;
  const confidenceScore = analysis.confidence_score || 0;
  const verificationStatus = analysis.status || 'Unknown';

  const detectedIssues = (analysis.issues || []).map(r => ({
      severity: threatScore >= 70 ? 'High' : 'Medium',
      title: 'Fraud Indicator',
      description: r
  }));

  const recommendations = [];
  if (threatScore >= 70) recommendations.push('Immediately uninstall this application and change any passwords used with it.');
  if (threatScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (threatScore >= 30) recommendations.push('Verify the developer identity through official channels before trusting this app.');
  recommendations.push('Report this application to the relevant app store if suspicious activity is confirmed.');

  const evidence = [
    { type: 'metric', label: 'Trust Score', value: `${trustScore}/100` },
    { type: 'metric', label: 'Threat Score', value: `${threatScore}/100` },
    { type: 'metric', label: 'Confidence', value: `${confidenceScore}%` },
    { type: 'metric', label: 'Ratings Count', value: `${(appDetails.ratings || 0).toLocaleString()}` },
    { type: 'text', label: 'Analysis Engine', value: 'SentinelAI Intelligence Engine 2.0' },
  ];

  if (analysis.trust_signals) {
    analysis.trust_signals.forEach(signal => {
      evidence.push({ type: 'text', label: 'Verified Signal', value: signal });
    });
  }

  return {
    id: responseData.id || 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: 'playstore',
    appName: appDetails.title,
    developer: appDetails.developer,
    trustScore,
    threatScore,
    confidenceScore,
    verificationStatus,
    summary: `Play Store analysis completed. ${threatScore >= 70 ? 'Flagged critical threats' : threatScore >= 40 ? 'Identified some concerns' : 'Found no major issues'} in ${appDetails.title} by ${appDetails.developer}. Threat score: ${threatScore}/100.`,
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
    timestamp: new Date().toISOString(),
    aiVerdict: analysis.ai_report || 'AI assessment unavailable',
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

  const apiPromise = fetch('http://127.0.0.1:8080/manual-analysis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_name: formData.appName,
      description: formData.description,
      developer: formData.developer,
      website: formData.website,
      apk_link: formData.apkLink
    }),
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Analysis failed');
    }
    return res.json();
  });

  for (const stage of stages) {
    await delay(randomBetween(500, 800));
    onProgress?.(stage);
  }

  const responseData = await apiPromise;
  
  onProgress?.({ progress: 100, status: 'Analysis Complete', detail: 'Security report generated successfully.' });

  const trustScore = responseData.trust_score || 0;
  const threatScore = responseData.threat_score || 0;
  const confidenceScore = responseData.confidence_score || 0;
  const verificationStatus = responseData.status || 'Unknown';

  const detectedIssues = (responseData.issues || []).map(r => ({
      severity: threatScore >= 70 ? 'High' : 'Medium',
      title: 'Fraud Indicator',
      description: r
  }));

  const evidence = [
    { type: 'metric', label: 'Trust Score', value: `${trustScore}/100` },
    { type: 'metric', label: 'Threat Score', value: `${threatScore}/100` },
    { type: 'metric', label: 'Confidence', value: `${confidenceScore}%` },
    { type: 'text', label: 'Developer Verified', value: responseData.developer_verified ? 'Yes' : 'No' },
  ];

  if (responseData.trust_signals) {
    responseData.trust_signals.forEach(signal => {
      evidence.push({ type: 'text', label: 'Verified Signal', value: signal });
    });
  }

  const recommendations = [];
  if (threatScore >= 70) recommendations.push('Immediately avoid this application and do not share personal information.');
  if (threatScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (threatScore >= 30) recommendations.push('Verify the developer identity through official channels before trusting this app.');

  return {
    id: responseData.id || 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: 'manual',
    appName: responseData.app_name || formData.appName,
    developer: responseData.developer || formData.developer || 'Unknown',
    trustScore,
    threatScore,
    confidenceScore,
    verificationStatus,
    summary: `Manual verification completed. Threat score: ${threatScore}/100.`,
    detectedIssues,
    permissions: [],
    recommendations,
    evidence,
    metadata: {
      website: formData.website || 'N/A',
      apkLink: formData.apkLink || 'N/A',
    },
    timestamp: new Date().toISOString(),
    aiVerdict: responseData.ai_report || 'AI assessment unavailable',
    playstoreDataFound: responseData.playstore_data_found || false,
    playstoreRating: responseData.playstore_rating,
    playstoreDownloads: responseData.playstore_downloads,
    packageName: responseData.package_name,
  };
}

// ── APK Identity Scanner ─────────────────────────────────────────────────
export async function analyzeAPK(file, onProgress) {

  onProgress?.({ progress: 5, status: 'Requesting Upload Ticket...', detail: `Preparing to upload ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` });

  // Step 1: Get upload ticket
  const ticketRes = await fetch('http://127.0.0.1:8080/api/v1/scans/upload-ticket', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_name: file.name, file_size: file.size }),
  });
  if (!ticketRes.ok) throw new Error('Failed to create upload ticket');
  const { scan_id } = await ticketRes.json();

  onProgress?.({ progress: 15, status: 'Uploading APK...', detail: `Uploading ${file.name} to analysis server.` });

  // Step 2: Upload file
  const uploadRes = await fetch(`http://127.0.0.1:8080/api/v1/scans/upload/${scan_id}`, {
    method: 'PUT',
    body: file,
  });
  if (!uploadRes.ok) throw new Error('File upload failed');

  onProgress?.({ progress: 25, status: 'Triggering Scan...', detail: 'Starting identity verification pipeline.' });

  // Step 3: Trigger scan
  const triggerRes = await fetch('http://127.0.0.1:8080/api/v1/scans/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scan_id }),
  });
  if (!triggerRes.ok) throw new Error('Failed to trigger scan');
  const triggerData = await triggerRes.json();

  // Step 4: Poll for completion (or return immediately if cache hit)
  if (triggerData.status !== 'COMPLETED') {
    let completed = false;
    while (!completed) {
      await delay(1500);
      const statusRes = await fetch(`http://127.0.0.1:8080/api/v1/scans/status/${scan_id}`);
      if (!statusRes.ok) throw new Error('Failed to check scan status');
      const statusData = await statusRes.json();

      onProgress?.({
        progress: Math.min(statusData.progress || 30, 95),
        status: statusData.current_stage || 'Processing...',
        detail: statusData.detail || 'Running identity verification.',
      });

      if (statusData.status === 'COMPLETED') {
        completed = true;
      } else if (statusData.status === 'FAILED') {
        throw new Error(statusData.detail || 'APK analysis failed');
      }
    }
  }

  onProgress?.({ progress: 98, status: 'Fetching Results...', detail: 'Retrieving identity verification report.' });

  // Step 5: Get results
  const resultRes = await fetch(`http://127.0.0.1:8080/api/v1/scans/results/${scan_id}`);
  if (!resultRes.ok) throw new Error('Failed to retrieve scan results');
  const responseData = await resultRes.json();

  onProgress?.({ progress: 100, status: 'Verification Complete', detail: 'Identity verification report generated.' });

  // Map backend response to shared ScanResult shape
  const trustScore = responseData.trust_score || 0;
  const threatScore = responseData.threat_score || 0;
  const confidenceScore = responseData.confidence_score || 0;
  const verificationStatus = responseData.status || 'Unknown';

  const detectedIssues = (responseData.issues || []).map(r => ({
    severity: threatScore >= 70 ? 'High' : threatScore >= 40 ? 'Medium' : 'Low',
    title: 'Fraud Indicator',
    description: r
  }));

  const evidence = [
    { type: 'metric', label: 'Trust Score', value: `${trustScore}/100` },
    { type: 'metric', label: 'Threat Score', value: `${threatScore}/100` },
    { type: 'metric', label: 'Confidence', value: `${confidenceScore}%` },
    { type: 'text', label: 'Package Verified', value: responseData.package_verified ? 'Yes' : 'No' },
    { type: 'text', label: 'Developer Verified', value: responseData.developer_verified ? 'Yes' : 'No' },
    { type: 'text', label: 'Certificate Present', value: responseData.certificate_present ? 'Yes' : 'No' },
    { type: 'text', label: 'Analysis Engine', value: 'SentinelAI Intelligence Engine 2.0' },
  ];

  if (responseData.trust_signals) {
    responseData.trust_signals.forEach(signal => {
      evidence.push({ type: 'text', label: 'Verified Signal', value: signal });
    });
  }

  const recommendations = [];
  if (threatScore >= 70) recommendations.push('Do not install this APK. It shows significant fraud indicators.');
  if (threatScore >= 50) recommendations.push('Do not enter any personal or financial information into this application.');
  if (threatScore >= 30) recommendations.push('Verify the application identity through official channels before trusting this APK.');
  if (responseData.certificate_present === false) recommendations.push('This APK lacks a valid signing certificate — authenticity cannot be verified.');
  recommendations.push('Always download applications from official sources like the Google Play Store.');

  const meta = responseData.metadata || {};
  const permissions = responseData.permissions?.requested || [];

  return {
    id: responseData.id || 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: 'apk',
    appName: responseData.app_name || file.name.replace('.apk', ''),
    developer: responseData.developer_verified ? 'Verified Developer' : 'Unknown',
    trustScore,
    threatScore,
    confidenceScore,
    verificationStatus,
    summary: `APK identity verification completed. ${responseData.matched_app ? `Matched to: ${responseData.matched_app}.` : 'No known brand match.'} Trust score: ${trustScore}/100.`,
    detectedIssues,
    permissions,
    recommendations,
    evidence,
    metadata: {
      packageName: meta.package_name || 'Unknown',
      versionName: meta.version_name || 'N/A',
      versionCode: meta.version_code || 'N/A',
      minSdk: meta.min_sdk || 'N/A',
      targetSdk: meta.target_sdk || 'N/A',
      fileName: meta.file_name || file.name,
      fileSize: meta.file_size || `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      certificate: responseData.certificate_present ? 'Valid' : 'Not Found',
    },
    timestamp: new Date().toISOString(),
    aiVerdict: responseData.ai_report || 'AI assessment unavailable',
    matchedApp: responseData.matched_app,
    packageVerified: responseData.package_verified,
    developerVerified: responseData.developer_verified,
    certificatePresent: responseData.certificate_present,
  };
}

// ── Website Analyzer ─────────────────────────────────────────────────────
export async function analyzeWebsite(url, onProgress) {
  const stages = [
    { progress: 15, status: 'Checking SSL Certificate...', detail: 'Validating HTTPS encryption and certificate authority.' },
    { progress: 40, status: 'Performing Domain Intelligence...', detail: 'Retrieving WHOIS, domain reputation, and brand similarity.' },
    { progress: 70, status: 'Running AI Security Assessment...', detail: 'Evaluating phishing signatures and keyword matches.' },
    { progress: 95, status: 'Compiling Report...', detail: 'Generating website security report.' },
    { progress: 100, status: 'Analysis Complete', detail: 'Website security report generated.' },
  ];

  // Fire the API request in parallel
  const apiPromise = fetch('http://127.0.0.1:8080/analyze-website', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Website analysis failed');
    }
    return res.json();
  });

  for (const stage of stages) {
    await delay(randomBetween(400, 750));
    onProgress?.(stage);
  }

  const responseData = await apiPromise;

  const trustScore = responseData.trust_score || 0;
  const threatScore = responseData.threat_score || 0;
  const confidenceScore = responseData.confidence_score || 0;
  const verificationStatus = responseData.status || 'Unknown';

  const detectedIssues = (responseData.issues || []).map(r => ({
    severity: threatScore >= 70 ? 'High' : threatScore >= 40 ? 'Medium' : 'Low',
    title: 'Fraud Indicator',
    description: r
  }));

  const recommendations = [];
  if (threatScore >= 70) recommendations.push('Avoid interacting with this website immediately.');
  if (threatScore >= 50) recommendations.push('Do not enter personal, login, or financial information.');
  recommendations.push('Cross-verify through official applications or verified developer contacts.');

  const evidence = [
    { type: 'metric', label: 'Trust Score', value: `${trustScore}/100` },
    { type: 'metric', label: 'Threat Score', value: `${threatScore}/100` },
    { type: 'metric', label: 'Confidence', value: `${confidenceScore}%` },
    { type: 'text', label: 'Analysis Engine', value: 'SentinelAI Domain Intelligence 2.0' },
  ];

  if (responseData.trust_signals) {
    responseData.trust_signals.forEach(signal => {
      evidence.push({ type: 'text', label: 'Verified Signal', value: signal });
    });
  }

  const meta = responseData.metadata || {};

  return {
    id: responseData.id || 'scan_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    type: 'website',
    appName: responseData.app_name || url,
    developer: 'Domain Host',
    trustScore,
    threatScore,
    confidenceScore,
    verificationStatus,
    summary: `Website verification completed. ${responseData.matched_app ? `Matches brand pattern: ${responseData.matched_app}.` : 'No direct brand association found.'} Threat score: ${threatScore}/100.`,
    detectedIssues,
    permissions: [],
    recommendations,
    evidence,
    metadata: {
      url: meta.url || url,
      ssl: meta.ssl || 'Valid',
      https: meta.https || 'Enabled',
      domainAge: 'N/A',
      whois: 'N/A',
      blacklisted: 'No',
    },
    timestamp: new Date().toISOString(),
    aiVerdict: responseData.ai_report || 'AI assessment unavailable',
  };
}
