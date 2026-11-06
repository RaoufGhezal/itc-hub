export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "member" | "admin";
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

export type LoginFormData = {
  email: string;
  password: string;
};

export type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
};

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  department: string;
  capacity: number | null;
  image: string | null;
  /** Number of registered attendees, if the API provides it */
  registeredCount?: number;
  /** Whether the current user is registered, if the API provides it */
  isRegistered?: boolean;
}

export type CreateEventInput = Omit<Event, "id" | "image" | "capacity"> & {
  capacity?: number | null;
  image?: string;
};

export interface EventsContextType {
  events: Event[];
  loading: boolean;
  fetchEvents: (upcoming?: boolean) => Promise<Event[]>;
  getEvent: (id: number) => Promise<Event>;
  createEvent: (event: CreateEventInput) => Promise<Event>;
  registerForEvent: (id: number) => Promise<void>;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  messages: ChatMessage[];
  loading: boolean;
  streaming: boolean;
  error: string;
  historyLoaded: boolean;
  fetchHistory: () => Promise<void>;
  sendMessage: (content: string) => Promise<boolean>;
  clearChat: () => void;
}
