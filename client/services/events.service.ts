import { api } from "@/lib/api";
import type { CreateEventInput, Event } from "@/types";

export const EventsService = {
  list: async (upcoming = false): Promise<Event[]> => {
    const response = await api.get<Event[]>("/events", {
      params: { upcoming },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Event> => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (event: CreateEventInput): Promise<Event> => {
    const response = await api.post<Event>("/events", event);
    return response.data;
  },

  register: async (id: number): Promise<void> => {
    await api.post(`/events/${id}/register`);
  },
};
