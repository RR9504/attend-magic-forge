-- Update the trigger function to count extra attendees from checkbox fields
CREATE OR REPLACE FUNCTION public.update_event_attendee_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  extra_attendees integer := 0;
  event_form_fields jsonb;
  field_record jsonb;
  field_name text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get the event's form_fields to check for countsAsExtraAttendee
    SELECT form_fields INTO event_form_fields
    FROM public.events
    WHERE id = NEW.event_id;
    
    -- Loop through form fields to find checkboxes that count as extra attendees
    IF event_form_fields IS NOT NULL THEN
      FOR field_record IN SELECT * FROM jsonb_array_elements(event_form_fields)
      LOOP
        -- Check if this field is a checkbox with countsAsExtraAttendee = true
        IF (field_record->>'type' = 'checkbox') 
           AND (field_record->>'countsAsExtraAttendee' = 'true') THEN
          field_name := field_record->>'name';
          -- Check if this checkbox is checked in the registration data
          IF (NEW.data->>field_name)::boolean = true THEN
            extra_attendees := extra_attendees + 1;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- Update count: 1 for the registrant + any extra attendees
    UPDATE public.events 
    SET current_attendees = current_attendees + 1 + extra_attendees 
    WHERE id = NEW.event_id;
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Get the event's form_fields to check for countsAsExtraAttendee
    SELECT form_fields INTO event_form_fields
    FROM public.events
    WHERE id = OLD.event_id;
    
    -- Loop through form fields to find checkboxes that count as extra attendees
    IF event_form_fields IS NOT NULL THEN
      FOR field_record IN SELECT * FROM jsonb_array_elements(event_form_fields)
      LOOP
        -- Check if this field is a checkbox with countsAsExtraAttendee = true
        IF (field_record->>'type' = 'checkbox') 
           AND (field_record->>'countsAsExtraAttendee' = 'true') THEN
          field_name := field_record->>'name';
          -- Check if this checkbox was checked in the registration data
          IF (OLD.data->>field_name)::boolean = true THEN
            extra_attendees := extra_attendees + 1;
          END IF;
        END IF;
      END LOOP;
    END IF;
    
    -- Subtract count: 1 for the registrant + any extra attendees
    UPDATE public.events 
    SET current_attendees = GREATEST(0, current_attendees - 1 - extra_attendees) 
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;