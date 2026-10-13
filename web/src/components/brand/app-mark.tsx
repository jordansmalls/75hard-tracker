/**
 * The app icon: a completed day, as a white circle with a check on dodger blue.
 * Rendered by `next/og`, so it sticks to inline styles and plain SVG.
 */
export function AppMark({ size, radius = 0 }: { size: number; radius?: number }) {
  const circle = Math.round(size * 0.56);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1e90ff",
        borderRadius: radius,
      }}
    >
      <div
        style={{
          width: circle,
          height: circle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: "50%",
        }}
      >
        <svg width={circle * 0.6} height={circle * 0.6} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="#1e90ff"
            strokeWidth={3.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
