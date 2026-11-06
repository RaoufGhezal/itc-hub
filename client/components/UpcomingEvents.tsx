"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/contexts/EventsContext";
import { FaLongArrowAltRight } from "react-icons/fa";

export default function UpcomingEvents() {
  const { events, loading, fetchEvents } = useEvents();
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    fetchEvents(true).catch(() => setError("Failed to load events"));
  };

  useEffect(() => {
    fetchEvents(true).catch(() => setError("Failed to load events"));
  }, [fetchEvents]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Upcoming events
        </h2>
        <Link
          href="/events"
          className="flex items-center gap-1.5 text-sm font-medium text-red-500 transition-colors hover:text-red-400"
        >
          View all
          <FaLongArrowAltRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950"
            >
              <div className="aspect-[16/9] animate-pulse bg-neutral-900" />
              <div className="flex flex-col gap-3 p-5">
                <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-full animate-pulse rounded bg-neutral-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 flex flex-col items-center gap-4 py-12">
          <p className="text-sm text-neutral-400">{error}</p>
          <Button
            variant="outline"
            onClick={load}
            className="cursor-pointer border-neutral-700 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            Try again
          </Button>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-1 py-16 text-center">
          <p className="text-neutral-400">No upcoming events right now.</p>
          <p className="text-sm text-neutral-600">
            Check back soon for new workshops and activities.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event, index) => (
            <EventCard
              key={event.id}
              {...event}
              image={event.image ?? "/events/default.jpg"}
              priority={index === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
