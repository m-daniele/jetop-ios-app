import { create } from "zustand";

type State = {
  count: number;
  increase: () => void;
};

export const useCounter = create<State>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
}));