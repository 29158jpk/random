export type ComponentCategory =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "cooler"
  | "case";

export type SocketType = "AM4" | "AM5" | "LGA1700" | "LGA1851";
export type MemoryType = "DDR4" | "DDR5";
export type FormFactor = "ATX" | "Micro-ATX" | "Mini-ITX";
export type CaseStyle = "Black" | "White" | "RGB" | "Minimal" | "Gaming";

export interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  category: ComponentCategory;
  price: number; // in Thai Baht (฿)
  performanceTier: number; // 1 to 10 scale
  power: number; // Watts TDP / consumption
  socket?: SocketType;
  memoryType?: MemoryType;
  vram?: number; // GB for GPU
  formFactor?: FormFactor;
  supportedSockets?: SocketType[];
  caseStyle?: CaseStyle;
  specs: string;
  badge?: string;
}

export type UsageType =
  | "gaming"
  | "streaming"
  | "work"
  | "editing"
  | "programming"
  | "all_around";

export type ResolutionType = "1080p" | "1440p" | "4k";

export type RandomMode = "normal" | "chaos" | "budget" | "performance" | "lucky";

export type RarityTier = "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";

export type LuckTier =
  | "Unlucky"
  | "Normal"
  | "Lucky"
  | "Very Lucky"
  | "INSANE LUCK";

export type SpecialBuildType =
  | "God Build"
  | "Ultra Value"
  | "Dream Build"
  | "FPS Monster"
  | "Budget King"
  | "Meme Build";

export interface UserPreferences {
  budget: number;
  usage: UsageType;
  selectedGames: string[];
  resolution: ResolutionType;
  cpuBrand: "AMD" | "Intel" | "No Preference";
  gpuBrand: "NVIDIA" | "AMD" | "Intel" | "No Preference";
  ramSize: "16GB" | "32GB" | "64GB" | "No Preference";
  storageSize: "500GB" | "1TB" | "2TB" | "4TB" | "No Preference";
  caseStyle: CaseStyle | "No Preference";
  mode: RandomMode;
}

export interface PCBuild {
  id: string;
  name: string;
  timestamp: number;
  cpu: HardwareItem;
  gpu: HardwareItem;
  motherboard: HardwareItem;
  ram: HardwareItem;
  storage: HardwareItem;
  psu: HardwareItem;
  cooler: HardwareItem;
  case: HardwareItem;
  totalPrice: number;
  budget: number;
  totalPowerWatts: number;
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
  analysis: {
    summary: string;
    highlights: string[];
    suitability: string;
  };
  estimatedFps: {
    game: string;
    fps: number;
    playableTier: "Ultra" | "High" | "Medium" | "Playable";
  }[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  targetBudget: number;
  targetUsage: UsageType;
  constraints: {
    cpuBrand?: "AMD" | "Intel";
    gpuBrand?: "NVIDIA" | "AMD" | "Intel";
    caseStyle?: CaseStyle;
    minRamGb?: number;
    specialGoal?: string;
  };
  rewardTitle: string;
}
