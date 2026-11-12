/** Detects weak devices / constrained networks so the hero can stay light. */
type NetInfo = { saveData?: boolean; effectiveType?: string };

export type DeviceProfile = {
  lowEnd: boolean;
  saveData: boolean;
  reasons: string[];
};

export function getDeviceProfile(): DeviceProfile {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: NetInfo };
  const reasons: string[] = [];
  const cores = nav.hardwareConcurrency;
  const memory = nav.deviceMemory;
  const conn = nav.connection;
  const saveData = !!conn?.saveData;

  if (typeof cores === "number" && cores > 0 && cores < 4) reasons.push(`hardwareConcurrency=${cores}`);
  if (typeof memory === "number" && memory < 4) reasons.push(`deviceMemory=${memory}`);
  if (saveData) reasons.push("saveData");
  if (conn?.effectiveType && ["slow-2g", "2g", "3g"].includes(conn.effectiveType)) {
    reasons.push(`effectiveType=${conn.effectiveType}`);
  }

  // Testing helper: ?lowend=1 simulates a weak phone
  if (new URLSearchParams(window.location.search).get("lowend") === "1") reasons.push("?lowend=1");

  return { lowEnd: reasons.length > 0, saveData, reasons };
}
