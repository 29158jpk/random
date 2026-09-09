import {
  HardwareItem,
  PCBuild,
  UserPreferences,
  RandomMode,
} from "@/types/hardware";
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
import { checkCompatibility, repairIncompatibleParts } from "./compatibilityEngine";
import { evaluateBuild } from "./luckAndRarity";
import { estimateGameFps } from "./fpsEstimator";

/**
 * Filter pool of hardware items based on preference and maximum price target
 */
function filterPool<T extends HardwareItem>(
  database: T[],
  maxPrice: number,
  filterFn?: (item: T) => boolean
): T[] {
  let filtered = database;
  if (filterFn) {
    const customMatch = database.filter(filterFn);
    if (customMatch.length > 0) {
      filtered = customMatch;
    }
  }

  // Find items within maxPrice, or if none, fallback to lowest price items
  const withinBudget = filtered.filter((item) => item.price <= maxPrice);
  if (withinBudget.length > 0) {
    return withinBudget;
  }

  // Fallback: sort ascending and take cheapest
  const sorted = [...filtered].sort((a, b) => a.price - b.price);
  return sorted.slice(0, 2);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Generate a randomized PC build that satisfies user preferences, budget, and compatibility
 */
export function generateRandomBuild(
  preferences: UserPreferences,
  variant: "normal" | "better" | "cheaper" = "normal"
): PCBuild {
  const { budget, cpuBrand, gpuBrand, ramSize, storageSize, caseStyle, mode, usage, resolution, selectedGames } =
    preferences;

  // Set target spending based on mode and reroll variant
  let targetSpendMax = budget;
  if (variant === "cheaper") {
    targetSpendMax = Math.round(budget * 0.82); // Force budget saving
  }

  // Allocate budget percentages
  let gpuRatio = 0.38;
  let cpuRatio = 0.22;

  if (usage === "gaming") {
    gpuRatio = 0.44;
    cpuRatio = 0.20;
  } else if (usage === "streaming" || usage === "editing" || usage === "programming") {
    gpuRatio = 0.32;
    cpuRatio = 0.28;
  } else if (usage === "work") {
    gpuRatio = 0.25;
    cpuRatio = 0.30;
  }

  if (variant === "better" || mode === "performance") {
    gpuRatio += 0.05;
  }

  // 1. Pick CPU
  const cpuBudget = targetSpendMax * cpuRatio;
  const cpuCandidates = filterPool(CPU_DATABASE, cpuBudget, (item) => {
    if (cpuBrand === "AMD") return item.brand === "AMD";
    if (cpuBrand === "Intel") return item.brand === "Intel";
    return true;
  });
  let cpu = pickRandom(cpuCandidates);

  // 2. Pick Motherboard compatible with CPU socket
  const moboBudget = targetSpendMax * 0.14;
  const moboCandidates = filterPool(
    MOTHERBOARD_DATABASE,
    moboBudget,
    (item) => item.socket === cpu.socket
  );
  let motherboard = pickRandom(moboCandidates);

  // 3. Pick RAM matching Motherboard memory type (DDR4 vs DDR5)
  const ramBudget = targetSpendMax * 0.10;
  const ramCandidates = filterPool(RAM_DATABASE, ramBudget, (item) => {
    const memoryMatch = item.memoryType === motherboard.memoryType;
    if (ramSize === "16GB") return memoryMatch && item.name.includes("16GB");
    if (ramSize === "32GB") return memoryMatch && item.name.includes("32GB");
    if (ramSize === "64GB") return memoryMatch && item.name.includes("64GB");
    return memoryMatch;
  });
  let ram = pickRandom(ramCandidates);

  // 4. Pick GPU
  const gpuBudget = targetSpendMax * gpuRatio;
  const gpuCandidates = filterPool(GPU_DATABASE, gpuBudget, (item) => {
    if (gpuBrand === "NVIDIA") return item.brand === "NVIDIA";
    if (gpuBrand === "AMD") return item.brand === "AMD";
    if (gpuBrand === "Intel") return item.brand === "Intel";
    return true;
  });
  let gpu = pickRandom(gpuCandidates);

  // 5. Pick Storage
  const storageBudget = targetSpendMax * 0.08;
  const storageCandidates = filterPool(STORAGE_DATABASE, storageBudget, (item) => {
    if (storageSize === "500GB") return item.name.includes("500GB");
    if (storageSize === "1TB") return item.name.includes("1TB");
    if (storageSize === "2TB") return item.name.includes("2TB");
    if (storageSize === "4TB") return item.name.includes("4TB");
    return true;
  });
  let storage = pickRandom(storageCandidates);

  // 6. Pick Cooler
  const coolerBudget = targetSpendMax * 0.06;
  const coolerCandidates = filterPool(COOLER_DATABASE, coolerBudget, (item) => {
    if (cpu.power > 105) {
      return item.price > 0 && item.performanceTier >= 7; // Needs aftermarket
    }
    return true;
  });
  let cooler = pickRandom(coolerCandidates);

  // 7. Pick Case
  const caseBudget = targetSpendMax * 0.07;
  const caseCandidates = filterPool(CASE_DATABASE, caseBudget, (item) => {
    if (caseStyle !== "No Preference") {
      return item.caseStyle === caseStyle;
    }
    return true;
  });
  let pcCase = pickRandom(caseCandidates);

  // 8. Pick PSU capable of handling system power
  const estPower = cpu.power + gpu.power + 120;
  const psuBudget = targetSpendMax * 0.08;
  const psuCandidates = filterPool(PSU_DATABASE, psuBudget, (item) => item.power >= estPower);
  let psu = pickRandom(psuCandidates);

  // Check and Repair Compatibility
  let buildParts = {
    cpu,
    gpu,
    motherboard,
    ram,
    storage,
    psu,
    cooler,
    case: pcCase,
  };

  const initialCheck = checkCompatibility(buildParts);
  if (!initialCheck.isCompatible) {
    buildParts = repairIncompatibleParts(buildParts, budget);
  }

  // Calculate Total Price
  let totalPrice =
    buildParts.cpu.price +
    buildParts.gpu.price +
    buildParts.motherboard.price +
    buildParts.ram.price +
    buildParts.storage.price +
    buildParts.psu.price +
    buildParts.cooler.price +
    buildParts.case.price;

  // Strict Budget Guarantee: if total exceeds user budget, downgrade non-essential parts
  if (totalPrice > budget) {
    // If case is high end, downgrade case first
    if (buildParts.case.price > 1600) {
      const cheapCases = CASE_DATABASE.filter((c) => c.price <= 1600);
      if (cheapCases.length > 0) buildParts.case = cheapCases[0];
    }
    // If cooler is costly and cpu is < 105w, downgrade cooler
    if (buildParts.cooler.price > 1000 && buildParts.cpu.power <= 65) {
      buildParts.cooler = COOLER_DATABASE[0];
    }
    // Re-sum
    totalPrice =
      buildParts.cpu.price +
      buildParts.gpu.price +
      buildParts.motherboard.price +
      buildParts.ram.price +
      buildParts.storage.price +
      buildParts.psu.price +
      buildParts.cooler.price +
      buildParts.case.price;
  }

  // Evaluation, Luck, Rarity
  const evaluation = evaluateBuild(buildParts, totalPrice, budget, mode);

  // FPS Estimation
  const estimatedFps = estimateGameFps(
    buildParts.gpu,
    buildParts.cpu,
    resolution,
    selectedGames
  );

  // Natural Language Build Analysis (in Thai)
  const highlights: string[] = [
    `ขุมพลัง CPU ${buildParts.cpu.name} (${buildParts.cpu.specs.split(",")[0]})`,
    `กราฟิกการ์ด ${buildParts.gpu.name} พลังขับเกมระดับ ${buildParts.gpu.badge || "แรงคุ้มค่า"}`,
    `แรม ${buildParts.ram.name} และ SSD ${buildParts.storage.name}`,
    `พาวเวอร์ซัพพลาย ${buildParts.psu.name} จ่ายไฟนิ่งหายห่วง`,
  ];

  let suitability = "";
  if (usage === "gaming") {
    suitability = `Build นี้ออกแบบเพื่อการเล่นเกม ${resolution} โดยเฉพาะ ดึงเฟรมเรตได้สูงและตอบสนองเร็วในเกมยอดนิยม`;
  } else if (usage === "streaming") {
    suitability = `Build นี้มีขุมพลังการ์ดจอและซีพียูที่รองรับการเล่นเกมพร้อมถ่ายทอดสด (Streaming) ได้ลื่นไหล`;
  } else if (usage === "editing") {
    suitability = `Build นี้เหมาะสำหรับตัดต่อวิดีโอ เรนเดอร์กราฟิก และงานคอนเทนต์ครีเอเตอร์อย่างลงตัว`;
  } else if (usage === "programming") {
    suitability = `Build นี้จัดเต็มเรื่องความเร็ว Compile และความเสถียรสำหรับเหล่านักพัฒนาซอฟต์แวร์`;
  } else {
    suitability = `Build ครอบจักรวาล All-Around ทำงานหนัก เล่นเกมกราฟิกสวย และใช้งานบันเทิงได้ครบจบในเครื่องเดียว`;
  }

  const summary = `คอมพิวเตอร์จัดสเปกอัตโนมัติในงบ ฿${budget.toLocaleString()} สรุปราคาจริง ฿${totalPrice.toLocaleString()} (ประหยัดได้ ฿${Math.max(
    0,
    budget - totalPrice
  ).toLocaleString()}) ได้คะแนนความแรง ${evaluation.scores.performance}/100 และความคุ้มค่า ${evaluation.scores.value}/100`;

  // Build Name Generator
  const namePrefixes = [
    "Horizon Cyber",
    "Horizon Storm",
    "Apex Velocity",
    "Phantom Phantom",
    "Quantum Horizon",
    "Titan Strike",
    "Horizon Valkyrie",
    "Aero Pulse",
  ];
  const chosenPrefix = pickRandom(namePrefixes);
  const buildName = `${chosenPrefix} ${buildParts.gpu.name.split(" ")[2] || "Custom"}`;

  return {
    id: `build-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: buildName,
    timestamp: Date.now(),
    cpu: buildParts.cpu,
    gpu: buildParts.gpu,
    motherboard: buildParts.motherboard,
    ram: buildParts.ram,
    storage: buildParts.storage,
    psu: buildParts.psu,
    cooler: buildParts.cooler,
    case: buildParts.case,
    totalPrice,
    budget,
    totalPowerWatts: buildParts.cpu.power + buildParts.gpu.power + 120,
    scores: evaluation.scores,
    luckScore: evaluation.luckScore,
    luckTier: evaluation.luckTier,
    rarity: evaluation.rarity,
    specialBuild: evaluation.specialBuild,
    analysis: {
      summary,
      highlights,
      suitability,
    },
    estimatedFps,
  };
}
