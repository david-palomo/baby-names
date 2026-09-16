import type { Handle } from '@sveltejs/kit';
import { LANG_COOKIE, isLang } from '$lib/i18n.svelte';

export const handle: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get('preferredColorScheme');
	const cookieLang = event.cookies.get(LANG_COOKIE);
	const lang = isLang(cookieLang) ? cookieLang : 'en';

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html
				.replace('data-theme', theme ? `data-theme="${theme}"` : '')
				.replace('lang="en"', `lang="${lang}"`)
	});
};
