export const BIBLE_BOOKS = [
  { name: "Genesis", chapters: 50 }, { name: "Exodus", chapters: 40 },
  { name: "Leviticus", chapters: 27 }, { name: "Numbers", chapters: 36 },
  { name: "Deuteronomy", chapters: 34 }, { name: "Joshua", chapters: 24 },
  { name: "Judges", chapters: 21 }, { name: "Ruth", chapters: 4 },
  { name: "1 Samuel", chapters: 31 }, { name: "2 Samuel", chapters: 24 },
  { name: "1 Kings", chapters: 22 }, { name: "2 Kings", chapters: 25 },
  { name: "1 Chronicles", chapters: 29 }, { name: "2 Chronicles", chapters: 36 },
  { name: "Ezra", chapters: 10 }, { name: "Nehemiah", chapters: 13 },
  { name: "Esther", chapters: 10 }, { name: "Job", chapters: 42 },
  { name: "Psalms", chapters: 150 }, { name: "Proverbs", chapters: 31 },
  { name: "Ecclesiastes", chapters: 12 }, { name: "Song of Solomon", chapters: 8 },
  { name: "Isaiah", chapters: 66 }, { name: "Jeremiah", chapters: 52 },
  { name: "Lamentations", chapters: 5 }, { name: "Ezekiel", chapters: 48 },
  { name: "Daniel", chapters: 12 }, { name: "Hosea", chapters: 14 },
  { name: "Joel", chapters: 3 }, { name: "Amos", chapters: 9 },
  { name: "Obadiah", chapters: 1 }, { name: "Jonah", chapters: 4 },
  { name: "Micah", chapters: 7 }, { name: "Nahum", chapters: 3 },
  { name: "Habakkuk", chapters: 3 }, { name: "Zephaniah", chapters: 3 },
  { name: "Haggai", chapters: 2 }, { name: "Zechariah", chapters: 14 },
  { name: "Malachi", chapters: 4 },
  { name: "Matthew", chapters: 28 }, { name: "Mark", chapters: 16 },
  { name: "Luke", chapters: 24 }, { name: "John", chapters: 21 },
  { name: "Acts", chapters: 28 }, { name: "Romans", chapters: 16 },
  { name: "1 Corinthians", chapters: 16 }, { name: "2 Corinthians", chapters: 13 },
  { name: "Galatians", chapters: 6 }, { name: "Ephesians", chapters: 6 },
  { name: "Philippians", chapters: 4 }, { name: "Colossians", chapters: 4 },
  { name: "1 Thessalonians", chapters: 5 }, { name: "2 Thessalonians", chapters: 3 },
  { name: "1 Timothy", chapters: 6 }, { name: "2 Timothy", chapters: 4 },
  { name: "Titus", chapters: 3 }, { name: "Philemon", chapters: 1 },
  { name: "Hebrews", chapters: 13 }, { name: "James", chapters: 5 },
  { name: "1 Peter", chapters: 5 }, { name: "2 Peter", chapters: 3 },
  { name: "1 John", chapters: 5 }, { name: "2 John", chapters: 1 },
  { name: "3 John", chapters: 1 }, { name: "Jude", chapters: 1 },
  { name: "Revelation", chapters: 22 },
];

// ── Separate OT, NT, Psalms, Proverbs ──
const OT_BOOKS = BIBLE_BOOKS.slice(0, 39).filter(
  (b) => b.name !== "Psalms" && b.name !== "Proverbs"
);
const PSALMS = { name: "Psalms", chapters: 150 };
const PROVERBS = { name: "Proverbs", chapters: 31 };
const NT_BOOKS = BIBLE_BOOKS.slice(39);

// Flatten a book list into chapters
const flattenBooks = (books) => {
  const chapters = [];
  books.forEach((book) => {
    for (let ch = 1; ch <= book.chapters; ch++) {
      chapters.push({ book: book.name, chapter: ch });
    }
  });
  return chapters;
};

const otChapters = flattenBooks(OT_BOOKS);       // 929 - 150 - 31 = 748 chapters
const psalmChapters = flattenBooks([PSALMS]);     // 150 chapters
const proverbChapters = flattenBooks([PROVERBS]); // 31 chapters
const ntChapters = flattenBooks(NT_BOOKS);        // 260 chapters

/**
 * Generate a MIXED plan:
 * Each day gets readings from different streams:
 *   - OT narrative (Genesis → Malachi, excl Psalms/Proverbs)
 *   - NT (Matthew → Revelation)
 *   - Psalms (spread across the plan)
 *   - Proverbs (cycled through the plan)
 *
 * Streams are distributed proportionally so all finish together.
 */
const generateMixedPlan = (days) => {
  const plan = [];

  // How many chapters per stream per day (fractional, accumulated)
  const otRate = otChapters.length / days;      // ~2.05/day for 1yr
  const ntRate = ntChapters.length / days;      // ~0.71/day for 1yr
  const psRate = psalmChapters.length / days;   // ~0.41/day for 1yr
  const prRate = proverbChapters.length / days; // ~0.085/day for 1yr

  let otAcc = 0, ntAcc = 0, psAcc = 0, prAcc = 0;
  let otIdx = 0, ntIdx = 0, psIdx = 0, prIdx = 0;

  for (let day = 1; day <= days; day++) {
    otAcc += otRate;
    ntAcc += ntRate;
    psAcc += psRate;
    prAcc += prRate;

    const dayReadings = [];

    // OT chapters for this day
    while (otIdx < Math.round(otAcc) && otIdx < otChapters.length) {
      dayReadings.push({ ...otChapters[otIdx], stream: "OT" });
      otIdx++;
    }

    // NT chapters for this day
    while (ntIdx < Math.round(ntAcc) && ntIdx < ntChapters.length) {
      dayReadings.push({ ...ntChapters[ntIdx], stream: "NT" });
      ntIdx++;
    }

    // Psalm for this day
    while (psIdx < Math.round(psAcc) && psIdx < psalmChapters.length) {
      dayReadings.push({ ...psalmChapters[psIdx], stream: "Psalms" });
      psIdx++;
    }

    // Proverb for this day (cycle if plan is longer than 31 days)
    while (prIdx < Math.round(prAcc) && prIdx < proverbChapters.length) {
      dayReadings.push({ ...proverbChapters[prIdx], stream: "Proverbs" });
      prIdx++;
    }

    if (dayReadings.length > 0) {
      plan.push({ day, readings: dayReadings });
    }
  }

  return plan;
};

export const READING_PLANS = {
  "1-year":   { label: "1 Year",   days: 365, plan: generateMixedPlan(365) },
  "6-months": { label: "6 Months", days: 180, plan: generateMixedPlan(180) },
  "3-months": { label: "3 Months", days: 90,  plan: generateMixedPlan(90)  },
  "1-month":  { label: "1 Month",  days: 30,  plan: generateMixedPlan(30)  },
};

export const TRANSLATIONS = [
  { id: "kjv",   label: "King James Version",    short: "KJV"   },
  { id: "web",   label: "World English Bible",   short: "WEB"   },
  { id: "bbe",   label: "Bible in Basic English", short: "BBE"  },
  { id: "darby", label: "Darby Translation",     short: "DARBY" },
  { id: "webbe", label: "WEB British Edition",   short: "WEBBE" },
];

// Stream badge colors for UI
export const STREAM_COLORS = {
  "OT":       "bg-amber-100 text-amber-700",
  "NT":       "bg-blue-100 text-blue-700",
  "Psalms":   "bg-purple-100 text-purple-700",
  "Proverbs": "bg-green-100 text-green-700",
};