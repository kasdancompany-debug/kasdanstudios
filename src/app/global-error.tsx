"use client";

/** Last-resort boundary when the root layout itself fails. Self-contained styles. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-CA">
      <body style={{ background: "#0c0b09", color: "#eee7da", fontFamily: "Georgia, serif", margin: 0 }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 8vw",
          }}
        >
          <p style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: 3, color: "#c7aa76" }}>kasdan studios</p>
          <h1 style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", fontWeight: 400, lineHeight: 1, margin: "24px 0" }}>
            Something went wrong.
          </h1>
          <button
            type="button"
            onClick={reset}
            style={{
              alignSelf: "flex-start",
              background: "#eee7da",
              color: "#0c0b09",
              border: 0,
              padding: "16px 28px",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
