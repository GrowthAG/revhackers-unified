# RevHackers Growth Hub - Environment Variables

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# External APIs (managed via Supabase Dashboard → Edge Function Secrets)
# GEMINI_API_KEY → analyze-diagnostic Edge Function
# PSI_API_KEY → analyze-site, crux-benchmark Edge Functions
# PERPLEXITY_API_KEY → market-intelligence, enrich-strategic-data Edge Functions
# FIRECRAWL_API_KEY → research-intelligence Edge Function
# Note: API keys are NOT exposed to the client-side bundle

# Webhook URLs (Lead Destinations)
VITE_WEBHOOK_URL=your-primary-webhook-url

# App Environment
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
