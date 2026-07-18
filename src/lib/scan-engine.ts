import { db, DBScanResult, DBRemovalRequest } from "@/lib/supabase";
import { scanInputSchema } from "@/lib/zod-schemas";
import { sendScanAlertEmail } from "@/lib/resend";
import { queryExternalPrivacyAPIs } from "@/lib/broker-client";

// Simulated Data Broker Registry List
const DATA_BROKERS = [
  "Whitepages.com",
  "Spokeo.com",
  "Radaris.com",
  "Intelius.com",
  "PeopleFinders.com",
  "BeenVerified.com",
  "InstantCheckmate.com",
  "TruthFinder.com",
  "USSearch.com",
  "PrivateEye.com"
];

// Exposure details templates
const EXPOSURE_TYPES = [
  { matched: "Primary Home Address", severity: "high" as const, previewTemplate: (city: string, state: string) => `123** Main St, ${city || "Los Angeles"}, ${state || "CA"} 900**` },
  { matched: "Contact Phone Number", severity: "high" as const, previewTemplate: () => `(555) ***-${Math.floor(1000 + Math.random() * 9000)}` },
  { matched: "Contact Email Address", severity: "medium" as const, previewTemplate: (email: string) => `${email ? email.substring(0, 5) : "user"}***@${email ? email.split("@")[1] : "gmail.com"}` },
  { matched: "Associated Relative Record", severity: "medium" as const, previewTemplate: () => `Relative: *ane Doe, Age 5*` },
  { matched: "Estimated Age & Birth Year", severity: "low" as const, previewTemplate: () => `${Math.floor(25 + Math.random() * 20)} - ${Math.floor(25 + Math.random() * 20) + 10} Years` },
  { matched: "Historical Address Record", severity: "low" as const, previewTemplate: (city: string, state: string) => `98* Oak Ave, ${city || "San Francisco"}, ${state || "CA"}` }
];

export async function runPrivacyScan(
  userId: string,
  firstName: string,
  lastName: string,
  city: string,
  state: string,
  email: string,
  onStep: (log: string, progress: number) => void
) {
  // Normalize inputs: trim whitespace and casing, sanitize names
  const cleanFirstName = firstName.trim().replace(/[^a-zA-Z]/g, "");
  const cleanLastName = lastName.trim().replace(/[^a-zA-Z]/g, "");
  const cleanCity = city.trim();
  const cleanState = state.trim().toUpperCase();
  const cleanEmail = email.trim();

  // Validate inputs using Zod
  scanInputSchema.parse({
    firstName: cleanFirstName,
    lastName: cleanLastName,
    city: cleanCity,
    state: cleanState,
    email: cleanEmail
  });

  // 1. Generate Query Hash
  const encoder = new TextEncoder();
  const data = encoder.encode(`${firstName.toLowerCase()}|${lastName.toLowerCase()}|${state.toLowerCase()}`);
  
  // In frontend-safe execution we can do a mock hash calculation
  const hash = Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 32);

  // 2. Create Scan Record in DB
  const scan = await db.createScan(userId, "manual", hash);

  const logs = [
    "Initializing search matrices...",
    "Querying Whitepages.com directories...",
    "Matching records on Spokeo databases...",
    "Scanning Radaris.com email registries...",
    "Scanning Intelius.com address logs...",
    "BeenVerified.com registry check...",
    "Filtering relative matching structures...",
    "Hashing parameters to lock logs database...",
    "Compiling exposure profiles..."
  ];

  // 3. Simulate scan updates (wait loops)
  for (let i = 0; i < logs.length; i++) {
    const progress = Math.min(Math.round(((i + 1) / logs.length) * 100), 100);
    onStep(logs[i], progress);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // 4. Generate Random Exposure Data
  // Select between 3 and 7 random brokers to have records
  const numExposures = Math.floor(3 + Math.random() * 5);
  const shuffledBrokers = [...DATA_BROKERS].sort(() => 0.5 - Math.random());
  const selectedBrokers = shuffledBrokers.slice(0, numExposures);

  const results: Omit<DBScanResult, "id" | "found_at">[] = [];
  
  selectedBrokers.forEach((broker) => {
    // Generate 1-2 exposures per selected broker
    const numBrokerExposures = Math.floor(1 + Math.random() * 2);
    const shuffledExposures = [...EXPOSURE_TYPES].sort(() => 0.5 - Math.random());
    const brokerExposures = shuffledExposures.slice(0, numBrokerExposures);

    brokerExposures.forEach((exp) => {
      results.push({
        scan_id: scan.id,
        broker_name: broker,
        record_preview: exp.previewTemplate(cleanEmail || "user@gmail.com", cleanState || "CA"),
        severity: exp.severity,
        match_status: "exposed"
      });
    });
  });

  // Fetch real external integrations (e.g. HIBP) if API key exists or mock fallback
  try {
    const extExposures = await queryExternalPrivacyAPIs(cleanEmail, cleanFirstName, cleanLastName, cleanCity, cleanState);
    extExposures.forEach((ext) => {
      results.push({
        scan_id: scan.id,
        broker_name: ext.broker_name,
        record_preview: ext.record_preview,
        severity: ext.severity,
        match_status: "exposed"
      });
    });
  } catch (err) {
    console.error("External integration query failed:", err);
  }

  // 5. Save results to Database
  for (const res of results) {
    await db.saveScanResult(scan.id, res.broker_name, res.record_preview, res.severity);
  }

  // 6. Update Scan Status to Completed
  await db.updateScanStatus(scan.id, "completed");

  // 7. Sync or Create Removal Requests for the exposed brokers
  const existingRemovals = await db.getRemovalRequests(userId);
  
  for (const res of results) {
    const alreadyExists = existingRemovals.some((r) => r.broker_name === res.broker_name);
    if (!alreadyExists) {
      // Create new removal request as exposed
      await db.createRemovalRequest(
        userId,
        res.broker_name,
        "exposed",
        [`Profile exposure found in scan. Deletion authorization pending.`]
      );
    } else {
      // If it exists but was completed or something, we can reset it if exposed again, 
      // or if it is "exposed" we keep it.
      const matchedRequest = existingRemovals.find((r) => r.broker_name === res.broker_name);
      if (matchedRequest && matchedRequest.current_status === "completed") {
        await db.updateRemovalRequestStatus(
          userId,
          res.broker_name,
          "exposed",
          `Registry re-scanned. Record re-exposed in database directories.`
        );
      }
    }
  }

  // 8. Calculate New Privacy Score using active removals
  // Load actual removal requests statistics to update score
  const updatedRemovals = await db.getRemovalRequests(userId);
  
  // Deduct points according to FRS rules: High = -8, Medium = -3, Low = -1 per active exposure
  let deductions = 0;
  updatedRemovals.forEach((rem) => {
    if (rem.current_status !== "completed") {
      const name = rem.broker_name.toLowerCase();
      if (name.includes("whitepages") || name.includes("spokeo") || name.includes("privateeye")) {
        deductions += 8; // High
      } else if (name.includes("radaris") || name.includes("leakcheck") || name.includes("haveibeenpwned")) {
        deductions += 3; // Medium
      } else {
        deductions += 1; // Low
      }
    }
  });

  const exposedCount = updatedRemovals.filter((r) => r.current_status === "exposed" || r.current_status === "refused").length;
  const pendingCount = updatedRemovals.filter((r) => r.current_status === "processing" || r.current_status === "pending").length;
  const completedCount = updatedRemovals.filter((r) => r.current_status === "completed").length;

  // Retrieve user settings to check Autopilot setting
  const userSettings = await db.getSettings(userId);
  const autopilotBonus = userSettings.autopilot_enabled ? 10 : 0;

  // FRS formula: Base score starts at 100. Minimum capped at 0.
  const rawScore = 100 - deductions + autopilotBonus;
  const finalScore = Math.max(Math.min(rawScore, 100), 0);

  // Save the calculated score
  await db.savePrivacyScore(userId, finalScore, exposedCount, pendingCount, completedCount);

  // Send scan alert email notification
  await sendScanAlertEmail(email, finalScore, results.length);

  return {
    scanId: scan.id,
    exposuresFound: results.length,
    score: finalScore,
    results
  };
}
