import { ComponentCategory } from "@/types/hardware";

/**
 * Returns a reliable image URL for a hardware component.
 * If custom image_url is provided, it is returned.
 * Otherwise returns a themed SVG data URI placeholder.
 */
export function getHardwareImageUrl(item?: {
  image_url?: string;
  category?: ComponentCategory;
  name?: string;
  brand?: string;
}): string {
  if (item?.image_url && item.image_url.trim().length > 0) {
    return item.image_url;
  }

  const category = item?.category || "cpu";
  const name = item?.name || "Component";

  // Themed color palettes per category
  const themeMap: Record<ComponentCategory, { bg1: string; bg2: string; accent: string; label: string }> = {
    cpu: { bg1: "#0f172a", bg2: "#1e293b", accent: "#38bdf8", label: "CPU PROCESSOR" },
    gpu: { bg1: "#091e3a", bg2: "#0f2744", accent: "#10b981", label: "GRAPHICS CARD" },
    motherboard: { bg1: "#1e1b4b", bg2: "#2e1065", accent: "#a855f7", label: "MOTHERBOARD" },
    ram: { bg1: "#172554", bg2: "#1e3a8a", accent: "#60a5fa", label: "MEMORY RAM" },
    storage: { bg1: "#042f2e", bg2: "#115e59", accent: "#2dd4bf", label: "NVME SSD" },
    psu: { bg1: "#451a03", bg2: "#78350f", accent: "#fbbf24", label: "POWER SUPPLY" },
    cooler: { bg1: "#082f49", bg2: "#0369a1", accent: "#38bdf8", label: "CPU COOLER" },
    case: { bg1: "#18181b", bg2: "#27272a", accent: "#f43f5e", label: "CHASSIS CASE" },
  };

  const theme = themeMap[category] || themeMap.cpu;
  const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").substring(0, 24);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}"/>
        <stop offset="100%" stop-color="${theme.bg2}"/>
      </linearGradient>
      <linearGradient id="acc" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${theme.accent}"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.8"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <circle cx="200" cy="120" r="55" fill="none" stroke="${theme.accent}" stroke-width="2" stroke-dasharray="6,4" opacity="0.4"/>
    <circle cx="200" cy="120" r="42" fill="rgba(255,255,255,0.03)" stroke="${theme.accent}" stroke-width="1.5" opacity="0.7"/>
    <text x="200" y="128" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="900" fill="${theme.accent}" text-anchor="middle">⚙️</text>
    <rect x="130" y="195" width="140" height="22" rx="11" fill="rgba(0,0,0,0.4)" stroke="${theme.accent}" stroke-width="1" stroke-opacity="0.3"/>
    <text x="200" y="210" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="10" font-weight="800" fill="${theme.accent}" text-anchor="middle" letter-spacing="2">${theme.label}</text>
    <text x="200" y="248" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">${safeName}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
