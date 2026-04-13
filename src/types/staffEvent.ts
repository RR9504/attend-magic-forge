export interface StaffEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  staffNeeded: number;
  status: 'open' | 'full' | 'closed';
  createdAt: string;
}

export interface StaffSignup {
  id: string;
  eventId: string;
  name: string;
  email?: string;
  phone?: string;
  signedUpAt: string;
}
