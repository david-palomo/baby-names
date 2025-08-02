import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY);
export type { User } from '@supabase/supabase-js';

export async function getUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session ? session.user : (await supabase.auth.signInAnonymously()).data.user;
}
