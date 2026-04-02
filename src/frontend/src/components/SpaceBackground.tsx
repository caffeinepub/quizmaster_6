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
    const size = Math.random() * 2.5 + 0.8;
    stars.push({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size,
      delay: `${(Math.random() * 8).toFixed(2)}s`,
      duration: `${(Math.random() * 4 + 2).toFixed(2)}s`,
      opacity: Math.random() * 0.5 + 0.5,
    });
  }
  return stars;
}

const PLANETS = [
  {
    name: "mercury",
    color: "#b5b5b5",
    size: 6,
    orbitRadius: 70,
    speed: 8,
    tilt: 10,
  },
  {
    name: "venus",
    color: "#e8cda0",
    size: 10,
    orbitRadius: 110,
    speed: 12,
    tilt: 6,
  },
  {
    name: "earth",
    color: "#4fa3e0",
    size: 11,
    orbitRadius: 155,
    speed: 18,
    tilt: 3,
  },
  {
    name: "mars",
    color: "#c1440e",
    size: 8,
    orbitRadius: 200,
    speed: 24,
    tilt: 8,
  },
  {
    name: "jupiter",
    color: "#c88b3a",
    size: 22,
    orbitRadius: 265,
    speed: 38,
    tilt: 4,
  },
  {
    name: "saturn",
    color: "#e4d191",
    size: 18,
    orbitRadius: 330,
    speed: 52,
    tilt: 7,
  },
];

export default function SpaceBackground() {
  const stars = useMemo(() => generateStars(240), []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: "oklch(0.07 0.018 255)",
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
            "radial-gradient(ellipse at center, oklch(0.30 0.14 290 / 0.22) 0%, transparent 70%)",
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
            "radial-gradient(ellipse at center, oklch(0.35 0.12 220 / 0.18) 0%, transparent 70%)",
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
            "radial-gradient(ellipse at center, oklch(0.28 0.1 260 / 0.14) 0%, transparent 70%)",
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
                ? `0 0 ${star.size * 3}px rgba(180,220,255,0.9), 0 0 ${star.size}px rgba(255,255,255,0.8)`
                : `0 0 ${star.size * 2}px rgba(180,220,255,0.5)`,
          }}
        />
      ))}

      {/* Solar System -- bottom right corner decorative */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          right: "3%",
          width: "700px",
          height: "700px",
          opacity: 0.55,
        }}
      >
        {/* Sun */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #fff9a0 0%, #ffcc00 40%, #ff8800 100%)",
            boxShadow:
              "0 0 30px rgba(255,200,0,0.9), 0 0 60px rgba(255,160,0,0.5), 0 0 100px rgba(255,100,0,0.25)",
          }}
        />

        {/* Orbit rings + planets */}
        {PLANETS.map((planet) => (
          <div
            key={planet.name}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: `${planet.orbitRadius * 2}px`,
              height: `${planet.orbitRadius * 2}px`,
              marginTop: `-${planet.orbitRadius}px`,
              marginLeft: `-${planet.orbitRadius}px`,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: `${planet.orbitRadius * 2}px`,
                height: `${planet.orbitRadius * 2}px`,
                marginTop: `-${planet.orbitRadius}px`,
                marginLeft: `-${planet.orbitRadius}px`,
                animation: `orbit${planet.name} ${planet.speed}s linear infinite`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "50%",
                  transform: "translateX(-50%) translateY(-50%)",
                  width: `${planet.size}px`,
                  height: `${planet.size}px`,
                  borderRadius: "50%",
                  background:
                    planet.name === "saturn"
                      ? `radial-gradient(circle at 35% 35%, ${planet.color}, #b8a55a)`
                      : planet.name === "earth"
                        ? `radial-gradient(circle at 35% 35%, #7ec8f0, ${planet.color})`
                        : planet.name === "jupiter"
                          ? `radial-gradient(circle at 35% 35%, #e0aa5a, ${planet.color})`
                          : `radial-gradient(circle at 35% 35%, white 0%, ${planet.color} 60%)`,
                  boxShadow: `0 0 ${planet.size}px ${planet.color}88`,
                }}
              >
                {/* Saturn ring */}
                {planet.name === "saturn" && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%) rotateX(70deg)",
                      width: `${planet.size * 2.8}px`,
                      height: `${planet.size * 2.8}px`,
                      borderRadius: "50%",
                      border: "3px solid rgba(228,209,145,0.6)",
                      boxSizing: "border-box",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%   { opacity: 0.3; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.4); }
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
        @keyframes orbitmercury  { from { transform: rotate(0deg);   } to { transform: rotate(360deg);   } }
        @keyframes orbitvenus    { from { transform: rotate(0deg);   } to { transform: rotate(360deg);   } }
        @keyframes orbitearth    { from { transform: rotate(45deg);  } to { transform: rotate(405deg);  } }
        @keyframes orbitmars     { from { transform: rotate(90deg);  } to { transform: rotate(450deg);  } }
        @keyframes orbitjupiter  { from { transform: rotate(180deg); } to { transform: rotate(540deg);  } }
        @keyframes orbitsaturn   { from { transform: rotate(270deg); } to { transform: rotate(630deg);  } }
      `}</style>
    </div>
  );
}
