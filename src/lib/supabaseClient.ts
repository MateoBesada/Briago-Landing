import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://suoojhlqynuphuqncvzg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1b29qaGxxeW51cGh1cW5jdnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDk2OTEsImV4cCI6MjA2NjYyNTY5MX0.NrgnRiSxPiqHcFMsNS4rslMQFoKbaqWrfzEiAJ0DNi8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
