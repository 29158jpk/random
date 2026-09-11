import { PCBuild, HardwareItem, UsageType, SocketType, MemoryType, FormFactor, CaseStyle } from "./hardware";

export type { PCBuild };
export type UserRole = "user" | "admin";
export type UserStatus = "active" | "suspended";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  last_active: string;
}

export interface MemberListItem extends UserProfile {
  totalRandoms: number;
  savedBuildsCount: number;
  highestLuck: number;
}

export interface MemberDetailStats {
  totalRandomBuilds: number;
  savedBuilds: number;
  historyCount: number;
  highestLuck: number;
  highestScore: number;
  legendaryBuilds: number;
  mythicBuilds: number;
}

export interface MemberDetail extends UserProfile {
  stats: MemberDetailStats;
  recentRandomBuilds: PCBuild[];
  recentSavedBuilds: PCBuild[];
}

export interface AdminDashboardStats {
  totalMembers: number;
  totalRandomBuilds: number;
  savedBuilds: number;
  totalHistory: number;
  challengeParticipants: number;
  legendaryBuilds: number;
  mythicBuilds: number;
  highestLuck: number;
}

export interface AdminLog {
  id: string;
  admin_id: string;
  admin_email?: string | null;
  action: string;
  target_user_id?: string | null;
  target_resource: string;
  details?: Record<string, unknown> | null;
  created_at: string;
}

export type ActivityType =
  | "login"
  | "random_pc"
  | "save_build"
  | "delete_build"
  | "join_challenge";

export interface MemberActivity {
  id: string;
  user_id: string;
  username?: string;
  activity_type: ActivityType;
  description: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface HardwareItemDB extends HardwareItem {
  status: "active" | "disabled";
  created_at?: string;
  updated_at?: string;
}

export interface DailyChallengeDB {
  id: string;
  title: string;
  description: string;
  budget: number;
  usage: UsageType;
  target_score: number;
  start_date: string;
  end_date: string;
  status: "active" | "disabled" | "expired";
  constraints: {
    cpuBrand?: "AMD" | "Intel";
    gpuBrand?: "NVIDIA" | "AMD" | "Intel";
    caseStyle?: CaseStyle;
    minRamGb?: number;
    specialGoal?: string;
  };
  reward_title: string;
  participants_count?: number;
  created_at: string;
}

export interface ChallengeParticipantDB {
  id: string;
  challenge_id: string;
  user_id: string;
  username?: string;
  build_id?: string | null;
  score: number;
  luck_score: number;
  created_at: string;
}
