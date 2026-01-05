-- Create tone_voices table
CREATE TABLE IF NOT EXISTS public.tone_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.tone_voices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all tones" 
    ON public.tone_voices FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can insert their own tones" 
    ON public.tone_voices FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tones" 
    ON public.tone_voices FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tones" 
    ON public.tone_voices FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_tone_voices_updated_at
    BEFORE UPDATE ON public.tone_voices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed some default tones (optional, but good for UX)
-- Note: user_id is NULL for system tones if we want, but RLS might need adjustment
-- For now, let's just create the table.
