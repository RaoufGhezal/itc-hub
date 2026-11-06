import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ItemRotator from "@/components/ItemRotator";
import UpcomingEvents from "@/components/UpcomingEvents";
import AskAiButton from "@/components/AskAiButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="relative isolate mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center gap-12 overflow-hidden px-4 py-16 sm:px-6 lg:flex-row lg:gap-20 lg:py-0">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-[12%] top-1/4 h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute right-[12%] top-1/3 h-80 w-80 rounded-full bg-violet-500/5 blur-3xl" />
        </div>
        <div className="relative max-w-xl space-y-6 text-center lg:text-left">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            ITC Hub: Events & <span className="text-red-500">AI Chat</span>
          </h1>
          <p className="text-lg leading-relaxed text-neutral-400">
            Browse events, register, and ask the ITC Assistant anything about
            the club.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 lg:justify-start">
            <Link href="/events">
              <Button className="cursor-pointer">Explore events</Button>
            </Link>
            <AskAiButton />
          </div>
        </div>

        <div className="relative shrink-0 origin-top scale-90 sm:scale-100">
          <ItemRotator />
        </div>
      </main>

      <UpcomingEvents />

      <Footer />
    </div>
  );
}
