"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  PCBuild,
  UserPreferences,
  DailyChallenge,
} from "@/types/hardware";
import { generateRandomBuild } from "@/lib/randomEngine";
import { playJackpotSound, playClickSound } from "@/lib/soundEffects";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { RandomPanel } from "@/components/RandomPanel";
import { SlotAnimation } from "@/components/SlotAnimation";
import { PCResultCard } from "@/components/PCResultCard";
import { DailyChallengeModal } from "@/components/DailyChallengeModal";
import { CollectionModal } from "@/components/CollectionModal";
import { HistoryModal } from "@/components/HistoryModal";
import { AuthModal } from "@/components/AuthModal";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";

// Seeded Daily Challenge based on date
function getTodayChallenge(): DailyChallenge {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );

  const challenges: Omit<DailyChallenge, "id" | "date">[] = [
    {
      title: "Best Gaming PC Under ฿25,000",
      description: "จัดคอมเล่นเกมสุดคุ้มในงบไม่เกิน 25,000 บาท ให้ได้คะแนน Performance เกิน 65+ และมี Luck Score สูงสุด!",
      targetBudget: 25000,
      targetUsage: "gaming",
      constraints: {
        specialGoal: "รีดเฟรมเรตและประหยัดงบให้คุ้มที่สุด",
      },
      rewardTitle: "Budget Gaming Conqueror",
    },
    {
      title: "White RGB Gaming Aesthetic",
      description: "จัดชุดคอมตีมสีขาวพร้อมไฟ RGB สุดตระการตา ในงบไม่เกิน 40,000 บาท คุมโทนสวยงามสะกดทุกสายตา",
      targetBudget: 40000,
      targetUsage: "gaming",
      constraints: {
        caseStyle: "White",
      },
      rewardTitle: "Aesthetic White Master",
    },
    {
      title: "AMD Red Team Pure Power",
      description: "จัดสเปกคอมขุมพลังค่ายแดงล้วนทั้ง CPU AMD Ryzen และ GPU Radeon ในงบไม่เกิน 35,000 บาท",
      targetBudget: 35000,
      targetUsage: "gaming",
      constraints: {
        cpuBrand: "AMD",
        gpuBrand: "AMD",
      },
      rewardTitle: "Red Team Enthusiast",
    },
    {
      title: "Content Creator & Streaming Beast",
      description: "จัดสเปกคอมสำหรับสตรีมเกมและตัดต่อวิดีโอ 4K ในงบไม่เกิน 50,000 บาท พร้อมแรมและ SSD ความเร็วสูง",
      targetBudget: 50000,
      targetUsage: "streaming",
      constraints: {
        specialGoal: "รองรับ Multitasking และ NVENC/AV1 encoding",
      },
      rewardTitle: "Streaming Titan",
    },
  ];

  const selected = challenges[dayOfYear % challenges.length];

  return {
    id: `challenge-${dateStr}`,
    date: dateStr,
    ...selected,
  };
}

function HomeContent() {
  const { isAuthenticated, user, session, openAuthModal } = useAuth();

  const [preferences, setPreferences] = useState<UserPreferences>({
    budget: 30000,
    usage: "gaming",
    selectedGames: ["Valorant", "GTA V", "Apex Legends"],
    resolution: "1080p",
    cpuBrand: "No Preference",
    gpuBrand: "No Preference",
    ramSize: "No Preference",
    storageSize: "No Preference",
    caseStyle: "No Preference",
    mode: "normal",
  });

  const [currentBuild, setCurrentBuild] = useState<PCBuild | null>(null);
  const [pendingBuild, setPendingBuild] = useState<PCBuild | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isDailyOpen, setIsDailyOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Storage state bound to user
  const [savedBuilds, setSavedBuilds] = useState<PCBuild[]>([]);
  const [historyBuilds, setHistoryBuilds] = useState<PCBuild[]>([]);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge>(getTodayChallenge());

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync user-specific builds on auth change
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setSavedBuilds([]);
      setHistoryBuilds([]);
      return;
    }

    const currentUserId = user.id;

    async function loadUserBuilds() {
      if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from("user_builds")
            .select("*")
            .eq("user_id", currentUserId)
            .order("created_at", { ascending: false });

          if (!error && data) {
            const parsed: PCBuild[] = data.map((row) => ({
              id: row.id,
              name: row.build_name,
              timestamp: new Date(row.created_at).getTime(),
              cpu: row.parts.cpu,
              gpu: row.parts.gpu,
              motherboard: row.parts.motherboard,
              ram: row.parts.ram,
              storage: row.parts.storage,
              psu: row.parts.psu,
              cooler: row.parts.cooler,
              case: row.parts.case,
              totalPrice: row.total_price,
              budget: row.budget,
              totalPowerWatts: (row.parts.cpu?.power || 65) + (row.parts.gpu?.power || 120) + 120,
              scores: row.scores,
              luckScore: row.luck_score,
              luckTier: row.luck_tier,
              rarity: row.rarity,
              specialBuild: row.special_build,
              analysis: row.analysis,
              estimatedFps: row.estimated_fps || [],
            }));

            setHistoryBuilds(parsed);
            setSavedBuilds(parsed.filter((_, idx) => data[idx].is_saved));
            return;
          }
        } catch (dbErr) {
          console.warn("Could not load from Supabase:", dbErr);
        }
      }

      // Local user-scoped storage fallback
      try {
        const userSavedKey = `horizon_saved_${currentUserId}`;
        const userHistoryKey = `horizon_history_${currentUserId}`;

        const storedSaved = localStorage.getItem(userSavedKey);
        if (storedSaved) setSavedBuilds(JSON.parse(storedSaved));

        const storedHistory = localStorage.getItem(userHistoryKey);
        if (storedHistory) setHistoryBuilds(JSON.parse(storedHistory));
      } catch {
        // ignore
      }
    }

    loadUserBuilds();
    setTodayChallenge(getTodayChallenge());
  }, [isAuthenticated, user]);

  // Persist helpers bound to user
  const persistSaved = (items: PCBuild[]) => {
    setSavedBuilds(items);
    if (user) {
      try {
        localStorage.setItem(`horizon_saved_${user.id}`, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  };

  const persistHistory = (items: PCBuild[]) => {
    setHistoryBuilds(items);
    if (user) {
      try {
        localStorage.setItem(`horizon_history_${user.id}`, JSON.stringify(items));
      } catch {
        // ignore
      }
    }
  };

  // Trigger Roll - STRICT AUTHENTICATION GUARD
  const handleSpin = useCallback(
    async (variant: "normal" | "better" | "cheaper" = "normal") => {
      // 1. If not authenticated -> strictly block and open modal!
      if (!isAuthenticated) {
        openAuthModal("login");
        return;
      }

      if (isSpinning) return;
      setIsSpinning(true);

      try {
        // 2. Call server-side protected API endpoint
        if (session?.access_token) {
          const res = await fetch("/api/random-pc", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              preferences,
              variant,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.build) {
              setPendingBuild(data.build);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Server API fallback to client engine:", err);
      }

      // Fallback to client-side engine if offline
      const generated = generateRandomBuild(preferences, variant);
      setPendingBuild(generated);
    },
    [isAuthenticated, isSpinning, openAuthModal, preferences, session]
  );

  // Complete Slot Animation
  const handleAnimationComplete = () => {
    if (pendingBuild) {
      setCurrentBuild(pendingBuild);

      // Trigger Confetti for high rarity or special builds
      if (
        pendingBuild.rarity === "Mythic" ||
        pendingBuild.rarity === "Legendary" ||
        pendingBuild.specialBuild?.type === "God Build"
      ) {
        playJackpotSound();
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }

      // Add to user history (max 35 items)
      const updatedHistory = [pendingBuild, ...historyBuilds.slice(0, 34)];
      persistHistory(updatedHistory);
    }
    setIsSpinning(false);
  };

  // Toggle Save to Collection
  const toggleSaveCurrentBuild = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    if (!currentBuild) return;

    const exists = savedBuilds.some((b) => b.id === currentBuild.id);
    let updated: PCBuild[];
    if (exists) {
      updated = savedBuilds.filter((b) => b.id !== currentBuild.id);
      persistSaved(updated);
    } else {
      updated = [currentBuild, ...savedBuilds];
      persistSaved(updated);
    }

    // Sync is_saved in Supabase if configured
    if (isSupabaseConfigured() && user) {
      try {
        await supabase
          .from("user_builds")
          .update({ is_saved: !exists })
          .eq("id", currentBuild.id)
          .eq("user_id", user.id);
      } catch (err) {
        console.warn("Could not sync is_saved with Supabase:", err);
      }
    }
  };

  // Accept Daily Challenge
  const handleAcceptChallenge = (challenge: DailyChallenge) => {
    if (!isAuthenticated) {
      setIsDailyOpen(false);
      openAuthModal("login");
      return;
    }

    setPreferences((prev) => ({
      ...prev,
      budget: challenge.targetBudget,
      usage: challenge.targetUsage,
      cpuBrand: challenge.constraints.cpuBrand || "No Preference",
      gpuBrand: challenge.constraints.gpuBrand || "No Preference",
      caseStyle: challenge.constraints.caseStyle || "No Preference",
    }));
    setIsDailyOpen(false);

    // Scroll to generator and spin
    const target = document.getElementById("random-engine");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      handleSpin("normal");
    }, 400);
  };

  const isCurrentBuildSaved = Boolean(
    currentBuild && savedBuilds.some((b) => b.id === currentBuild.id)
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-sky-500 selection:text-slate-950">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl glass-panel border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        onOpenCollection={() => {
          if (!isAuthenticated) {
            openAuthModal("login");
            return;
          }
          setIsCollectionOpen(true);
        }}
        onOpenHistory={() => {
          if (!isAuthenticated) {
            openAuthModal("login");
            return;
          }
          setIsHistoryOpen(true);
        }}
        onOpenDailyChallenge={() => setIsDailyOpen(true)}
        savedCount={savedBuilds.length}
        historyCount={historyBuilds.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <HeroSection
          onScrollToRandom={() => {
            const target = document.getElementById("random-engine");
            if (target) {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />

        {/* Guest Reminder Banner */}
        {!isAuthenticated && (
          <div className="my-6 p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  ระบบสุ่ม PC สำหรับสมาชิกเท่านั้น (Members Only)
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                  คุณสามารถปรับแต่งงบและสเปกที่ต้องการได้อิสระ เข้าสู่ระบบเพื่อเริ่มสุ่มและบันทึกสเปกของคุณ
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                playClickSound();
                openAuthModal("login");
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider uppercase whitespace-nowrap transition-all shadow-md shadow-amber-500/20"
            >
              เข้าสู่ระบบ / สมัครสมาชิก
            </button>
          </div>
        )}

        {/* Generator Work Area */}
        <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Config / Filter Panel */}
          <div className="lg:col-span-5 w-full">
            <RandomPanel
              preferences={preferences}
              onChangePreferences={setPreferences}
              onSpin={() => handleSpin("normal")}
              isSpinning={isSpinning}
            />
          </div>

          {/* Right Column: Slot Machine Animation OR Result Card */}
          <div className="lg:col-span-7 w-full">
            {isSpinning && pendingBuild ? (
              <SlotAnimation
                finalBuild={pendingBuild}
                onAnimationComplete={handleAnimationComplete}
              />
            ) : currentBuild ? (
              <PCResultCard
                build={currentBuild}
                isSaved={isCurrentBuildSaved}
                onReroll={() => handleSpin("normal")}
                onBetterReroll={() => handleSpin("better")}
                onCheaperReroll={() => handleSpin("cheaper")}
                onToggleSave={toggleSaveCurrentBuild}
              />
            ) : (
              /* Idle Placeholder state before first spin */
              <div className="glass-panel border-2 border-dashed border-white/10 rounded-3xl p-10 sm:p-14 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4 text-sky-400">
                  <span className="text-3xl animate-bounce">🎲</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white mb-2">
                  พร้อมสุ่มสเปกคอมแล้วหรือยัง?
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
                  เลือกงบประมาณและสไตล์การใช้งานทางด้านซ้าย จากนั้นกดปุ่ม{" "}
                  <span className="text-sky-400 font-bold">🎲 RANDOM PC</span>{" "}
                  เพื่อเริ่มสุ่มสเปกพร้อมคำนวณคะแนน Luck & Rarity
                </p>
                <button
                  onClick={() => handleSpin("normal")}
                  className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg shadow-sky-500/20"
                >
                  {isAuthenticated ? "🎲 สุ่มสเปกครั้งแรกเลย" : "🔒 เข้าสู่ระบบเพื่อเริ่มสุ่ม"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal onSuccessMessage={showToast} />

      <DailyChallengeModal
        isOpen={isDailyOpen}
        onClose={() => setIsDailyOpen(false)}
        dailyChallenge={todayChallenge}
        onAcceptChallenge={handleAcceptChallenge}
        lastBuild={currentBuild}
      />

      <CollectionModal
        isOpen={isCollectionOpen}
        onClose={() => setIsCollectionOpen(false)}
        savedBuilds={savedBuilds}
        onSelectBuild={(build) => setCurrentBuild(build)}
        onDeleteBuild={(id) => persistSaved(savedBuilds.filter((b) => b.id !== id))}
        onClearAll={() => persistSaved([])}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyBuilds={historyBuilds}
        onSelectBuild={(build) => setCurrentBuild(build)}
        onClearHistory={() => persistHistory([])}
      />

      {/* Footer */}
      <footer className="w-full glass-panel border-t border-white/10 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Horizon Auto PC</span>
            <span>•</span>
            <span>Spin Your PC. Find Your Build.</span>
          </div>
          <p className="text-slate-500">
            สร้างขึ้นเพื่อความสนุกและการจัดสเปกคอมพิวเตอร์อย่างสมดุล (Horizon Auto PC)
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
