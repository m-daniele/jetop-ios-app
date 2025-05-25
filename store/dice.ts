import { create } from "zustand";

type DiceStore = {
  diceCount: number;
  setDiceCount: (count: number) => void;
};

export const useDiceStore = create<DiceStore>((set) => ({
  diceCount: 2,
  setDiceCount: (count) => set({ diceCount: count }),
}));