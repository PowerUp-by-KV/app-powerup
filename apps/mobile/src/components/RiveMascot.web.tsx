import React from "react";
import { View } from "react-native";

interface RiveMascotProps {
  width?: number;
  height?: number;
}

export function RiveMascot({ width = 200, height = 200 }: RiveMascotProps) {
  return (
    <View style={{ width, height, alignItems: "center", justifyContent: "center" }}>
      {/* Premium Animated Funny Mascot */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: "float 4s ease-in-out infinite",
          transformOrigin: "center center",
        }}
      >
        <defs>
          {/* Gradients */}
          <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="neonRing" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* CSS Micro-animations */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            @keyframes blink {
              0%, 90%, 100% { transform: scaleY(1); }
              95% { transform: scaleY(0.1); }
            }
            @keyframes pulseHeart {
              0%, 100% { transform: scale(1) translate(-50%, -50%); opacity: 0.8; }
              50% { transform: scale(1.25) translate(-40%, -40%); opacity: 1; }
            }
            @keyframes rotateRing {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes spinPropeller {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .blinking-eye {
              animation: blink 5s ease-in-out infinite;
              transform-origin: 100px 92px;
            }
            .pulsing-heart {
              animation: pulseHeart 2s ease-in-out infinite;
              transform-origin: 100px 142px;
            }
            .rotating-ring {
              animation: rotateRing 8s linear infinite;
              transform-origin: 100px 100px;
            }
            .spinning-propeller {
              animation: spinPropeller 1.2s linear infinite;
              transform-origin: 100px 22px;
            }
          `}</style>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="85" fill="url(#neonGlow)" />

        {/* Orbit Neon Ring */}
        <circle
          cx="100"
          cy="100"
          r="78"
          stroke="url(#neonRing)"
          strokeWidth="2.5"
          strokeDasharray="40 120 80 40"
          fill="none"
          className="rotating-ring"
          opacity="0.85"
        />

        {/* Funny Spinning Propeller Hat */}
        {/* Antenna Shaft */}
        <rect x="98" y="24" width="4" height="32" fill="#6366f1" rx="2" />
        {/* Propeller Hub */}
        <circle cx="100" cy="22" r="5" fill="#c084fc" stroke="#818cf8" strokeWidth="1.5" />
        {/* Rotating Propeller Blades */}
        <g className="spinning-propeller">
          <path
            d="M60,22 C60,18 140,18 140,22 C140,26 60,26 60,22 Z"
            fill="url(#neonRing)"
            opacity="0.9"
            style={{ filter: "drop-shadow(0px 0px 4px #818cf8)" }}
          />
          <circle cx="70" cy="22" r="3" fill="#ffffff" />
          <circle cx="130" cy="22" r="3" fill="#ffffff" />
        </g>

        {/* Headphones Band */}
        <path
          d="M60,82 C60,42 140,42 140,82"
          stroke="#4f46e5"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main Body */}
        <rect
          x="65"
          y="110"
          width="70"
          height="65"
          rx="32"
          fill="url(#bodyGrad)"
          stroke="#4f46e5"
          strokeWidth="2"
        />

        {/* Glowing Chest Core */}
        <circle cx="100" cy="142" r="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
        <path
          d="M100,137 L105,142 L100,147 L95,142 Z"
          fill="#c084fc"
          className="pulsing-heart"
          style={{ filter: "drop-shadow(0px 0px 4px #c084fc)" }}
        />

        {/* Floating Head */}
        <rect
          x="55"
          y="55"
          width="90"
          height="75"
          rx="38"
          fill="url(#faceGrad)"
          stroke="#6366f1"
          strokeWidth="3.5"
        />

        {/* Robotic Ears / Wing Tips */}
        <path d="M50,92 L35,80 L55,75 Z" fill="#4f46e5" stroke="#6366f1" strokeWidth="1.5" />
        <path d="M150,92 L165,80 L145,75 Z" fill="#4f46e5" stroke="#6366f1" strokeWidth="1.5" />

        {/* Headphones Cups */}
        <rect
          x="46"
          y="78"
          width="10"
          height="26"
          rx="5"
          fill="#312e81"
          stroke="#818cf8"
          strokeWidth="2"
        />
        <rect
          x="144"
          y="78"
          width="10"
          height="26"
          rx="5"
          fill="#312e81"
          stroke="#818cf8"
          strokeWidth="2"
        />

        {/* Glowing Faceplate Screen Inner */}
        <rect x="65" y="65" width="70" height="55" rx="28" fill="#090d16" />

        {/* Digital Cyan Eyes (Hilariously Googly & Derpy) */}
        <g className="blinking-eye">
          {/* Huge glowing left eye */}
          <circle cx="82" cy="88" r="11" fill="#38bdf8" />
          <circle cx="80" cy="86" r="3.5" fill="#ffffff" />

          {/* Tiny derpy right eye */}
          <circle cx="114" cy="94" r="5.5" fill="#38bdf8" />
          <circle cx="112" cy="92" r="1.5" fill="#ffffff" />
        </g>

        {/* Digital Blush cheeks */}
        <ellipse cx="76" cy="102" rx="4" ry="2" fill="#c084fc" opacity="0.6" />
        <ellipse cx="124" cy="102" rx="4" ry="2" fill="#c084fc" opacity="0.6" />

        {/* Goofy Screen Smile (Tongue Sticking Out!) */}
        {/* Mouth base */}
        <path
          d="M90,102 Q100,114 110,102"
          stroke="#38bdf8"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cute pink tongue */}
        <path
          d="M96,108 Q100,117 104,108"
          fill="#ef4444"
          stroke="#fda4af"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </View>
  );
}
