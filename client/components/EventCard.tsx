"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { FaLongArrowAltRight } from "react-icons/fa";

interface EventCardProps {
  id: string | number;
  image: string;
  title: string;
  description: string;
  date: string;
  location: string;
  department: string;
  capacity: number | null;
  priority?: boolean;
}

const departmentColors: Record<string, string> = {
  Internal: "bg-sky-400",
  External: "bg-emerald-400",
  Technical: "bg-violet-400",
  Communication: "bg-amber-400",
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function EventCard({
  id,
  image,
  title,
  description,
  date,
  location,
  department,
  capacity,
  priority = false,
}: EventCardProps) {
  return (
    <Link
      href={`/events/${id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-neutral-700"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out will-change-transform group-hover:-skew-y-2 group-hover:scale-110 group-hover:transform-gpu"
        />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium text-neutral-200 backdrop-blur-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${departmentColors[department] ?? "bg-neutral-400"}`}
          />
          {department}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="font-heading text-base font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-400">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <time dateTime={date}>{dateFormatter.format(new Date(date))}</time>
          <span className="h-1 w-1 rounded-full bg-neutral-600" />
          <span>{location}</span>
        </div>

        <p className="text-xs text-neutral-500">
          Capacity: {capacity ?? "Ouvert"}
        </p>

        <span className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors duration-200 group-hover:text-red-400">
          View details
          <FaLongArrowAltRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default memo(EventCard);
