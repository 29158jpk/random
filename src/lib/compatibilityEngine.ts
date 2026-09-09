import { HardwareItem, SocketType, MemoryType, FormFactor } from "@/types/hardware";
import {
  CPU_DATABASE,
  GPU_DATABASE,
  MOTHERBOARD_DATABASE,
  RAM_DATABASE,
  STORAGE_DATABASE,
  PSU_DATABASE,
  COOLER_DATABASE,
  CASE_DATABASE,
} from "@/data/hardware";

export interface CompatibilityResult {
  isCompatible: boolean;
  issues: string[];
}

export function checkCompatibility(parts: {
  cpu: HardwareItem;
  gpu: HardwareItem;
  motherboard: HardwareItem;
  ram: HardwareItem;
  storage: HardwareItem;
  psu: HardwareItem;
  cooler: HardwareItem;
  case: HardwareItem;
}): CompatibilityResult {
  const issues: string[] = [];

  // 1. CPU & Motherboard Socket
  if (parts.cpu.socket !== parts.motherboard.socket) {
    issues.push(
      `CPU socket (${parts.cpu.socket}) is incompatible with Motherboard socket (${parts.motherboard.socket})`
    );
  }

  // 2. RAM & Motherboard Memory Type
  if (parts.ram.memoryType !== parts.motherboard.memoryType) {
    issues.push(
      `RAM type (${parts.ram.memoryType}) does not match Motherboard (${parts.motherboard.memoryType})`
    );
  }

  // 3. Cooler & CPU Socket / TDP
  if (
    parts.cooler.supportedSockets &&
    parts.cpu.socket &&
    !parts.cooler.supportedSockets.includes(parts.cpu.socket as SocketType)
  ) {
    issues.push(
      `Cooler does not support CPU socket ${parts.cpu.socket}`
    );
  }

  // High TDP CPU needs adequate cooling
  if (parts.cpu.power >= 120 && parts.cooler.id === "cooler-stock") {
    issues.push(
      `High TDP CPU (${parts.cpu.power}W) requires dedicated aftermarket cooling`
    );
  }

  // 4. Power Supply (PSU) Capacity
  const estimatedPower = parts.cpu.power + parts.gpu.power + 120; // +120W for mobo, ram, fans, drives
  if (parts.psu.power < estimatedPower) {
    issues.push(
      `PSU wattage (${parts.psu.power}W) is insufficient for estimated system draw (~${estimatedPower}W)`
    );
  }

  // 5. Case & Motherboard Form Factor
  if (parts.case.formFactor === "Micro-ATX" && parts.motherboard.formFactor === "ATX") {
    issues.push(
      `ATX Motherboard does not fit into Micro-ATX Case`
    );
  }

  return {
    isCompatible: issues.length === 0,
    issues,
  };
}

/**
 * Intelligent Single-Part Repair:
 * If a build has compatibility issues, reroll only the conflicting parts
 * without restarting the entire build!
 */
export function repairIncompatibleParts(
  currentParts: {
    cpu: HardwareItem;
    gpu: HardwareItem;
    motherboard: HardwareItem;
    ram: HardwareItem;
    storage: HardwareItem;
    psu: HardwareItem;
    cooler: HardwareItem;
    case: HardwareItem;
  },
  maxBudget: number
): {
  cpu: HardwareItem;
  gpu: HardwareItem;
  motherboard: HardwareItem;
  ram: HardwareItem;
  storage: HardwareItem;
  psu: HardwareItem;
  cooler: HardwareItem;
  case: HardwareItem;
} {
  const parts = { ...currentParts };

  // Repair Motherboard if socket mismatch
  if (parts.motherboard.socket !== parts.cpu.socket) {
    const validMobos = MOTHERBOARD_DATABASE.filter(
      (m) => m.socket === parts.cpu.socket
    );
    if (validMobos.length > 0) {
      parts.motherboard = validMobos[Math.floor(Math.random() * validMobos.length)];
    }
  }

  // Repair RAM if memoryType mismatch with motherboard
  if (parts.ram.memoryType !== parts.motherboard.memoryType) {
    const validRams = RAM_DATABASE.filter(
      (r) => r.memoryType === parts.motherboard.memoryType
    );
    if (validRams.length > 0) {
      parts.ram = validRams[Math.floor(Math.random() * validRams.length)];
    }
  }

  // Repair Cooler if stock cooler on hot CPU
  if (parts.cpu.power >= 120 && parts.cooler.id === "cooler-stock") {
    const aftermarketCoolers = COOLER_DATABASE.filter(
      (c) => c.price > 0 && c.performanceTier >= 6
    );
    if (aftermarketCoolers.length > 0) {
      parts.cooler = aftermarketCoolers[Math.floor(Math.random() * aftermarketCoolers.length)];
    }
  }

  // Repair PSU if wattage underpowered
  const estimatedPower = parts.cpu.power + parts.gpu.power + 120;
  if (parts.psu.power < estimatedPower) {
    const validPsus = PSU_DATABASE.filter((p) => p.power >= estimatedPower);
    if (validPsus.length > 0) {
      // Pick the most economical valid PSU
      validPsus.sort((a, b) => a.price - b.price);
      parts.psu = validPsus[0];
    }
  }

  // Repair Case if form factor conflicts
  if (parts.case.formFactor === "Micro-ATX" && parts.motherboard.formFactor === "ATX") {
    const atxCases = CASE_DATABASE.filter((c) => c.formFactor === "ATX");
    if (atxCases.length > 0) {
      parts.case = atxCases[Math.floor(Math.random() * atxCases.length)];
    }
  }

  return parts;
}
