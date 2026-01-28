import { Event, Registration, DEFAULT_FORM_FIELDS } from '@/types/event';
import eventBusinessBreakfast from '@/assets/event-business-breakfast.jpg';
import eventCybersecurity from '@/assets/event-cybersecurity.jpg';
import eventRetirement from '@/assets/event-retirement.jpg';

const EVENTS_KEY = 'events';
const REGISTRATIONS_KEY = 'registrations';
const EVENTS_VERSION_KEY = 'events_version';
const CURRENT_VERSION = '3'; // Increment this to refresh sample data

// Sample events for demo
const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Investeringsfrukost: Marknadsutsikter 2026',
    description: 'Följ med oss på en inspirerande frukost där våra experter delar sina insikter om marknadsutsikterna för det kommande året. Vi diskuterar trender, möjligheter och strategier för din privatekonomi.',
    date: '2026-01-15',
    time: '08:00',
    location: 'Sparbanken Huvudkontor, Storgatan 1',
    imageUrl: eventBusinessBreakfast,
    maxAttendees: 50,
    currentAttendees: 32,
    status: 'published',
    formFields: DEFAULT_FORM_FIELDS,
    showBookedSeats: true,
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Digital säkerhet för företagare',
    description: 'Lär dig skydda ditt företag mot cyberhot. Vi går igenom praktiska tips och verktyg för att säkra din verksamhet online.',
    date: '2026-01-22',
    time: '17:30',
    location: 'Sparbanken Citykontor, Kungsgatan 15',
    imageUrl: eventCybersecurity,
    maxAttendees: 30,
    currentAttendees: 28,
    status: 'published',
    formFields: DEFAULT_FORM_FIELDS,
    showBookedSeats: true,
    createdAt: '2024-12-05T14:00:00Z',
  },
  {
    id: '3',
    title: 'Pensionsplanering för 40-talister',
    description: 'Ett informativt seminarium om pensionsplanering, sparstrategier och hur du får ut det mesta av din pension.',
    date: '2026-02-05',
    time: '14:00',
    location: 'Online via Teams',
    imageUrl: eventRetirement,
    maxAttendees: 100,
    currentAttendees: 45,
    status: 'published',
    formFields: DEFAULT_FORM_FIELDS,
    showBookedSeats: true,
    createdAt: '2024-12-10T09:00:00Z',
  },
];

export const getEvents = (): Event[] => {
  const stored = localStorage.getItem(EVENTS_KEY);
  const version = localStorage.getItem(EVENTS_VERSION_KEY);
  
  // If no data or version mismatch, reinitialize with sample data
  if (!stored || version !== CURRENT_VERSION) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(SAMPLE_EVENTS));
    localStorage.setItem(EVENTS_VERSION_KEY, CURRENT_VERSION);
    return SAMPLE_EVENTS;
  }
  return JSON.parse(stored);
};

export const getEvent = (id: string): Event | undefined => {
  const events = getEvents();
  return events.find(e => e.id === id);
};

export const createEvent = (event: Omit<Event, 'id' | 'createdAt' | 'currentAttendees'>): Event => {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: Date.now().toString(),
    currentAttendees: 0,
    createdAt: new Date().toISOString(),
  };
  events.push(newEvent);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return newEvent;
};

export const updateEvent = (id: string, updates: Partial<Event>): Event | undefined => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index === -1) return undefined;
  
  events[index] = { ...events[index], ...updates };
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  return events[index];
};

export const deleteEvent = (id: string): boolean => {
  const events = getEvents();
  const filtered = events.filter(e => e.id !== id);
  if (filtered.length === events.length) return false;
  
  localStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
  
  // Also delete registrations for this event
  const registrations = getRegistrations();
  const filteredRegistrations = registrations.filter(r => r.eventId !== id);
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(filteredRegistrations));
  
  return true;
};

export const getRegistrations = (): Registration[] => {
  const stored = localStorage.getItem(REGISTRATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getEventRegistrations = (eventId: string): Registration[] => {
  return getRegistrations().filter(r => r.eventId === eventId);
};

export const addRegistration = (eventId: string, data: Record<string, string | boolean>): Registration | null => {
  const event = getEvent(eventId);
  if (!event || event.currentAttendees >= event.maxAttendees) {
    return null;
  }
  
  const registrations = getRegistrations();
  const newRegistration: Registration = {
    id: Date.now().toString(),
    eventId,
    data,
    registeredAt: new Date().toISOString(),
  };
  
  registrations.push(newRegistration);
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations));
  
  // Update event attendee count
  updateEvent(eventId, { currentAttendees: event.currentAttendees + 1 });
  
  return newRegistration;
};

export const deleteRegistration = (id: string): boolean => {
  const registrations = getRegistrations();
  const registration = registrations.find(r => r.id === id);
  if (!registration) return false;
  
  const filtered = registrations.filter(r => r.id !== id);
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(filtered));
  
  // Update event attendee count
  const event = getEvent(registration.eventId);
  if (event) {
    updateEvent(registration.eventId, { currentAttendees: Math.max(0, event.currentAttendees - 1) });
  }
  
  return true;
};

export const exportRegistrationsToCSV = (eventId: string): string => {
  const event = getEvent(eventId);
  const registrations = getEventRegistrations(eventId);
  
  if (!event || registrations.length === 0) return '';
  
  const fields = event.formFields.map(f => f.label);
  const headers = [...fields, 'Registreringsdatum'];
  
  const rows = registrations.map(reg => {
    const values = event.formFields.map(f => String(reg.data[f.name] || ''));
    values.push(new Date(reg.registeredAt).toLocaleString('sv-SE'));
    return values;
  });
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(v => `"${v}"`).join(';'))
  ].join('\n');
  
  return csvContent;
};
