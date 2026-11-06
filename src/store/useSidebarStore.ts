import { create } from "zustand";

interface SidebarStore {
  isExpanded: boolean;
  isMobileOpen: boolean;

  toggleExpanded: () => void;
  openMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
  isExpanded: true,
  isMobileOpen: false,

  toggleExpanded: () =>
    set((state) => ({
      isExpanded: !state.isExpanded,
    })),

  openMobile: () =>
    set({
      isMobileOpen: true,
    }),

  closeMobile: () =>
    set({
      isMobileOpen: false,
    }),
}));
