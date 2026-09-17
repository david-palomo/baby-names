import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { getUser } from '$lib/supabase';

// Only routes that involve *another person* need a real account. /settings and
// /swipes are personal, and anonymous users have both preferences and swipes,
// so they stay open and handle the anonymous case in the page itself.
const protectedRoutes = ['/partners', '/connect', '/matches'];

export const load: LayoutLoad = async ({ url, data }) => {
	const user = await getUser();
	if (protectedRoutes.includes(url.pathname)) {
		if (!user || user.is_anonymous) {
			throw redirect(303, `/auth/login?next=${url.pathname}&protected=true`);
		}
	}
	return { ...data, user };
};
