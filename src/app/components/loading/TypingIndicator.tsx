export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-card px-4 py-3">
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-2 w-2 animate-bounce rounded-full bg-muted"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
