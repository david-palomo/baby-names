import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);
export type { User } from '@supabase/supabase-js';

export async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
    
    const { data: { user: anonUser } } = await supabase.auth.signInAnonymously();
    return anonUser;
}
