import type { LayoutLoad } from './$types';
import { getUser } from '$lib/supabase';

export const load: LayoutLoad = async () => {
    const user = await getUser();
    return { user };
};
