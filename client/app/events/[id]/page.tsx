"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  FaArrowLeft,
  FaShareAlt,
  FaRegClock,
  FaMapMarkerAlt,
  FaUsers,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEvents } from "@/contexts/EventsContext";
import type { Event } from "@/types";

const departmentColors: Record<string, string> = {
  Internal: "bg-sky-400",
  External: "bg-emerald-400",
  Technical: "bg-violet-400",
  Communication: "bg-amber-400",
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "full",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  timeStyle: "short",
});

export default function EventDetailsPage() {
  return (
    <Suspense fallback={null}>
      <EventDetailsContent />
    </Suspense>
  );
}

function EventDetailsContent() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { user, loading: authLoading } = useAuth();
  const { getEvent, registerForEvent } = useEvents();

  const [event, setEvent] = useState<Event | null>(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [isPast, setIsPast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [retry, setRetry] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [full, setFull] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");

  useEffect(() => {
    if (!Number.isInteger(id)) return;

    let cancelled = false;
    const fetchEvent = async () => {
      try {
        const data = await getEvent(id);
        if (cancelled) return;
        setEvent(data);
        setIsPast(new Date(data.date).getTime() < Date.now());
        setRegisteredCount(data.registeredCount ?? 0);
        setRegistered(data.isRegistered ?? false);
        setFull(
          data.capacity !== null &&
            (data.registeredCount ?? 0) >= data.capacity,
        );
      } catch (err) {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setNotFound(true);
        } else {
          setLoadError("Failed to load this event.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchEvent();
    return () => {
      cancelled = true;
    };
  }, [getEvent, id, retry]);

  const capacity = event?.capacity ?? null;
  const spotsLeft =
    capacity !== null ? Math.max(0, capacity - registeredCount) : null;
  const progress =
    capacity !== null && capacity > 0
      ? Math.min(100, Math.round((registeredCount / capacity) * 100))
      : 0;

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: event?.title, url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link");
    }
  };

  const register = async () => {
    if (!event || registering) return;
    setRegistering(true);
    setLiveMsg("");
    try {
      await registerForEvent(event.id);
      setRegistered(true);
      setRegisteredCount((c) => c + 1);
      toast.success("You are registered");
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : null;
      const message =
        axios.isAxiosError<{ message?: string }>(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : "";
      const lower = message.toLowerCase();

      if (status === 409 && lower.includes("full")) {
        setFull(true);
        setLiveMsg("This event is full.");
      } else if (status === 409 || lower.includes("already")) {
        setRegistered(true);
        setLiveMsg("You are already registered for this event.");
      } else {
        setLiveMsg(message || "Registration failed. Please try again.");
      }
    } finally {
      setRegistering(false);
    }
  };

  const loginHref = `/login?redirect=${encodeURIComponent(`/events/${id}`)}`;
  const registerHref = `/login?mode=register&redirect=${encodeURIComponent(`/events/${id}`)}`;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
        >
          <FaArrowLeft className="h-3.5 w-3.5" />
          All events
        </Link>

        {!Number.isInteger(id) || notFound ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="text-lg text-neutral-300">Event not found.</p>
            <Link href="/events">
              <Button variant="outline" className="cursor-pointer">
                Browse events
              </Button>
            </Link>
          </div>
        ) : loading ? (
          <div className="mt-6 space-y-8">
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-neutral-900 lg:aspect-[21/9]" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-8 w-2/3 animate-pulse rounded bg-neutral-800" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-900" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-900" />
              </div>
              <div className="h-48 animate-pulse rounded-xl bg-neutral-900" />
            </div>
          </div>
        ) : loadError ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-neutral-400">{loadError}</p>
            <Button
              variant="outline"
              onClick={() => {
                setLoading(true);
                setLoadError("");
                setRetry((count) => count + 1);
              }}
              className="cursor-pointer border-neutral-700 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              Try again
            </Button>
          </div>
        ) : event ? (
          <div className="mt-6 grid gap-10 lg:grid-cols-3">
            <div className="space-y-10 lg:col-span-2">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-800 lg:aspect-[21/9]">
                <Image
                  src={event.image ?? "/events/default.jpg"}
                  alt={event.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
                <span className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-medium text-neutral-200 backdrop-blur-sm">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${departmentColors[event.department] ?? "bg-neutral-400"}`}
                  />
                  {event.department}
                </span>
                {isPast && (
                  <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
                    Ended
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  {event.title}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={share}
                  aria-label="Share event"
                  className="h-10 w-10 shrink-0 cursor-pointer border-neutral-800 bg-transparent hover:bg-white/10 hover:text-white"
                >
                  <FaShareAlt className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <FaRegClock className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Date & time
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">
                    {dateTimeFormatter.format(new Date(event.date))}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <FaMapMarkerAlt className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Location
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">
                    {event.location}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                  <div className="flex items-center gap-2 text-red-500">
                    <FaUsers className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Capacity
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">
                    {capacity ?? "Ouvert"}
                  </p>
                </div>
              </div>

              <section>
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  About this event
                </h2>
                <p className="mt-4 leading-relaxed whitespace-pre-wrap text-neutral-400">
                  {event.description}
                </p>
              </section>
            </div>

            <aside className="lg:col-span-1">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 lg:sticky lg:top-24">
                <h2 className="font-heading text-lg font-semibold tracking-tight">
                  Registration
                </h2>

                <div className="mt-4">
                  {capacity !== null ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>
                          {registeredCount} / {capacity} registered
                        </span>
                        {spotsLeft !== null && spotsLeft > 0 && !isPast && (
                          <span>{spotsLeft} spots left</span>
                        )}
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full rounded-full bg-red-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-neutral-400">
                      Open attendance · {registeredCount} registered
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  {authLoading ? (
                    <Button
                      disabled
                      className="w-full cursor-pointer bg-red-500 hover:bg-red-600"
                    >
                      Please wait...
                    </Button>
                  ) : !user ? (
                    <div className="space-y-3">
                      <Link href={loginHref} className="block">
                        <Button className="w-full cursor-pointer bg-red-500 hover:bg-red-600">
                          Log in to register
                        </Button>
                      </Link>
                      <p className="text-center text-sm text-neutral-500">
                        No account yet?{" "}
                        <Link
                          href={registerHref}
                          className="font-medium text-red-500 transition-colors hover:text-red-400"
                        >
                          Create one
                        </Link>
                      </p>
                    </div>
                  ) : isPast ? (
                    <Button disabled className="w-full">
                      Event has ended
                    </Button>
                  ) : full ? (
                    <Button disabled className="w-full">
                      Event is full
                    </Button>
                  ) : registered ? (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400">
                      <FaCheck className="h-4 w-4" />
                      You are registered
                    </div>
                  ) : (
                    <Button
                      onClick={register}
                      disabled={registering}
                      className="w-full cursor-pointer bg-red-500 hover:bg-red-600"
                    >
                      {registering ? (
                        <>
                          <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register now"
                      )}
                    </Button>
                  )}
                </div>

                <div
                  aria-live="polite"
                  className="mt-4 min-h-5 text-sm text-red-400"
                >
                  {liveMsg}
                </div>

                <p className="mt-2 text-xs text-neutral-600">
                  Starts at {timeFormatter.format(new Date(event.date))}
                </p>
              </div>
            </aside>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
