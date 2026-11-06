"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/contexts/EventsContext";
import { FaSearch } from "react-icons/fa";

const departments = [
  "All",
  "Technical",
  "External",
  "Internal",
  "Communication",
];

export default function EventsPage() {
  const { events, loading, fetchEvents } = useEvents();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [error, setError] = useState("");

  const load = () => {
    fetchEvents()
      .then(() => setError(""))
      .catch(() => setError("Failed to load events"));
  };

  useEffect(() => {
    fetchEvents().catch(() => setError("Failed to load events"));
  }, [fetchEvents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesDepartment =
        department === "All" || event.department === department;
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q);

      return matchesDepartment && matchesSearch;
    });
  }, [events, search, department]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Events
        </h1>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="border-neutral-800 bg-neutral-950 pl-9"
            />
          </div>

          <Select
            value={department}
            onValueChange={(value) => setDepartment(value ?? "All")}
          >
            <SelectTrigger className="w-full cursor-pointer border-neutral-800 bg-neutral-950 sm:w-[200px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent className="border-neutral-800 bg-neutral-950 text-white">
              {departments.map((d) => (
                <SelectItem
                  key={d}
                  value={d}
                  className="cursor-pointer focus:bg-white/10 focus:text-white"
                >
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
          <div className="mt-8 flex flex-col items-center gap-4 py-16">
            <p className="text-sm text-neutral-400">{error}</p>
            <Button
              variant="outline"
              onClick={load}
              className="cursor-pointer border-neutral-700 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Try again
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-1 py-16 text-center">
            <p className="text-neutral-400">No events found.</p>
            <p className="text-sm text-neutral-600">
              Try a different search or department filter.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, index) => (
              <EventCard
                key={event.id}
                {...event}
                image={event.image ?? "/events/default.jpg"}
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
