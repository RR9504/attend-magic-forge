-- ============================================================
-- Backstory: Kampanj & Lotterisystem
-- ============================================================

-- 1. Stores (reusable across campaigns)
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stores"
  ON public.stores FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage stores"
  ON public.stores FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 2. Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  min_amount INTEGER,
  form_fields JSONB DEFAULT '[{"id":"name","name":"name","label":"Namn","type":"text","required":true,"placeholder":"Ditt fullständiga namn"},{"id":"email","name":"email","label":"E-post","type":"email","required":true,"placeholder":"din@email.se"}]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published campaigns"
  ON public.campaigns FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 3. Campaign ↔ Store junction
CREATE TABLE public.campaign_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  UNIQUE(campaign_id, store_id)
);

ALTER TABLE public.campaign_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view campaign stores for published campaigns"
  ON public.campaign_stores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_stores.campaign_id
      AND campaigns.status = 'published'
    )
  );

CREATE POLICY "Admins can manage campaign stores"
  ON public.campaign_stores FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 4. Campaign entries (lottery participants)
CREATE TABLE public.campaign_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}'::jsonb,
  receipt_image_url TEXT,
  receipt_amount NUMERIC,
  registered_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.campaign_entries ENABLE ROW LEVEL SECURITY;

-- Anon users can insert entries for published campaigns
CREATE POLICY "Anyone can submit campaign entries"
  ON public.campaign_entries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_entries.campaign_id
      AND campaigns.status = 'published'
    )
  );

CREATE POLICY "Admins can view campaign entries"
  ON public.campaign_entries FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete campaign entries"
  ON public.campaign_entries FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- 5. Storage bucket for receipt images
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipt-images', 'receipt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view receipt images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'receipt-images');

CREATE POLICY "Anyone can upload receipt images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'receipt-images');

CREATE POLICY "Admins can delete receipt images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'receipt-images' AND has_role(auth.uid(), 'admin'));
