/* Generated from web/assets/routes.json — edit the JSON, then: make sync-routes */
(() => {
  const VERSION = 5;
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
    { id: "weekly-plan", match: /^## (Suggested weekly plan|ផែនការប្រចាំសប្តាហ៍ \(ណែនាំ\))$/m },
    { id: "glossary", match: /^## (Glossary|វចនានុក្រម)$/m },
    { id: "next-steps", match: /^## (Next steps after this guide|ជំហានបន្ទាប់បន្ទាប់ពីមគ្គុទ្ទេសក៍នេះ)$/m },
  ];

  const LAB_DEFS = [
    { id: "01-isolation-basics", levelKey: "lab.level.beginner", minutes: 25 },
    { id: "02-hello", levelKey: "lab.level.beginner", minutes: 20 },
    { id: "03-dockerfile", levelKey: "lab.level.beginner", minutes: 30 },
    { id: "04-env-secrets", levelKey: "lab.level.intermediate", minutes: 30 },
    { id: "05-compose", levelKey: "lab.level.intermediate", minutes: 40 },
    { id: "06-networks", levelKey: "lab.level.intermediate", minutes: 25 },
    { id: "07-volumes", levelKey: "lab.level.intermediate", minutes: 25 },
    { id: "08-multi-stage", levelKey: "lab.level.advanced", minutes: 30 },
    { id: "09-production", levelKey: "lab.level.advanced", minutes: 30 },
    { id: "10-debugging", levelKey: "lab.level.advanced", minutes: 30 },
    { id: "11-security", levelKey: "lab.level.advanced", minutes: 40 },
    { id: "12-ci-cd", levelKey: "lab.level.special", minutes: 40 },
    { id: "13-capstone", levelKey: "lab.level.special", minutes: 90 },
  ];

  const LAB_IDS = LAB_DEFS.map((lab) => lab.id);

  const PAIR_LIST = [
    { chapter: "2", lab: "01-isolation-basics" },
    { chapter: "3", lab: "01-isolation-basics", practiceHintKey: "pair.afterMentalModel", practiceOnly: true },
    { chapter: "4", lab: "01-isolation-basics", practiceHintKey: "pair.afterInstall", practiceOnly: true },
    { chapter: "5", lab: "02-hello" },
    { chapter: "6", lab: "03-dockerfile", practiceHintKey: "pair.afterImages", practiceOnly: true },
    { chapter: "7", lab: "03-dockerfile" },
    { chapter: "8", lab: "07-volumes" },
    { chapter: "9", lab: "06-networks" },
    { chapter: "10", lab: "04-env-secrets" },
    { chapter: "11", lab: "05-compose" },
    { chapter: "12", lab: "08-multi-stage" },
    { chapter: "13", lab: "09-production" },
    { chapter: "14", lab: "10-debugging" },
    { chapter: "15", lab: "11-security" },
    { chapter: "16", lab: "11-security", practiceHintKey: "pair.ch16Stretch" },
    { chapter: "17", lab: "12-ci-cd" },
    { chapter: "18", lab: "13-capstone" },
  ];

  const LAB_NOTES = {
    "13-capstone": "lab.ownBanner",
  };

  const CHAPTER_TO_LAB = Object.fromEntries(
    PAIR_LIST.map((pair) => [pair.chapter, pair.lab])
  );
  // First non-practiceOnly pairing wins as primary theory (Lab 11 → Ch.15).
  const LAB_TO_CHAPTER = PAIR_LIST.reduce((acc, pair) => {
    if (pair.practiceOnly) return acc;
    if (!acc[pair.lab]) acc[pair.lab] = pair.chapter;
    return acc;
  }, {});
  const LAB_TO_CHAPTERS = PAIR_LIST.reduce((acc, pair) => {
    if (pair.practiceOnly) return acc;
    const list = acc[pair.lab] || (acc[pair.lab] = []);
    if (!list.includes(pair.chapter)) list.push(pair.chapter);
    return acc;
  }, {});

  window.ReanRoutes = {
    version: VERSION,
    CHAPTERS,
    LAB_DEFS,
    LAB_IDS,
    PAIRS: PAIR_LIST,
    LAB_NOTES,
    CHAPTER_TO_LAB,
    LAB_TO_CHAPTER,
    LAB_TO_CHAPTERS,
  };
})();
