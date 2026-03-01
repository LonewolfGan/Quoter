import { useNavigate } from "react-router-dom";
import { useTitle } from "../hooks";
import { CATEGORIES_LIST, slugify } from "../utils/categoryHelper";
import {
  Heart,
  Sparkles,
  Smile,
  Brain,
  Trophy,
  Users,
  Flower2,
  Zap,
  Sprout,
  Rocket,
} from "lucide-react";

const categoryIcons = {
  amour: Heart,
  amitie: Users,
  bonheur: Smile,
  vie: Flower2,
  motivation: Zap,
  reussite: Trophy,
  philosophie: Brain,
  sagesse: Brain,
  liberte: Rocket,
  espoir: Sprout,
  default: Sparkles,
};

const HEX_SIZE = 150;
const GAP = 25;

export const Categories = () => {
  const title = "Quoter - Catégories";
  useTitle({ title });
  const navigate = useNavigate();

  const categories = CATEGORIES_LIST;

  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1100;

  const COLS = isMobile ? 2 : isTablet ? 4 : 5;
  const EFFECTIVE_HEX_SIZE = isMobile || isTablet ? 130 : HEX_SIZE;
  const EFFECTIVE_HEX_HEIGHT = Math.sqrt(3) * EFFECTIVE_HEX_SIZE;
  const EFFECTIVE_HEX_WIDTH = EFFECTIVE_HEX_SIZE * 2;

  const totalCols = COLS;
  const totalRows = Math.ceil(categories.length / COLS);

  const horizDist = EFFECTIVE_HEX_SIZE * 1.5 + GAP;
  const vertDist = EFFECTIVE_HEX_HEIGHT + GAP;
  const svgWidth = (totalCols - 1) * horizDist + EFFECTIVE_HEX_WIDTH + 40;
  const svgHeight =
    (totalRows - 1) * vertDist + EFFECTIVE_HEX_HEIGHT + vertDist / 2 + 40;

  const hexPositions = categories.map((_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const isOddCol = col % 2 === 1;
    const x = col * horizDist + 20;
    const y = row * vertDist + (isOddCol ? vertDist / 2 : 0) + 20;
    return { x, y };
  });

  return (
    <>
      <style>{`
        .categories-page {
          background: #fff;
          min-height: auto;
          padding: 3rem 1rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .categories-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          text-align: center;
          color: #0a0a0a;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }

        .categories-subtitle {
          text-align: center;
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: #888;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
          font-style: italic;
        }

        .hex-container {
          width: 100%;
          max-width: 1500px;
          margin: 60px auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hex-svg-wrapper {
          display: flex;
          justify-content: center;
          overflow: visible;
        }

        .hex-svg-wrapper svg {
          overflow: visible;
        }

        .hex-link {
          cursor: pointer;
          text-decoration: none;
        }

        .hex-shape {
          fill: rgba(255,255,255,0.7);
          stroke: #1a1a1a;
          stroke-width: 1.5;
          backdrop-filter: blur(12px);
          transition: fill 0.25s ease;
        }

        .hex-bg-glass {
          fill: rgba(245,245,245,0.6);
          transition: fill 0.25s ease;
        }

        .hex-link:hover .hex-shape,
        .hex-link:active .hex-shape {
          fill: #0a0a0a;
          stroke: transparent;
          stroke-width: 0;
        }

        .hex-link:hover .hex-icon,
        .hex-link:active .hex-icon {
          color: #fff !important;
        }

        .hex-link:hover .hex-label,
        .hex-link:active .hex-label {
          fill: #fff;
        }

        .hex-link:hover .hex-bg-glass,
        .hex-link:active .hex-bg-glass {
          fill: #0a0a0a;
        }

        .hex-icon {
          color: #1a1a1a;
          transition: color 0.25s ease;
          pointer-events: none;
        }

        .hex-label {
          fill: #1a1a1a;
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          transition: fill 0.25s ease;
          pointer-events: none;
        }

        .hex-link {
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.08));
          transition: filter 0.25s ease, transform 0.25s ease;
          transform-origin: center;
        }

        .hex-link:hover,
        .hex-link:active {
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.18));
          transform: translateY(-4px);
        }
      `}</style>

      <main className="categories-page">
        <h1 className="categories-title">Catégories</h1>
        <p className="categories-subtitle">
          Explorez les citations par thématiques
        </p>

        <div className="hex-container">
          <div className="hex-svg-wrapper">
            <svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: "100%", height: "auto", overflow: "visible" }}
            >
              {categories.map((category, i) => {
                // IMPORTANT: On utilise le slug pour trouver l'icône, c'est ce qu'il y a de plus sûr
                const slug = slugify(category);
                const Icon = categoryIcons[slug] || categoryIcons.default;

                const { x, y } = hexPositions[i];
                const cx = x + EFFECTIVE_HEX_SIZE;
                const cy = y + EFFECTIVE_HEX_HEIGHT / 2;

                const points = Array.from({ length: 6 }, (_, k) => {
                  const angle = (Math.PI / 180) * 60 * k;
                  return `${cx + EFFECTIVE_HEX_SIZE * Math.cos(angle)},${cy + EFFECTIVE_HEX_SIZE * Math.sin(angle)}`;
                }).join(" ");

                const innerPoints = Array.from({ length: 6 }, (_, k) => {
                  const angle = (Math.PI / 180) * 60 * k;
                  const r = EFFECTIVE_HEX_SIZE - 4;
                  return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
                }).join(" ");

                return (
                  <g
                    key={category}
                    className="hex-link"
                    onClick={() => navigate(`/categories/${slug}`)}
                  >
                    <polygon points={points} className="hex-bg-glass" />
                    <polygon points={points} className="hex-shape" />
                    <polygon
                      points={innerPoints}
                      fill="rgba(255,255,255,0.15)"
                      stroke="rgba(255,255,255,0.4)"
                      strokeWidth="0.5"
                      style={{ pointerEvents: "none" }}
                    />
                    <foreignObject
                      x={cx - 30}
                      y={cy - 50}
                      width={60}
                      height={60}
                      style={{ overflow: "visible", pointerEvents: "none" }}
                    >
                      <div
                        xmlns="http://www.w3.org/1999/xhtml"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <Icon
                          className="hex-icon"
                          style={{ width: 40, height: 40 }}
                          strokeWidth={1.5}
                        />
                      </div>
                    </foreignObject>
                    <text
                      x={cx}
                      y={cy + 45}
                      textAnchor="middle"
                      className="hex-label"
                    >
                      {category}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </main>
    </>
  );
};
