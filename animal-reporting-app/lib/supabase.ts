import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ydvqwcsdxdzkhpruokto.supabase.co'
const supabasePublishableKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdnF3Y3NkeGR6a2hwcnVva3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3NDg2NzUsImV4cCI6MjA3NjMyNDY3NX0.YiVsx1Z2GpGZ-iPdASj8XtKRuVQovwhJhSGJdQjJMPk'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})