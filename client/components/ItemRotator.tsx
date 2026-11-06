"use client";

import { useEffect, useRef, useState } from "react";

const fields = [
  "Web Development",
  "Cybersecurity",
  "UI/UX Design",
  "Artificial Intelligence",
  "Mobile Development",
  "Competitive Programming",
  "Video Editing",
  "Cloud & DevOps",
  "Photography",
  "Motion Graphics",
];

const H = 56;
const N = fields.length;
const START = N - 3;

export default function ItemRotator() {
  const [offset, setOffset] = useState(START);
  const [noAnim, setNoAnim] = useState(false);
  const ref = useRef(START);

  useEffect(() => {
    const id = setInterval(() => {
      if (ref.current >= 2 * N - 4) {
        setNoAnim(true);
        ref.current = START;
        setOffset(START);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setNoAnim(false)),
        );
      } else {
        ref.current += 1;
        setOffset(ref.current);
      }
    }, 1800);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: 7 * H,
        maskImage:
          "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
      }}
    >
      <div
        className={
          noAnim
            ? ""
            : "transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] will-change-transform"
        }
        style={{ transform: `translateY(${168 - (offset + 3) * H}px)` }}
      >
        {[...fields, ...fields, ...fields].map((label, i) => {
          const dist = Math.abs(i - offset - 3);

          return (
            <div
              key={i}
              className="flex h-14 items-center justify-center gap-4 font-heading text-xl font-semibold tracking-tight sm:text-2xl"
              style={{
                opacity: dist === 0 ? 1 : Math.max(0.08, 0.32 - dist * 0.08),
                color: dist === 0 ? "#ffffff" : "#a3a3a3",
              }}
            >
              <svg
                viewBox="0 0 10 12"
                className={`h-3 w-2.5 ${dist === 0 ? "fill-red-500" : "fill-transparent"}`}
              >
                <path d="M0 0 L10 6 L0 12 Z" />
              </svg>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
