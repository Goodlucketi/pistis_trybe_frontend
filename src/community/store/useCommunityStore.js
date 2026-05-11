import { create } from "zustand";

const useCommunityStore = create((set) => ({
  // Active view state
  activeView: "feed", // "feed" | "bible"
  setActiveView: (view) => set({ activeView: view }),
}));

export default useCommunityStore;
