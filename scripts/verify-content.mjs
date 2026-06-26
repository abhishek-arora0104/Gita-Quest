// Content integrity check for all locales.
// Run with: node --experimental-strip-types scripts/verify-content.mjs
//
// Validates: 18 chapters per locale, matching slugs, 25 questions/chapter,
// 10 easy / 10 medium / 5 hard, and valid correctIndex (0–3).
//
// Imports the chapter source files directly via relative paths so it does not
// depend on the `@/` path alias, which Node's type stripper cannot resolve.

import { chapter1 } from "../src/lib/content/chapters/chapter-01.ts";
import { chapter2 } from "../src/lib/content/chapters/chapter-02.ts";
import { chapter6 } from "../src/lib/content/chapters/chapter-06.ts";
import {
  chapter3,
  chapter4,
  chapter5,
  chapter7,
  chapter8,
  chapter9,
  chapter10,
  chapter11,
  chapter12,
  chapter13,
  chapter14,
  chapter15,
  chapter16,
  chapter17,
  chapter18,
} from "../src/lib/content/chapters/remaining.ts";
import { hiChaptersByNumber } from "../src/lib/content/hi/chapters.ts";
import { hinglishChaptersByNumber } from "../src/lib/content/hinglish/chapters.ts";

const enChaptersByNumber = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
  4: chapter4,
  5: chapter5,
  6: chapter6,
  7: chapter7,
  8: chapter8,
  9: chapter9,
  10: chapter10,
  11: chapter11,
  12: chapter12,
  13: chapter13,
  14: chapter14,
  15: chapter15,
  16: chapter16,
  17: chapter17,
  18: chapter18,
};

const chaptersByLocale = {
  en: enChaptersByNumber,
  hi: hiChaptersByNumber,
  hinglish: hinglishChaptersByNumber,
};
const LOCALES = ["en", "hi", "hinglish"];

let failures = 0;
function fail(msg) {
  console.error("✗ " + msg);
  failures++;
}
function ok(msg) {
  console.log("✓ " + msg);
}

const englishSlugs = Object.values(enChaptersByNumber).map((c) => c.slug).sort();
const englishNumbers = Object.values(enChaptersByNumber).map((c) => c.number).sort((a, b) => a - b);

if (englishSlugs.length !== 18) {
  fail(`English chapter count = ${englishSlugs.length}, expected 18`);
} else {
  ok("English has 18 chapters");
}
if (JSON.stringify(englishNumbers) !== JSON.stringify(Array.from({ length: 18 }, (_, i) => i + 1))) {
  fail(`English chapter numbers are not 1..18: ${englishNumbers.join(",")}`);
} else {
  ok("English chapter numbers are 1..18");
}

for (const locale of LOCALES) {
  const map = chaptersByLocale[locale];
  const chapters = Object.values(map);
  const numbers = chapters.map((c) => c.number).sort((a, b) => a - b);
  const slugs = chapters.map((c) => c.slug).sort();

  if (chapters.length !== 18) {
    fail(`[${locale}] chapter count = ${chapters.length}, expected 18`);
    continue;
  }
  ok(`[${locale}] has 18 chapters`);

  if (JSON.stringify(numbers) !== JSON.stringify(Array.from({ length: 18 }, (_, i) => i + 1))) {
    fail(`[${locale}] chapter numbers are not 1..18`);
  }
  if (JSON.stringify(slugs) !== JSON.stringify(englishSlugs)) {
    fail(`[${locale}] slugs do not match English slugs`);
  } else {
    ok(`[${locale}] slugs match English`);
  }

  for (const chapter of chapters) {
    if (chapter.quiz.length !== 25) {
      fail(`[${locale}] chapter ${chapter.number} has ${chapter.quiz.length} questions, expected 25`);
    }
    const easy = chapter.quiz.filter((q) => q.difficulty === "easy").length;
    const medium = chapter.quiz.filter((q) => q.difficulty === "medium").length;
    const hard = chapter.quiz.filter((q) => q.difficulty === "hard").length;
    if (easy !== 10) {
      fail(`[${locale}] chapter ${chapter.number} has ${easy} easy questions, expected 10`);
    }
    if (medium !== 10) {
      fail(`[${locale}] chapter ${chapter.number} has ${medium} medium questions, expected 10`);
    }
    if (hard !== 5) {
      fail(`[${locale}] chapter ${chapter.number} has ${hard} hard questions, expected 5`);
    }
    for (const q of chapter.quiz) {
      if (q.correctIndex < 0 || q.correctIndex > 3) {
        fail(`[${locale}] chapter ${chapter.number} question ${q.id} has invalid correctIndex ${q.correctIndex}`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        fail(`[${locale}] chapter ${chapter.number} question ${q.id} has ${q.options?.length} options, expected 4`);
      }
    }
  }
}

console.log("");
if (failures > 0) {
  console.error(`\n${failures} integrity check(s) FAILED`);
  process.exit(1);
} else {
  console.log("All content integrity checks PASSED for all locales.");
}
