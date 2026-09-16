import { ComponentCategory, HardwareItem } from "@/types/hardware";
import { HardwareItemDB } from "@/types/admin";
import { SupabaseClient } from "@supabase/supabase-js";
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
import { supabase, isSupabaseConfigured } from "./supabase/client";

// Collect all static hardware into initial list
export const INITIAL_STATIC_HARDWARE: HardwareItemDB[] = [
  ...CPU_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...GPU_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...MOTHERBOARD_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...RAM_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...STORAGE_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...PSU_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...COOLER_DATABASE.map((item) => ({ ...item, status: "active" as const })),
  ...CASE_DATABASE.map((item) => ({ ...item, status: "active" as const })),
];

const LOCAL_STORAGE_HARDWARE_KEY = "horizon_hardware_dataset";

let serverInMemoryHardware: HardwareItemDB[] = [...INITIAL_STATIC_HARDWARE];

function getLocalHardware(): HardwareItemDB[] {
  if (typeof window === "undefined") {
    return serverInMemoryHardware;
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HARDWARE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_HARDWARE_KEY, JSON.stringify(INITIAL_STATIC_HARDWARE));
      return INITIAL_STATIC_HARDWARE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_STATIC_HARDWARE;
  }
}

function saveLocalHardware(items: HardwareItemDB[]): void {
  if (typeof window === "undefined") {
    serverInMemoryHardware = items;
    return;
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_HARDWARE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

/**
 * Fetch all hardware items for Admin management
 */
export async function getAllHardware(includeDisabled: boolean = true, client?: SupabaseClient | null): Promise<HardwareItemDB[]> {
  const db = client || supabase;
  if (isSupabaseConfigured()) {
    try {
      let query = db.from("hardware").select("*").order("category").order("price", { ascending: true });
      if (!includeDisabled) {
        query = query.eq("status", "active");
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          name: row.name,
          brand: row.brand,
          category: row.category as ComponentCategory,
          price: Number(row.price),
          performanceTier: Number(row.performance || row.performanceTier || 5),
          power: Number(row.power || 65),
          socket: row.socket || undefined,
          memoryType: row.memory_type || row.memoryType || undefined,
          vram: row.vram || undefined,
          formFactor: row.form_factor || row.formFactor || undefined,
          specs: row.specs || "",
          badge: row.badge || undefined,
          image_url: row.image_url || undefined,
          model: row.model || undefined,
          description: row.description || undefined,
          power_consumption: row.power_consumption || (row.power ? `${row.power}W` : undefined),
          compatibility: row.compatibility || undefined,
          product_url: row.product_url || undefined,
          active: row.active !== undefined ? Boolean(row.active) : row.status !== "disabled",
          status: (row.status || (row.active === false ? "disabled" : "active")) as "active" | "disabled",
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
      }
    } catch (err) {
      console.warn("Could not load hardware from Supabase:", err);
    }
  }

  // Local fallback
  const local = getLocalHardware();
  if (!includeDisabled) {
    return local.filter((item) => item.status !== "disabled");
  }
  return local;
}

/**
 * Fetch active hardware separated by category for Random Engine
 */
export async function getActiveHardwarePool(): Promise<Record<ComponentCategory, HardwareItem[]>> {
  const allActive = await getAllHardware(false);

  const pool: Record<ComponentCategory, HardwareItem[]> = {
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    psu: [],
    cooler: [],
    case: [],
  };

  for (const item of allActive) {
    const isActive = item.status !== "disabled" && item.active !== false;
    if (item.category in pool && isActive) {
      pool[item.category].push(item);
    }
  }

  // Fallback to initial static database if any category is empty
  if (pool.cpu.length === 0) pool.cpu = CPU_DATABASE;
  if (pool.gpu.length === 0) pool.gpu = GPU_DATABASE;
  if (pool.motherboard.length === 0) pool.motherboard = MOTHERBOARD_DATABASE;
  if (pool.ram.length === 0) pool.ram = RAM_DATABASE;
  if (pool.storage.length === 0) pool.storage = STORAGE_DATABASE;
  if (pool.psu.length === 0) pool.psu = PSU_DATABASE;
  if (pool.cooler.length === 0) pool.cooler = COOLER_DATABASE;
  if (pool.case.length === 0) pool.case = CASE_DATABASE;

  return pool;
}

/**
 * Synchronous active hardware pool getter for client-side fallback
 */
export function getLocalActiveHardwarePool(): Record<ComponentCategory, HardwareItem[]> {
  const local = getLocalHardware().filter(
    (item) => item.status !== "disabled" && item.active !== false
  );
  const pool: Record<ComponentCategory, HardwareItem[]> = {
    cpu: [],
    gpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    psu: [],
    cooler: [],
    case: [],
  };

  for (const item of local) {
    if (item.category in pool) {
      pool[item.category].push(item);
    }
  }

  if (pool.cpu.length === 0) pool.cpu = CPU_DATABASE;
  if (pool.gpu.length === 0) pool.gpu = GPU_DATABASE;
  if (pool.motherboard.length === 0) pool.motherboard = MOTHERBOARD_DATABASE;
  if (pool.ram.length === 0) pool.ram = RAM_DATABASE;
  if (pool.storage.length === 0) pool.storage = STORAGE_DATABASE;
  if (pool.psu.length === 0) pool.psu = PSU_DATABASE;
  if (pool.cooler.length === 0) pool.cooler = COOLER_DATABASE;
  if (pool.case.length === 0) pool.case = CASE_DATABASE;

  return pool;
}

/**
 * Add new hardware item (Admin)
 */
export async function addHardwareItem(
  item: Omit<HardwareItemDB, "created_at" | "updated_at">,
  client?: SupabaseClient | null
): Promise<HardwareItemDB> {
  const db = client || supabase;
  const isItemActive = item.active !== false && item.status !== "disabled";
  const newItem: HardwareItemDB = {
    ...item,
    active: isItemActive,
    status: isItemActive ? "active" : "disabled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      await db.from("hardware").upsert({
        id: newItem.id,
        name: newItem.name,
        brand: newItem.brand,
        category: newItem.category,
        price: newItem.price,
        performance: newItem.performanceTier,
        power: newItem.power,
        socket: newItem.socket || null,
        memory_type: newItem.memoryType || null,
        vram: newItem.vram || null,
        form_factor: newItem.formFactor || null,
        image_url: newItem.image_url || null,
        specs: newItem.specs,
        badge: newItem.badge || null,
        model: newItem.model || null,
        description: newItem.description || null,
        power_consumption: newItem.power_consumption || `${newItem.power}W`,
        compatibility: newItem.compatibility || null,
        product_url: newItem.product_url || null,
        status: newItem.status,
        active: newItem.active,
      });
    } catch (err) {
      console.warn("Could not insert hardware to Supabase:", err);
    }
  }

  // Always update local cache
  const local = getLocalHardware();
  const updated = [newItem, ...local.filter((h) => h.id !== newItem.id)];
  saveLocalHardware(updated);

  return newItem;
}

/**
 * Update hardware item (Admin)
 */
export async function updateHardwareItem(
  id: string,
  updates: Partial<HardwareItemDB>,
  client?: SupabaseClient | null
): Promise<HardwareItemDB | null> {
  const db = client || supabase;
  const local = getLocalHardware();
  const index = local.findIndex((h) => h.id === id);
  const current = index !== -1 ? local[index] : null;

  const newActive = updates.active !== undefined 
    ? updates.active 
    : updates.status !== undefined 
    ? updates.status === "active" 
    : current ? current.active !== false : true;

  const updatedItem: HardwareItemDB = {
    ...(current || {} as HardwareItemDB),
    id,
    ...updates,
    active: newActive,
    status: newActive ? "active" : "disabled",
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    try {
      const payload: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.performanceTier !== undefined) payload.performance = updates.performanceTier;
      if (updates.power !== undefined) payload.power = updates.power;
      if (updates.socket !== undefined) payload.socket = updates.socket || null;
      if (updates.memoryType !== undefined) payload.memory_type = updates.memoryType || null;
      if (updates.vram !== undefined) payload.vram = updates.vram || null;
      if (updates.formFactor !== undefined) payload.form_factor = updates.formFactor || null;
      if (updates.image_url !== undefined) payload.image_url = updates.image_url || null;
      if (updates.specs !== undefined) payload.specs = updates.specs || "";
      if (updates.badge !== undefined) payload.badge = updates.badge || null;
      if (updates.model !== undefined) payload.model = updates.model || null;
      if (updates.description !== undefined) payload.description = updates.description || null;
      if (updates.power_consumption !== undefined) payload.power_consumption = updates.power_consumption || null;
      if (updates.compatibility !== undefined) payload.compatibility = updates.compatibility || null;
      if (updates.product_url !== undefined) payload.product_url = updates.product_url || null;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.active !== undefined) payload.active = updates.active;

      const { data, error } = await db
        .from("hardware")
        .update(payload)
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
      } else if (data && data.length > 0) {
        const row = data[0];
        if (row.image_url !== undefined) updatedItem.image_url = row.image_url || undefined;
      }
    } catch (err) {
      console.warn("Could not update hardware in Supabase:", err);
    }
  }

  if (index !== -1) {
    local[index] = updatedItem;
    saveLocalHardware(local);
  }
  return updatedItem;
}

/**
 * Toggle enable/disable status of hardware (Admin)
 */
export async function toggleHardwareStatus(id: string, status: "active" | "disabled", client?: SupabaseClient | null): Promise<void> {
  await updateHardwareItem(id, { status, active: status === "active" }, client);
}

/**
 * Delete hardware item (Admin)
 */
export async function deleteHardwareItem(id: string, client?: SupabaseClient | null): Promise<boolean> {
  const db = client || supabase;
  if (isSupabaseConfigured()) {
    try {
      await db.from("hardware").delete().eq("id", id);
    } catch (err) {
      console.warn("Could not delete hardware from Supabase:", err);
    }
  }

  const local = getLocalHardware();
  const filtered = local.filter((h) => h.id !== id);
  saveLocalHardware(filtered);
  return true;
}
