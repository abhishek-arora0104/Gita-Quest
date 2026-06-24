import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "About",
  description:
    "Gita Quest makes the Bhagavad Gita easy to understand through simplified summaries, practical examples, and engaging quizzes.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-center font-serif text-4xl font-bold text-maroon">
        About Gita Quest
      </h1>
      <div className="divider-ornament mt-6" aria-hidden="true">
        <span>❖</span>
      </div>

      <div className="prose-gita mt-8">
        <p>
          <strong>Gita Quest</strong> is a beginner-friendly platform that helps
          you understand, remember, and apply the teachings of the Bhagavad
          Gita.
        </p>
        <p>
          Many people want to learn the Gita but find traditional translations
          difficult. Sanskrit terminology can feel overwhelming, and most
          websites are built for reading — not learning. Younger learners often
          forget what they read, and there&apos;s little to keep them engaged
          after a chapter ends.
        </p>
        <p>
          Gita Quest solves this by turning each of the 18 chapters into a
          simple, friendly lesson — followed by a quiz, points, badges, and a
          daily streak that builds a real habit.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card>
          <div className="p-5">
            <h2 className="font-serif text-xl font-semibold text-maroon">
              Simple language
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Every summary is rewritten in plain English. A 12-year-old should
              comfortably understand it.
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h2 className="font-serif text-xl font-semibold text-maroon">
              Original content
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              All summaries and quizzes are original, written from source
              material — never copied.
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h2 className="font-serif text-xl font-semibold text-maroon">
              Practical focus
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Each chapter includes real-life examples for school, career,
              relationships, and daily life.
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h2 className="font-serif text-xl font-semibold text-maroon">
              Learn by doing
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              25 quiz questions per chapter with instant feedback help you
              actually retain what you learn.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
