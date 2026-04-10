import { EventFormField } from './event';

export interface Store {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  title: string;
  description?: string;
  minAmount?: number;
  formFields: EventFormField[];
  status: 'draft' | 'published' | 'closed';
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

export interface CampaignEntry {
  id: string;
  campaignId: string;
  storeId: string;
  data: Record<string, string | boolean>;
  receiptImageUrl?: string;
  receiptAmount?: number;
  registeredAt: string;
}

export const DEFAULT_CAMPAIGN_FORM_FIELDS: EventFormField[] = [
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
];
