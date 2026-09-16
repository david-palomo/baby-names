import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

export const THEME_COOKIE = 'preferredColorScheme';
export const THEME_EVENT = 'themechange';

/** The theme currently on <html>, falling back to the OS preference. */
export function currentTheme(): Theme {
	if (!browser) return 'dark';
	const set = document.documentElement.dataset.theme;
	if (set === 'light' || set === 'dark') return set;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Applies a theme and remembers it. Also notifies anything else on the page
 * showing the current theme (the nav toggle and the settings page).
 */
export function applyTheme(theme: Theme) {
	document.documentElement.dataset.theme = theme;
	document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000`;
	window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}
