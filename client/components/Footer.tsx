"use client";

import Image from "next/image";
import { FaInstagram, FaTiktok, FaYoutube, FaDiscord } from "react-icons/fa";

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/it_community",
    Icon: FaInstagram,
  },
  { label: "TikTok", href: "https://www.tiktok.com/@itcblida", Icon: FaTiktok },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCAYbukLrqeu5JxuohPKpC4A",
    Icon: FaYoutube,
  },
  { label: "Discord", href: "https://discord.gg/6PGdMJzAk8", Icon: FaDiscord },
];

export default function Footer() {
  return (
    <footer className="relative mt-24 bg-black">
      <div className="relative">
        <style>{`
          .waves {
            position: relative;
            width: 100%;
            height: 12vh;
            margin-bottom: -7px;
            min-height: 80px;
            max-height: 120px;
          }
          .parallax > use {
            animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
          }
          .parallax > use:nth-child(1) {
            animation-delay: -2s;
            animation-duration: 7s;
          }
          .parallax > use:nth-child(2) {
            animation-delay: -3s;
            animation-duration: 10s;
          }
          .parallax > use:nth-child(3) {
            animation-delay: -4s;
            animation-duration: 13s;
          }
          .parallax > use:nth-child(4) {
            animation-delay: -5s;
            animation-duration: 20s;
          }
          @keyframes move-forever {
            0% {
              transform: translate3d(-90px, 0, 0);
            }
            100% {
              transform: translate3d(85px, 0, 0);
            }
          }
          @media (max-width: 768px) {
            .waves {
              height: 40px;
              min-height: 40px;
            }
          }
        `}</style>

        <svg
          className="waves"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28"
          preserveAspectRatio="none"
          shapeRendering="auto"
        >
          <defs>
            <path
              id="gentle-wave"
              d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
            />
          </defs>
          <g className="parallax">
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="0"
              fill="rgba(239,68,68,0.25)"
            />
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="3"
              fill="rgba(239,68,68,0.15)"
            />
            <use
              xlinkHref="#gentle-wave"
              x="48"
              y="5"
              fill="rgba(255,255,255,0.06)"
            />
            <use xlinkHref="#gentle-wave" x="48" y="7" fill="#0a0a0a" />
          </g>
        </svg>
      </div>

      <div className="bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 pt-8 pb-24 sm:flex-row sm:px-6 sm:pb-8">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-5">
            <Image
              src="/itc-logo-des-CZ47NEiM.png"
              alt="ITC Logo"
              width={500}
              height={500}
              className="h-auto w-[72px]"
            />
            <div className="flex flex-col items-center gap-0.5 text-center sm:items-start sm:text-left">
              <span className="font-heading text-sm font-semibold tracking-tight text-white">
                IT Community · University of Blida 1
              </span>
              <a
                href="mailto:contact.itc.blida@gmail.com"
                className="text-[13px] text-neutral-400 transition-colors duration-200 hover:text-red-500"
              >
                contact.itc.blida@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 transition-colors duration-200 hover:text-red-500"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
