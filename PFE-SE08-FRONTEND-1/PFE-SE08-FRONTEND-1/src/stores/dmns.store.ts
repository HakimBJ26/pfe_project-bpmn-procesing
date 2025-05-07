import { create } from "zustand";
import { Dmn } from "@/views/dmns/data/schema";

interface DmnsState {
  dmns: Dmn[];
  setDmns: (dmns: Dmn[]) => void;
}

export const useDmnsStore = create<DmnsState>((set) => ({
  dmns: [],
  setDmns: (dmns) => set({ dmns }),
})); 