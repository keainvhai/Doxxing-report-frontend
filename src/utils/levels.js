// utils/levels.js

// 等级对应的称号列表（Level 1 ~ 10）
export const levelTitles = [
  "Newcomer", // Level 1
  "Observer", // Level 2
  "Contributor", // Level 3
  "Active Contributor", // Level 4
  "Investigator", // Level 5
  "Advocate", // Level 6
  "Defender", // Level 7
  "Watcher", // Level 8
  "Sentinel", // Level 9
  "Guardian", // Level 10+
];

// 根据等级返回对应称号
export function getLevelTitle(level) {
  if (!level || level < 1) return "Newcomer";
  const index = Math.min(level - 1, levelTitles.length - 1);
  return levelTitles[index];
}
