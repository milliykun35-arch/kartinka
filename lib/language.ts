// Helper function for translation without context
// This is a simplified version that defaults to Uzbek
export function t(uz: string, ru: string): string {
  if (typeof window === "undefined") return uz

  const saved = localStorage.getItem("lang")
  return saved === "ru" ? ru : uz
}
