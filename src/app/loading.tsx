/** Shown only while a route segment is streaming; static pages rarely need it. */
export default function Loading() {
  return (
    <div className="shell flex min-h-[80svh] items-center pt-28" role="status" aria-live="polite">
      <span className="type-label flex items-center gap-4 text-mute">
        <span aria-hidden className="relative h-px w-16 overflow-hidden bg-line">
          <span className="absolute inset-y-0 left-0 w-1/3 animate-[loading_1.2s_ease-in-out_infinite] bg-gold" />
        </span>
        Loading
      </span>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}
