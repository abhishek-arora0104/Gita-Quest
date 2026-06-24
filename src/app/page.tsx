import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="bg-paper relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-4 py-1.5 text-sm font-medium text-maroon">
            <span aria-hidden="true">🕉️</span> 18 Chapters · Simplified ·
            Beginner-Friendly
          </p>
          <h1 className="mx-auto max-w-3xl font-serif text-4xl font-bold leading-tight text-maroon sm:text-5xl lg:text-6xl">
            Understand the Bhagavad Gita in{" "}
            <span className="text-saffron">Simple Language</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Read, learn, quiz, and grow through all 18 chapters. Simplified
            summaries, practical examples, and engaging quizzes that make the
            teachings easy to understand, remember, and apply.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/auth/signup" size="lg" className="w-full sm:w-auto">
              Start Learning
            </Button>
            <Button
              href="/chapters"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              View Chapters
            </Button>
          </div>

          <div
            className="divider-ornament mt-14"
            aria-hidden="true"
          >
            <span className="text-2xl">❖</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-serif text-3xl font-semibold text-maroon">
          How Gita Quest works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-soft">
          Four simple steps that turn reading into real understanding.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "📖",
              title: "Read",
              text: "Easy summaries written in simple English with practical examples from daily life.",
            },
            {
              icon: "🧘",
              title: "Reflect",
              text: "Pause and think about how each teaching applies to your own life.",
            },
            {
              icon: "✅",
              title: "Quiz",
              text: "Test what you learned with 25 questions per chapter and instant feedback.",
            },
            {
              icon: "🏆",
              title: "Grow",
              text: "Earn XP, level up, unlock badges, and build a daily learning streak.",
            },
          ].map((step, i) => (
            <Card key={step.title} className="text-center">
              <div className="p-6">
                <div
                  className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-parchment text-2xl"
                  aria-hidden="true"
                >
                  {step.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-wide text-saffron">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-serif text-xl font-semibold text-maroon">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft">{step.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-parchment/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-maroon">
                Built for modern learners
              </h2>
              <p className="mt-4 text-ink-soft">
                Traditional translations can be hard to follow. Gita Quest
                rewrites each chapter so a young student can comfortably
                understand it — then keeps you engaged with rewards and
                gamification.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Plain-English summaries, 1000–2000 words each",
                  "Every Sanskrit term explained simply",
                  "5–10 practical examples per chapter",
                  "25 quiz questions with instant feedback",
                  "XP, levels, badges, and daily streaks",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-leaf text-xs text-white"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/chapters">Browse all 18 chapters</Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-maroon to-saffron p-8 text-center text-cream">
                <p className="text-sm uppercase tracking-wide opacity-80">
                  The Journey
                </p>
                <p className="mt-2 font-serif text-5xl font-bold">18</p>
                <p className="opacity-90">Chapters of timeless wisdom</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gold/20 text-center">
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">450</p>
                  <p className="text-xs text-ink-soft">Quiz questions</p>
                </div>
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">10</p>
                  <p className="text-xs text-ink-soft">Levels</p>
                </div>
                <div className="p-5">
                  <p className="font-serif text-2xl font-bold text-maroon">
                    10+
                  </p>
                  <p className="text-xs text-ink-soft">Badges</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <div className="divider-ornament mb-8" aria-hidden="true">
          <span className="text-2xl">❖</span>
        </div>
        <h2 className="font-serif text-3xl font-semibold text-maroon sm:text-4xl">
          Begin your journey through the Gita
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          Start with Chapter 1 — Arjuna&apos;s Dilemma — and discover teachings
          that have guided seekers for thousands of years.
        </p>
        <div className="mt-8">
          <Button href="/auth/signup" size="lg">
            Create a free account
          </Button>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Already learning?{" "}
          <Link href="/auth/login" className="text-saffron hover:underline">
            Log in
          </Link>
        </p>
      </section>
    </>
  );
}
