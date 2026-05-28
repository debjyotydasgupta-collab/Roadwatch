import { create } from "zustand";
import { Region } from "@/lib/mock-api";

interface RegionState {
  region: Region;
  setRegion: (region: Region) => void;
}

export const useRegion = create<RegionState>((set) => ({
  region: "IN",
  setRegion: (region) => set({ region }),
}));
