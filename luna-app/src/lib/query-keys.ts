export const queryKeys = {
  periods: ["periods"] as const,
  predictions: ["predictions"] as const,
  insights: ["insights"] as const,
  symptoms: ["symptoms"] as const,
  user: ["user"] as const,
  cycleRelated: ["periods", "predictions", "symptoms", "insights"] as const,
};
