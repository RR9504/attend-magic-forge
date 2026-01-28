export interface ConditionalField {
  enabled: boolean;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface EventFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  options?: string[];
  conditionalField?: ConditionalField;
}

export interface ImagePosition {
  x: number;
  y: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  imagePosition?: ImagePosition;
  maxAttendees: number;
  currentAttendees: number;
  status: 'draft' | 'published' | 'closed';
  formFields: EventFormField[];
  showBookedSeats: boolean;
  createdAt: string;
}

export interface Registration {
  id: string;
  eventId: string;
  data: Record<string, string | boolean>;
  registeredAt: string;
}

export const DEFAULT_FORM_FIELDS: EventFormField[] = [
  {
    id: 'name',
    name: 'name',
    label: 'Namn',
    type: 'text',
    required: true,
    placeholder: 'Ditt fullständiga namn',
  },
  {
    id: 'email',
    name: 'email',
    label: 'E-post',
    type: 'email',
    required: true,
    placeholder: 'din@email.se',
  },
  {
    id: 'phone',
    name: 'phone',
    label: 'Telefonnummer',
    type: 'tel',
    required: true,
    placeholder: '070-123 45 67',
  },
];
