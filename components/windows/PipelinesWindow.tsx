// Original pixel art: two generic plumbers (indigo / vermilion overalls, no caps with
// letters, no names) inspecting warp-style pipes. Drawn from character maps below.

const PALETTE: Record<string, string> = {
  G: "#5E8C5A", // pipe
  g: "#3F6B3C", // pipe shade
  K: "#1E1B18", // ink: hair, moustache, boots
  S: "#E8B48A", // skin
  I: "#2C3E63", // indigo
  V: "#D9472B", // vermilion
  Y: "#FFF3A8", // buttons
  W: "#FBF7EF", // shirt highlight
};

const PIPE_RIM = ["GGGGGGGGGGGG", "GgGGGGGGGGgG", "GGGGGGGGGGGG"];
const PIPE_BODY = ".GgGGGGGGgG.";

// c = cap, t = shirt, o = overalls (substituted per plumber)
const PLUMBER = [
  "...cccc.",
  "..cccccc",
  "..KSSSK.",
  "..SSSSSS",
  "..SKKKKS",
  "...SSSS.",
  "..tooot.",
  ".ttoYott",
  ".SooooS.",
  "..ooooo.",
  "..oo.oo.",
  ".KKK.KKK",
];

const COLS = 52;
const ROWS = 19;

function compose(): string[][] {
  const grid = Array.from({ length: ROWS }, () => Array<string>(COLS).fill("."));
  const put = (rows: string[], x: number, y: number) =>
    rows.forEach((r, dy) => [...r].forEach((ch, dx) => ch !== "." && (grid[y + dy][x + dx] = ch)));
  const pipe = (x: number, top: number) => {
    put(PIPE_RIM, x, top);
    for (let y = top + 3; y < ROWS - 1; y++) put([PIPE_BODY], x, y);
  };
  const plumber = (x: number, cap: string, shirt: string, overalls: string) =>
    put(PLUMBER.map((r) => r.replace(/c/g, cap).replace(/t/g, shirt).replace(/o/g, overalls)), x, ROWS - 1 - PLUMBER.length);

  pipe(1, 3);
  pipe(39, 8);
  plumber(16, "K", "W", "I");
  plumber(27, "I", "Y", "V");
  // ground
  for (let x = 0; x < COLS; x++) grid[ROWS - 1][x] = "K";
  return grid;
}

const GRID = compose();

export function PipelinesWindow() {
  return (
    <figure>
      <svg
        role="img"
        aria-label="Pixel art: two pipeline engineers inspecting leaky warp pipes"
        viewBox={`0 0 ${COLS} ${ROWS}`}
        className="w-full rounded-md border-[1.5px] border-ink bg-paper"
        shapeRendering="crispEdges"
      >
        {GRID.flatMap((row, y) =>
          row.map((ch, x) =>
            ch === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={PALETTE[ch]} />,
          ),
        )}
        <text x={7} y={11} textAnchor="middle" fontSize={2.6} fontFamily="monospace" fontWeight={700} fill="#FBF7EF">
          ETL
        </text>
        {/* leak */}
        {[0, 0.6, 1.2].map((delay) => (
          <rect
            key={delay}
            x={13.2}
            y={5}
            width={0.8}
            height={1.2}
            fill="#7FA7D9"
            className="pipeline-drip"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </svg>
      <figcaption className="mt-3 text-sm text-muted">Two certified pipeline engineers inspecting your ETL.</figcaption>
    </figure>
  );
}
