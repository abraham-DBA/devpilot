export type ProjectHealth = "on_track" | "at_risk" | "high_risk";

export function calculateProjectHealth(
  startDate: string,
  endDate: string,
  progress: number
): ProjectHealth {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();

  if (now <= start) return "on_track";
  if (now >= end) return progress >= 100 ? "on_track" : "high_risk";

  const totalDuration = end - start;
  const timeElapsed = now - start;
  const timeUsedPercentage = (timeElapsed / totalDuration) * 100;

  const diff = timeUsedPercentage - progress;

  if (diff > 20) return "high_risk";
  if (diff > 0) return "at_risk";
  return "on_track";
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
