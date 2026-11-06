export default function ImageGeneratingIndicator() {
  return (
    <div className="max-w-md rounded-2xl bg-card p-4">
      <div className="aspect-square animate-pulse rounded-xl bg-muted" />
      <p className="mt-3 text-sm text-muted">Generating Image...</p>
    </div>
  );
}
