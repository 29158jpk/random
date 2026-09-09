import { HardwareItem, ResolutionType } from "@/types/hardware";

interface GameSpec {
  name: string;
  category: "esports" | "aaa" | "sandbox" | "heavy";
  baseFps1080pTier7: number;
}

const GAME_SPECS: Record<string, GameSpec> = {
  "Valorant": { name: "Valorant", category: "esports", baseFps1080pTier7: 380 },
  "Counter-Strike 2": { name: "Counter-Strike 2", category: "esports", baseFps1080pTier7: 240 },
  "GTA V": { name: "GTA V", category: "sandbox", baseFps1080pTier7: 150 },
  "GTA VI": { name: "GTA VI (Est.)", category: "heavy", baseFps1080pTier7: 65 },
  "Minecraft": { name: "Minecraft", category: "sandbox", baseFps1080pTier7: 280 },
  "Roblox": { name: "Roblox", category: "sandbox", baseFps1080pTier7: 200 },
  "Fortnite": { name: "Fortnite", category: "esports", baseFps1080pTier7: 210 },
  "PUBG": { name: "PUBG: BATTLEGROUNDS", category: "esports", baseFps1080pTier7: 165 },
  "Apex Legends": { name: "Apex Legends", category: "esports", baseFps1080pTier7: 190 },
  "Call of Duty": { name: "Call of Duty: Warzone", category: "aaa", baseFps1080pTier7: 125 },
};

export function estimateGameFps(
  gpu: HardwareItem,
  cpu: HardwareItem,
  resolution: ResolutionType,
  selectedGames: string[]
): {
  game: string;
  fps: number;
  playableTier: "Ultra" | "High" | "Medium" | "Playable";
}[] {
  // If user selected games, use them. Otherwise default to 4 popular titles
  const gamesToTest =
    selectedGames.length > 0
      ? selectedGames
      : ["Valorant", "Counter-Strike 2", "Apex Legends", "GTA V"];

  const resMultiplier =
    resolution === "4k" ? 0.45 : resolution === "1440p" ? 0.72 : 1.0;

  return gamesToTest.map((gameName) => {
    const spec = GAME_SPECS[gameName] || {
      name: gameName,
      category: "aaa",
      baseFps1080pTier7: 140,
    };

    // Calculate FPS based on GPU & CPU power
    let factor = 1.0;
    if (spec.category === "esports") {
      // Esports games are more CPU dependent
      factor = (cpu.performanceTier * 0.45 + gpu.performanceTier * 0.55) / 7.0;
    } else {
      // AAA and heavy titles are heavily GPU dependent
      factor = (gpu.performanceTier * 0.75 + cpu.performanceTier * 0.25) / 7.0;
    }

    // High resolution scaling check
    if (resolution === "4k" && (gpu.vram || 8) < 12) {
      factor *= 0.85; // VRAM bottleneck penalty at 4k
    }

    const calculatedFps = Math.max(
      30,
      Math.round(spec.baseFps1080pTier7 * factor * resMultiplier)
    );

    let playableTier: "Ultra" | "High" | "Medium" | "Playable" = "Playable";
    if (calculatedFps >= 144) playableTier = "Ultra";
    else if (calculatedFps >= 90) playableTier = "High";
    else if (calculatedFps >= 60) playableTier = "Medium";

    return {
      game: spec.name,
      fps: calculatedFps,
      playableTier,
    };
  });
}
