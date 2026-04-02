import { useMemo } from "react";

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

function generateStars(count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const size = Math.random() * 2 + 0.5;
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size,
      delay: `${(Math.random() * 8).toFixed(2)}s`,
      duration: `${(Math.random() * 4 + 2).toFixed(2)}s`,
      opacity: Math.random() * 0.6 + 0.2,
    });
  }
  return stars;
}

export default function SpaceBackground() {
  const stars = useMemo(() => generateStars(220), []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#000008",
      }}
    >
      {/* Nebula glow blobs */}
      <div
        style={{
          position: "absolute",
          width: "60vw",
          height: "50vh",
          top: "-10%",
          left: "-10%",
          background:
            "radial-gradient(ellipse at center, oklch(0.28 0.12 290 / 0.18) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "nebulaDrift1 40s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "55vw",
          height: "45vh",
          bottom: "-5%",
          right: "-10%",
          background:
            "radial-gradient(ellipse at center, oklch(0.32 0.1 220 / 0.15) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "nebulaDrift2 50s ease-in-out infinite alternate",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "40vw",
          height: "35vh",
          top: "40%",
          left: "30%",
          background:
            "radial-gradient(ellipse at center, oklch(0.26 0.09 260 / 0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "nebulaDrift3 35s ease-in-out infinite alternate",
        }}
      />

      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          style={{
            position: "absolute",
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            borderRadius: "50%",
            backgroundColor: "#ffffff",
            opacity: star.opacity,
            animation: `twinkle ${star.duration} ${star.delay} ease-in-out infinite alternate`,
            boxShadow:
              star.size > 2
                ? `0 0 ${star.size * 2}px rgba(180,220,255,0.6)`
                : "none",
          }}
        />
      ))}

      <style>{`
        @keyframes twinkle {
          0%   { opacity: var(--star-lo, 0.1); transform: scale(1); }
          100% { opacity: var(--star-hi, 0.9); transform: scale(1.3); }
        }

        @keyframes nebulaDrift1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(5vw, 4vh) scale(1.15); }
        }
        @keyframes nebulaDrift2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-6vw, -3vh) scale(1.1); }
        }
        @keyframes nebulaDrift3 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3vw, -5vh) scale(1.12); }
        }
      `}</style>
    </div>
  );
}
