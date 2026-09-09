import {
  HardwareItem,
  LuckTier,
  RarityTier,
  SpecialBuildType,
  RandomMode,
} from "@/types/hardware";

export interface BuildEvaluation {
  scores: {
    performance: number; // 0-100
    value: number; // 0-100
    compatibility: number; // 100
    overall: number; // 0-100
  };
  luckScore: number; // 0-100
  luckTier: LuckTier;
  rarity: RarityTier;
  specialBuild?: {
    type: SpecialBuildType;
    badge: string;
    description: string;
  };
}

export function evaluateBuild(
  parts: {
    cpu: HardwareItem;
    gpu: HardwareItem;
    motherboard: HardwareItem;
    ram: HardwareItem;
    storage: HardwareItem;
    psu: HardwareItem;
    cooler: HardwareItem;
    case: HardwareItem;
  },
  totalPrice: number,
  budget: number,
  mode: RandomMode = "normal"
): BuildEvaluation {
  // 1. Calculate Raw Performance Score (weighted heavily towards GPU & CPU)
  const gpuWeight = 0.45;
  const cpuWeight = 0.25;
  const ramWeight = 0.12;
  const storageWeight = 0.08;
  const otherWeight = 0.10;

  const otherAvgTier =
    (parts.motherboard.performanceTier +
      parts.psu.performanceTier +
      parts.cooler.performanceTier +
      parts.case.performanceTier) /
    4;

  const weightedTier =
    parts.gpu.performanceTier * gpuWeight +
    parts.cpu.performanceTier * cpuWeight +
    parts.ram.performanceTier * ramWeight +
    parts.storage.performanceTier * storageWeight +
    otherAvgTier * otherWeight;

  // Scale 1-10 tier to 0-100
  const performance = Math.min(100, Math.round(weightedTier * 10));

  // 2. Calculate Value Score
  // Ratio of performance relative to money spent
  const spentRatio = totalPrice / Math.max(1, budget);
  let valueBase = (performance / Math.max(0.4, spentRatio)) * 0.95;
  if (totalPrice < budget * 0.9) {
    valueBase += 8; // bonus for under budget
  }
  const value = Math.min(99, Math.max(45, Math.round(valueBase)));

  // Compatibility is guaranteed 100% by our engine
  const compatibility = 100;

  // Overall Score
  const overall = Math.round(performance * 0.5 + value * 0.35 + compatibility * 0.15);

  // 3. Luck Calculation (0-100)
  // Combines how well the parts over-perform the budget + RNG factor
  let modeBonus = 0;
  if (mode === "lucky") modeBonus = 15;
  if (mode === "chaos") modeBonus = Math.floor(Math.random() * 20) - 5;

  const savingsRate = Math.max(0, (budget - totalPrice) / budget);
  const perfBonus = performance > 85 ? 12 : performance > 70 ? 6 : 0;
  const randomRng = Math.floor(Math.random() * 30);

  let rawLuck = 50 + Math.round(savingsRate * 30) + perfBonus + randomRng + modeBonus;

  // Chance of super jackpot luck
  if (Math.random() < (mode === "lucky" ? 0.2 : 0.07)) {
    rawLuck = 96 + Math.floor(Math.random() * 5); // 96-100
  }

  const luckScore = Math.min(100, Math.max(12, rawLuck));

  // Determine Luck Tier
  let luckTier: LuckTier = "Normal";
  if (luckScore <= 30) luckTier = "Unlucky";
  else if (luckScore <= 60) luckTier = "Normal";
  else if (luckScore <= 80) luckTier = "Lucky";
  else if (luckScore <= 95) luckTier = "Very Lucky";
  else luckTier = "INSANE LUCK";

  // 4. Rarity System
  let rarity: RarityTier = "Common";
  if (overall >= 93 || luckScore >= 95) {
    rarity = luckScore >= 97 ? "Mythic" : "Legendary";
  } else if (overall >= 84 || luckScore >= 80) {
    rarity = "Epic";
  } else if (overall >= 72 || luckScore >= 60) {
    rarity = "Rare";
  } else {
    rarity = "Common";
  }

  // 5. Special Build Detection
  let specialBuild: BuildEvaluation["specialBuild"] = undefined;

  // Check Meme Build first (extreme disparity, e.g. i9 with GTX 1650 or 64GB RAM on budget)
  if (
    (parts.cpu.performanceTier >= 9.5 && parts.gpu.performanceTier <= 4) ||
    (parts.ram.id === "ram-64-d5" && totalPrice < 45000)
  ) {
    specialBuild = {
      type: "Meme Build",
      badge: "🤡 MEME BUILD",
      description: "คู่หูสเปกพิสดารที่ไม่มีใครคาดคิด แต่ดันใช้งานได้จริง!",
    };
  }
  // God Build: Top tier parts with massive luck
  else if (luckScore >= 94 && performance >= 88) {
    specialBuild = {
      type: "God Build",
      badge: "🔥 GOD BUILD!",
      description: "You got an extremely high-value build! สเปกระดับเทพประทาน เกินงบแต่ได้จริง!",
    };
  }
  // FPS Monster: Heavy focus on high-tier GPU
  else if (parts.gpu.performanceTier >= 9 && parts.cpu.performanceTier >= 7) {
    specialBuild = {
      type: "FPS Monster",
      badge: "⚡ FPS MONSTER",
      description: "การ์ดจอดุดัน พลังขับเฟรมเรตระดับสูงสุด ลื่นหัวแตกทุกความละเอียด!",
    };
  }
  // Ultra Value: High performance, substantial budget leftover
  else if (value >= 92 && totalPrice <= budget * 0.92) {
    specialBuild = {
      type: "Ultra Value",
      badge: "💎 ULTRA VALUE",
      description: "สเปกสุดคุ้มค่าระดับเพชร เม็ดเงินทุกบาทแปลงเป็นความแรงอย่างคุ้มที่สุด!",
    };
  }
  // Dream Build: Premium cooling, high RAM, top case aesthetics
  else if (
    (parts.cooler.id.includes("aio") || parts.cooler.id.includes("kraken")) &&
    parts.case.price >= 3000 &&
    parts.ram.performanceTier >= 8
  ) {
    specialBuild = {
      type: "Dream Build",
      badge: "👑 DREAM BUILD",
      description: "ชุดคอมในฝัน สวยระดับประกวด พร้อมชุดน้ำและเคสพรีเมียม!",
    };
  }
  // Budget King: Budget <= 25k but maxed 1080p performance
  else if (budget <= 25000 && performance >= 65) {
    specialBuild = {
      type: "Budget King",
      badge: "💰 BUDGET KING",
      description: "ราชาคอมประหยัด บีบประสิทธิภาพได้เกินราคา สบายกระเป๋า!",
    };
  }

  return {
    scores: {
      performance,
      value,
      compatibility,
      overall,
    },
    luckScore,
    luckTier,
    rarity,
    specialBuild,
  };
}
