import type { LayoutServerLoad } from './$types';
import { LANG_COOKIE, isLang } from '$lib/i18n.svelte';

// Read on the server so the first paint is already in the right language
// (no flash of English) and so no per-request state leaks between users.
export const load: LayoutServerLoad = ({ cookies }) => {
	const cookieLang = cookies.get(LANG_COOKIE);
	return { lang: isLang(cookieLang) ? cookieLang : ('en' as const) };
};
