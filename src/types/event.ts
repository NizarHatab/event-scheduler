export type EventStatus = "upcoming" | "attending" | "maybe" | "declined";

export interface EventWithDetails {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  creator?: { id: string; name: string | null; email: string };
  myStatus?: EventStatus;
  participantCount?: number;
}

export interface SearchFilters {
  q?: string;
  from?: string;
  to?: string;
  location?: string;
  status?: EventStatus;
}
