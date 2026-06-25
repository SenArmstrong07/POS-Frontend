import { useState, useEffect } from "react";

const STRIPS = [
  [
    { rev: false, delay: -0.9 },
    { rev: true,  delay: -0.85 },
    { rev: false, delay: -0.8 },
    { rev: true,  delay: -0.75 },
    { rev: false, delay: -0.7 },
  ],
  [
    { rev: false, delay: -0.05 },
    { rev: true,  delay: -0.1 },
    { rev: false, delay: -1.0 },
    { rev: true,  delay: -0.83 },
    { rev: false, delay: -0.67 },
    { rev: true,  delay: -0.65 },
    { rev: false, delay: -0.6 },
  ],
  [
    { rev: true,  delay: -0.15 },
    { rev: false, delay: -0.2 },
    { rev: true,  delay: -0.17 },
    { rev: false, delay: -0.33 },
    { rev: true,  delay: -0.5 },
    { rev: false, delay: -0.55 },
    { rev: true,  delay: -0.5 },
  ],
  [
    { rev: true,  delay: -0.25 },
    { rev: false, delay: -0.3 },
    { rev: true,  delay: -0.35 },
    { rev: false, delay: -0.4 },
    { rev: true,  delay: -0.45 },
  ],
];

export default function LoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onComplete, 2800);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className={`loading-overlay ${visible ? "loading-overlay--visible" : ""}`}>
      <div className="loading-backdrop" />

      <div className="loading-center">
        <div className="loading-grid">
          {STRIPS.map((strip, si) => (
            <div key={si} className="loading-strip">
              {strip.map((tip, ti) => (
                <div
                  key={ti}
                  className={`loading-tip ${tip.rev ? "loading-tip--rev" : ""}`}
                  style={{ animationDelay: `${tip.delay}s` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: all;
        }
        .loading-overlay--visible {
          opacity: 1;
        }
        .loading-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(5,5,9,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .loading-center {
          position: relative;
          z-index: 1;
          animation: loadingPop 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .loading-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .loading-strip {
          display: flex;
        }
        .loading-tip {
          width: 0;
          height: 0;
          margin: 0 -6px;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 22px solid #48fd00;
          filter: drop-shadow(0 0 18px rgba(72,253,0,0.7));
          animation: loadingPulse 1s infinite;
        }
        .loading-tip--rev {
          transform: rotate(180deg);
        }
        @keyframes loadingPulse {
          0%   { opacity: 0.08; }
          30%  { opacity: 1; }
          100% { opacity: 0.08; }
        }
        @keyframes loadingPop {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}