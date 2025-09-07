import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getUser } from '$lib/supabase';

// TODO: add settings, swipes pages
const protectedRoutes = ['/partners', '/connect', '/matches'];

export const load: LayoutLoad = async ({ url }) => {
    const user = await getUser();
    if (protectedRoutes.includes(url.pathname)) {
        if (!user || user.is_anonymous) {
            throw redirect(303, `/auth/login?next=${url.pathname}&protected=true`);
        }
    }
    return { user };
};
