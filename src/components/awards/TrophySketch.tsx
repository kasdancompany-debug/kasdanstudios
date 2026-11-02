"use client";

import { useId, type CSSProperties } from "react";

/**
 * Hand-inked trophy drawings for the awards reel.
 *
 * Each drawing is a list of pen strokes (SVG path data) in a 200×260 box.
 * They're rendered twice — a firm ink line and a faint offset "pencil
 * pass" — through a turbulence filter that gives every line a hand-drawn
 * wobble, over a loose watercolour wash. Strokes ink themselves in, one
 * after another, when the frame scrolls into view (see globals.css).
 *
 * These are interpretive sketches, not reproductions of any trademarked
 * statuette or logo.
 */

export type TrophyKind =
  "emmy" | "quill" | "pencil" | "ribbon" | "muse" | "bottle" | "certificate" | "hooded" | "pitch";

/* ------------------------------------------------------------------ */
/* Pen helpers                                                         */
/* ------------------------------------------------------------------ */

const r = (n: number) => Math.round(n * 10) / 10;

/** Ellipse as a path, optionally rotated (degrees). */
function E(cx: number, cy: number, rx: number, ry: number, rot = 0) {
  const a = (rot * Math.PI) / 180;
  const x0 = cx - Math.cos(a) * rx;
  const y0 = cy - Math.sin(a) * rx;
  const x1 = cx + Math.cos(a) * rx;
  const y1 = cy + Math.sin(a) * rx;
  return `M${r(x0)} ${r(y0)} A${rx} ${ry} ${rot} 1 0 ${r(x1)} ${r(y1)} A${rx} ${ry} ${rot} 1 0 ${r(x0)} ${r(y0)}`;
}

/** Parallel hatch strokes filling a band — the shading. */
function hatch(x: number, y: number, w: number, h: number, gap = 4, slant = 6) {
  const out: string[] = [];
  for (let i = 0; i <= w; i += gap) out.push(`M${r(x + i)} ${r(y)} L${r(x + i - slant)} ${r(y + h)}`);
  return out.join(" ");
}

/** An almond leaf from (x,y) toward (dx,dy). */
function leaf(x: number, y: number, dx: number, dy: number) {
  const nx = -dy * 0.35;
  const ny = dx * 0.35;
  return `M${r(x)} ${r(y)} Q${r(x + dx / 2 + nx)} ${r(y + dy / 2 + ny)} ${r(x + dx)} ${r(y + dy)} Q${r(x + dx / 2 - nx)} ${r(y + dy / 2 - ny)} ${r(x)} ${r(y)}`;
}

/** A laurel branch rising from the base on one side. */
function laurel(side: 1 | -1) {
  const sx = (x: number) => 100 + side * x;
  const stem = `M${sx(34)} 228 C${sx(52)} 204 ${sx(56)} 176 ${sx(48)} 148`;
  const leaves = [
    leaf(sx(38), 222, side * 14, -6),
    leaf(sx(46), 206, side * 14, -8),
    leaf(sx(51), 188, side * 13, -10),
    leaf(sx(53), 170, side * 12, -12),
    leaf(sx(42), 214, -side * 10, -10),
    leaf(sx(49), 196, -side * 10, -12),
    leaf(sx(52), 178, -side * 9, -12),
  ];
  return [stem, ...leaves];
}

/** Two-tier plinth most trophies stand on. */
const plinth = [
  E(100, 222, 40, 6),
  "M60 222 L62 238",
  "M140 222 L138 238",
  "M62 238 A38 6 0 0 0 138 238",
  hatch(116, 226, 18, 10, 4, 3),
];

/* ------------------------------------------------------------------ */
/* Drawings                                                            */
/* ------------------------------------------------------------------ */

type Drawing = { strokes: string[]; accent: string; wash: [number, number, number, number] };

const DRAWINGS: Record<TrophyKind, Drawing> = {
  // Winged figure lifting an orbiting sphere
  emmy: {
    accent: "#e6b450",
    wash: [104, 120, 58, 92],
    strokes: [
      E(100, 226, 42, 6),
      "M58 226 L60 240",
      "M142 226 L140 240",
      "M60 240 A40 6 0 0 0 140 240",
      E(100, 212, 24, 4),
      "M76 212 L78 226",
      "M124 212 L122 226",
      hatch(110, 215, 12, 9, 3, 2),
      "M94 212 C95 200 96 194 97 186 M106 212 C105 200 104 194 103 186",
      "M97 186 C92 166 95 146 99 126 M103 186 C108 166 105 146 101 126",
      "M99 180 C100 160 100 146 100 132",
      E(100, 119, 5, 5.5),
      "M98 127 C91 113 89 101 92 91 M102 127 C109 113 111 101 108 91",
      "M103 138 C122 130 142 110 152 74 C143 96 133 108 118 118",
      "M118 127 C131 117 142 102 148 86 M112 132 C127 123 137 110 143 98",
      "M97 138 C78 130 58 110 48 74 C57 96 67 108 82 118",
      "M82 127 C69 117 58 102 52 86 M88 132 C73 123 63 110 57 98",
      E(100, 60, 5, 5),
      E(100, 60, 31, 9, 0),
      E(100, 60, 31, 9, 60),
      E(100, 60, 31, 9, -60),
    ],
  },

  // A quill standing inside a glass block
  quill: {
    accent: "#e9b84c",
    wash: [104, 140, 50, 90],
    strokes: [
      "M62 72 L132 62 L136 228 L66 234 Z",
      "M132 62 L148 72 L150 222 L136 228",
      "M62 72 L78 66 L148 72",
      hatch(138, 80, 10, 130, 5, 0),
      "M72 92 L80 156 M77 86 L82 112",
      "M96 214 C98 172 104 122 118 84",
      "M100 198 C86 162 92 116 118 84",
      "M100 198 C116 162 124 120 118 84",
      "M101 182 L91 173 M103 162 L93 151 M106 142 L97 129 M109 122 L103 109",
      "M102 180 L112 169 M105 160 L115 147 M108 140 L118 127 M111 120 L119 108",
      "M96 214 L94 224",
      "M78 214 L122 211 L123 224 L79 227 Z",
      "M56 236 C92 242 132 240 156 230",
    ],
  },

  // An upright, freshly sharpened pencil
  pencil: {
    accent: "#f2c230",
    wash: [100, 150, 34, 96],
    strokes: [
      "M82 98 L82 230 M118 98 L118 230",
      "M94 98 L94 233 M106 98 L106 233",
      "M82 230 C90 236 110 236 118 230",
      "M82 98 L100 42 L118 98",
      "M82 98 Q88 90 94 98 Q100 90 106 98 Q112 90 118 98",
      "M94 60 L100 42 L106 60 Q100 56 94 60",
      hatch(108, 104, 8, 120, 5, 2),
      "M66 238 C96 244 132 242 152 234",
    ],
  },

  // Two ribbons twisting upward to a small sphere
  ribbon: {
    accent: "#e2553a",
    wash: [100, 120, 46, 96],
    strokes: [
      ...plinth,
      "M90 216 C70 186 132 168 104 138 C84 114 128 94 108 64 C101 53 97 46 100 38",
      "M110 216 C130 186 70 170 98 140 C118 116 74 96 94 66 C100 56 104 48 100 38",
      "M96 216 C78 188 138 170 110 138 C90 114 134 94 114 64",
      "M104 216 C122 188 64 172 92 140 C112 116 68 96 88 66",
      E(100, 31, 6, 6),
    ],
  },

  // A draped classical figure, arms raised
  muse: {
    accent: "#e8cfb6",
    wash: [100, 128, 46, 98],
    strokes: [
      ...plinth,
      E(100, 60, 7, 8),
      "M98 68 L98 74 M102 68 L102 74",
      "M94 80 C84 66 87 46 98 38 M106 80 C116 66 113 46 102 38",
      "M94 78 C90 96 92 112 96 124 M106 78 C110 96 108 112 104 124",
      "M96 124 C88 160 80 194 74 218 M104 124 C112 160 120 194 126 218",
      "M74 218 C90 224 110 224 126 218",
      "M98 130 C96 160 92 190 90 218 M102 130 C106 165 108 194 110 218 M100 128 C100 170 100 198 100 220",
      "M96 96 C99 100 101 100 104 96",
    ],
  },

  // A bottle with a sprig of hops
  bottle: {
    accent: "#e48a3a",
    wash: [98, 140, 46, 90],
    strokes: [
      ...plinth,
      "M84 218 L84 128 C84 112 94 106 95 92 L95 64 L105 64 L105 92 C106 106 116 112 116 128 L116 218",
      "M94 64 L94 57 L106 57 L106 64",
      "M84 218 C92 222 108 222 116 218",
      "M86 150 L114 150 L114 188 L86 188 Z",
      "M90 132 L90 210",
      "M72 220 C64 188 58 158 62 126",
      E(58, 148, 7, 11, -15),
      E(67, 174, 7, 11, 10),
      E(57, 122, 6, 9, -20),
      "M53 145 Q58 142 63 147 M54 152 Q59 149 63 154 M62 171 Q67 168 72 173 M62 178 Q67 175 71 180",
      leaf(64, 138, -22, -4),
    ],
  },

  // A framed certificate with a ribboned seal
  certificate: {
    accent: "#e6b450",
    wash: [104, 140, 58, 82],
    strokes: [
      "M48 72 L150 62 L156 196 L54 204 Z",
      "M58 82 L141 73 L146 187 L63 194 Z",
      "M70 100 L130 95",
      "M72 116 C85 113 100 116 132 110",
      "M72 130 L120 126",
      "M74 146 C90 143 105 146 128 141",
      "M76 160 L110 157",
      E(132, 188, 15, 15),
      E(132, 188, 9, 9),
      "M124 201 L118 232 L126 226 L130 234 L132 204 M140 201 L147 230 L139 226 L135 233",
      "M46 214 C80 222 120 224 162 210",
    ],
  },

  // A hooded figure — something from the late show
  hooded: {
    accent: "#b8322a",
    wash: [100, 132, 48, 96],
    strokes: [
      ...plinth,
      "M100 56 C82 56 76 76 78 94 C80 108 84 114 88 118",
      "M100 56 C118 56 124 76 122 94 C120 108 116 114 112 118",
      "M90 90 C90 76 110 76 110 90 C110 102 90 102 90 90",
      hatch(92, 80, 16, 16, 3, 1),
      "M88 118 C76 150 66 190 60 218 M112 118 C124 150 134 190 140 218",
      "M60 218 L66 210 L72 220 L80 212 L88 222 L96 214 L104 222 L112 212 L120 220 L128 211 L134 220 L140 218",
      "M96 122 C92 158 88 188 86 216 M104 122 C110 158 114 188 116 216",
    ],
  },

  // A stage microphone between laurels
  pitch: {
    accent: "#e9a046",
    wash: [100, 120, 56, 96],
    strokes: [
      E(100, 230, 28, 5),
      "M98 230 L98 122 M102 230 L102 122",
      "M86 70 C86 52 114 52 114 70 L114 98 C114 114 86 114 86 98 Z",
      "M88 72 L112 72 M87 82 L113 82 M87 92 L113 92 M100 56 L100 110",
      "M80 90 C80 116 120 116 120 90",
      "M100 112 L100 122",
      "M60 62 L72 68 M57 82 L71 82 M66 42 L75 53 M140 62 L128 68 M143 82 L129 82 M134 42 L125 53",
      ...laurel(-1),
      ...laurel(1),
    ],
  },
};

export function TrophySketch({ kind, className }: { kind: TrophyKind; className?: string }) {
  const id = useId().replace(/:/g, "");
  const d = DRAWINGS[kind];
  const [wx, wy, wrx, wry] = d.wash;

  return (
    <svg viewBox="0 0 200 260" aria-hidden className={className} data-trophy>
      <defs>
        {/* Hand-drawn wobble for the ink lines */}
        <filter id={`ink-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" />
        </filter>
        {/* Bleeding, uneven edge for the watercolour wash */}
        <filter id={`wash-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="26" />
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <ellipse className="trophy-wash" cx={wx} cy={wy} rx={wrx} ry={wry} fill={d.accent} filter={`url(#wash-${id})`} />

      <g filter={`url(#ink-${id})`} fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Faint offset pencil pass under the ink */}
        <g transform="translate(1.1 0.8)" stroke="currentColor" strokeWidth={0.8} opacity={0.35}>
          {d.strokes.map((s, i) => (
            <path key={`p${i}`} d={s} pathLength={1} className="ink" style={{ "--i": i } as CSSProperties} />
          ))}
        </g>
        <g stroke="currentColor" strokeWidth={1.6}>
          {d.strokes.map((s, i) => (
            <path key={`i${i}`} d={s} pathLength={1} className="ink" style={{ "--i": i } as CSSProperties} />
          ))}
        </g>
      </g>
    </svg>
  );
}
