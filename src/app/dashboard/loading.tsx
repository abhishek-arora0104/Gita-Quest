import { Card } from "@/components/ui/Card";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-parchment" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded-lg bg-parchment" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 animate-pulse rounded-full bg-parchment" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-parchment" />
        </div>
      </div>

      {/* Stats row skeleton */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="p-5 flex flex-col items-center justify-center">
              <div className="h-4 w-24 animate-pulse rounded bg-parchment" />
              <div className="mt-2 h-10 w-16 animate-pulse rounded bg-parchment" />
            </div>
          </Card>
        ))}
      </div>

      {/* XP & Level skeleton */}
      <Card className="mt-6">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="h-6 w-32 animate-pulse rounded bg-parchment" />
          <div className="h-4 w-full animate-pulse rounded-full bg-parchment" />
        </div>
      </Card>

      {/* Chapter progress skeleton */}
      <section className="mt-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-parchment mb-2" />
        <div className="h-4 w-64 animate-pulse rounded bg-parchment mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-parchment shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 animate-pulse rounded bg-parchment" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-parchment" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-parchment" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
