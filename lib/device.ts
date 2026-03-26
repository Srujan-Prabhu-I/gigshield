const DEVICE_ID_KEY = "gigshield-device-id"

function uuidv4(): string {
  // Prefer standards-based UUID generation in modern browsers.
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  // Fallback: generate RFC4122-ish UUID v4 using getRandomValues when available.
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)

    // Set version to 4 (0100) and variant to RFC4122 (10xx).
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // Last resort fallback (less ideal randomness, but avoids SSR crashes).
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

// getDeviceId:
// - Reads/writes `localStorage`
// - Generates a UUID if missing
// - Safe to import in SSR; returns '' when called on the server
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return ""
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_ID_KEY)
    if (existing) return existing

    const id = uuidv4()
    window.localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    // If localStorage is blocked/unavailable, still return something usable.
    return uuidv4()
  }
}

