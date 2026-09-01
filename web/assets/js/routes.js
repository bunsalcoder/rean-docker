/* Shared chapter and lab route tables — single source for learn, search, progress, sitemap. */
(() => {
  const CHAPTERS = [
    {
      id: "how-to-use",
      match: /^## (How to use this guide|របៀបប្រើមគ្គុទ្ទេសក៍នេះ)$/m,
    },
    { id: "1", match: /^## 1\. /m },
    { id: "2", match: /^## 2\. /m },
    { id: "3", match: /^## 3\. /m },
    { id: "4", match: /^## 4\. /m },
    { id: "5", match: /^## 5\. /m },
    { id: "6", match: /^## 6\. /m },
    { id: "7", match: /^## 7\. /m },
    { id: "8", match: /^## 8\. /m },
    { id: "9", match: /^## 9\. /m },
    { id: "10", match: /^## 10\. /m },
    { id: "11", match: /^## 11\. /m },
    { id: "12", match: /^## 12\. /m },
    { id: "13", match: /^## 13\. /m },
    { id: "14", match: /^## 14\. /m },
    { id: "15", match: /^## 15\. /m },
    { id: "16", match: /^## 16\. /m },
    { id: "17", match: /^## 17\. /m },
    { id: "18", match: /^## 18\. /m },
    { id: "19", match: /^## 19\. /m },
    { id: "20", match: /^## 20\. /m },
  ];

  const LAB_DEFS = [
    { id: "01-isolation-basics", levelKey: "lab.level.beginner" },
    { id: "02-hello", levelKey: "lab.level.beginner" },
    { id: "03-dockerfile", levelKey: "lab.level.beginner" },
    { id: "04-env-secrets", levelKey: "lab.level.intermediate" },
    { id: "05-compose", levelKey: "lab.level.intermediate" },
    { id: "06-networks", levelKey: "lab.level.intermediate" },
    { id: "07-volumes", levelKey: "lab.level.intermediate" },
    { id: "08-multi-stage", levelKey: "lab.level.advanced" },
    { id: "09-production", levelKey: "lab.level.advanced" },
    { id: "10-debugging", levelKey: "lab.level.advanced" },
    { id: "11-security", levelKey: "lab.level.advanced" },
    { id: "12-ci-cd", levelKey: "lab.level.special" },
    { id: "13-capstone", levelKey: "lab.level.special" },
  ];

  const LAB_IDS = LAB_DEFS.map((lab) => lab.id);

  window.ReanRoutes = { CHAPTERS, LAB_DEFS, LAB_IDS };
})();
