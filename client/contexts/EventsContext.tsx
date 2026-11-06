"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { EventsService } from "@/services/events.service";
import type { CreateEventInput, Event, EventsContextType } from "@/types";

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async (upcoming = false) => {
    setLoading(true);
    try {
      const result = await EventsService.list(upcoming);
      setEvents(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEvent = (id: number) => EventsService.getById(id);

  const createEvent = async (event: CreateEventInput) => {
    const created = await EventsService.create(event);
    setEvents((current) => [...current, created]);
    return created;
  };

  const registerForEvent = (id: number) => EventsService.register(id);

  return (
    <EventsContext.Provider
      value={{
        events,
        loading,
        fetchEvents,
        getEvent,
        createEvent,
        registerForEvent,
      }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents(): EventsContextType {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within EventsProvider");
  }
  return context;
}
