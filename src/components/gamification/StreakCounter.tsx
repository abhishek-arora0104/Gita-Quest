export function StreakCounter({
  current,
  longest,
}: {
  current: number;
  longest: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-saffron to-maroon text-2xl text-cream shadow-sm">
          🔥
        </span>
        <p className="mt-1 font-serif text-2xl font-bold text-maroon">
          {current}
        </p>
        <p className="text-xs text-ink-muted">current streak</p>
      </div>
      {longest > current && (
        <div className="text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-parchment text-2xl">
            🏆
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-gold-dark">
            {longest}
          </p>
          <p className="text-xs text-ink-muted">longest streak</p>
        </div>
      )}
    </div>
  );
}
