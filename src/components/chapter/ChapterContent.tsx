import type { Chapter } from "@/lib/content/schema";
import { Card } from "@/components/ui/Card";
import { PracticalExampleList } from "./PracticalExampleList";
import type { Dictionary } from "@/lib/i18n/dictionary";

/**
 * Renders the full chapter summary body (intro through reflection prompts).
 * This is server-rendered for SEO and readability.
 */
export function ChapterContent({
  chapter,
  t,
}: {
  chapter: Chapter;
  t: Dictionary;
}) {
  return (
    <article className="space-y-12">
      {/* Introduction */}
      <section aria-labelledby="intro">
        <SectionTitle>{t.chapter.introduction}</SectionTitle>
        <div className="prose-gita mt-4">
          {chapter.intro.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Story overview */}
      <section aria-labelledby="story">
        <SectionTitle>{t.chapter.storyOverview}</SectionTitle>
        <div className="prose-gita mt-4">
          {chapter.storyOverview.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Main teachings */}
      <section aria-labelledby="teachings">
        <SectionTitle>{t.chapter.mainTeachings}</SectionTitle>
        <div className="mt-4 space-y-4">
          {chapter.mainTeachings.map((teaching, i) => (
            <Card key={i}>
              <div className="p-5 sm:p-6">
                <h4 className="font-serif text-xl font-semibold text-maroon">
                  <span className="mr-2 text-saffron">{i + 1}.</span>
                  {teaching.heading}
                </h4>
                <div className="prose-gita mt-3">
                  {teaching.body.split("\n\n").map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Practical examples */}
      <section aria-labelledby="examples">
        <SectionTitle>{t.chapter.practicalExamples}</SectionTitle>
        <p className="mt-2 text-ink-soft">
          {t.chapter.examplesIntro}
        </p>
        <div className="mt-4">
          <PracticalExampleList examples={chapter.practicalExamples} />
        </div>
      </section>

      {/* Lessons for daily life */}
      <section aria-labelledby="daily">
        <SectionTitle>{t.chapter.dailyLife}</SectionTitle>
        <ul className="mt-4 space-y-3">
          {chapter.lessonsForDailyLife.map((l, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf text-xs text-white"
                aria-hidden="true"
              >
                ✓
              </span>
              <span className="text-ink">{l}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Key takeaways */}
      <section aria-labelledby="takeaways">
        <SectionTitle>{t.chapter.takeaways}</SectionTitle>
        <Card>
          <div className="p-5 sm:p-6">
            <ul className="space-y-3">
              {chapter.keyTakeaways.map((k, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="mt-1 text-saffron"
                    aria-hidden="true"
                  >
                    ❖
                  </span>
                  <span className="text-ink">{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </section>

      {/* Reflection questions */}
      <section aria-labelledby="reflection">
        <SectionTitle>{t.chapter.reflection}</SectionTitle>
        <p className="mt-2 text-ink-soft">
          {t.chapter.reflectionIntro}
        </p>
        <ol className="mt-4 space-y-3">
          {chapter.reflectionQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-saffron/15 font-serif text-sm font-semibold text-saffron-dark"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span className="pt-0.5 text-ink">{q}</span>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h3
        className="font-serif text-2xl font-semibold text-maroon sm:text-3xl"
        // aria-labelledby target
      >
        {children}
      </h3>
      <div
        className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-saffron to-gold"
        aria-hidden="true"
      />
    </>
  );
}
