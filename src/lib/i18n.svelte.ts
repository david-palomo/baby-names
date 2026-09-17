import { getContext, setContext } from 'svelte';

export const languages = { en: 'English', es: 'Español' } as const;
export type Lang = keyof typeof languages;

export const LANG_COOKIE = 'preferredLanguage';

export function isLang(value: unknown): value is Lang {
	return typeof value === 'string' && value in languages;
}

const en = {
	// Shared
	'nav.toggleTheme': 'Toggle theme',
	'nav.signOut': 'Sign out',
	'nav.logIn': 'Log in',
	'nav.builtBy': 'Built by',
	'nav.language': 'Language:',
	'common.cancel': 'Cancel',
	'back.to': 'Back to {page}',
	'page.home': 'homepage',
	'page.swiping': 'swiping',
	'page.swipes': 'swipes',
	'page.matches': 'matches',
	'page.partners': 'partners',
	'page.settings': 'settings',
	'page.login': 'login',

	// Error page
	'error.title': 'Oh no! 🫢',
	'error.subtitle': 'Looks like something went wrong...',
	'error.construction': 'The site is under construction, so it might as well be our fault',

	// Home
	'home.title1': 'Find a baby name',
	'home.title2': 'you both like!',
	'home.sub1': "Doesn't matter if you're expecting a baby...",
	'home.sub2': 'Or if you just met 👀',
	'home.cta': 'start swiping 👉',
	'home.howTitle': 'How does it work?',
	'home.how1': 'Swipe right if you like a name',
	'home.how2': "Swipe left if you don't",
	'home.how3': 'Sign in to save your swipes',
	'home.how4': 'Connect with a partner',
	'home.how5': 'See your matched names!',
	'home.factTitle': 'Random fact 🔀',
	'home.factHtml':
		"In <em>Iceland</em>, a committee must approve new unlisted names. Until approval, the child is literally called <em>'Girl'</em> (Stúlka) or <em>'Boy'</em> (Drengur).",

	// Swiping
	'swiping.question': 'Do you like this name?',
	'swiping.errorNames': 'Error loading names!',
	'swiping.noNamesLeft': 'No names left!',
	'swiping.undo': 'Undo last swipe',
	'swiping.changedMind': 'Changed your mind? Pick a name.',
	'swiping.no': 'no',
	'swiping.yes': 'yes',
	'swiping.partners': 'Partners',
	'swiping.matches': 'Matches',
	'swiping.settings': 'Settings',
	'swiping.previousSwipes': 'Previous Swipes',
	'swiping.loadingSwipes': 'Loading previous swipes...',
	'swiping.oops': 'Oops! {message} 👀',
	'swiping.noSwipes': 'No previous swipes found.',
	'swiping.seeMore': '... see more',

	// Matches
	'matches.title': 'Matches',
	'matches.partner': 'Partner',
	'matches.gender': 'Gender',
	'matches.origin': 'Origin',
	'matches.any': 'Any',
	'matches.loadingOption': 'Loading...',
	'matches.noPartnersOption': 'No partners found',
	'matches.loading': 'Loading matches...',
	'matches.none': 'No matches found.',
	'matches.keepSwiping': 'Keep swiping to find names you both like!',
	'matches.connectPrompt': 'Connect with a partner',
	'matches.connectPromptRest': ' to see matches.',
	'matches.noneForFilters': 'No matches with these filters.',
	'matches.clearFilters': 'Clear filters',
	'matches.count': '{count} of {total} matches',

	// Partners
	'partners.shareTitle': 'Send this link to your partner!',
	'partners.copyLink': 'Copy link',
	'partners.copied': 'Copied!',
	'partners.connectHint': 'Connect to see names you both like.',
	'partners.title': 'Partners',
	'partners.loading': 'Loading partners...',
	'partners.none': 'You have no partners yet.',
	'partners.shareHint': 'Share your connect link to get started.',
	'partners.matchesTooltip': '{count} matches',
	'partners.matchesTooltip_one': '1 match',
	'partners.removeTooltip': 'Remove connection',
	'partners.confirmRemove':
		'Remove your connection with {name}? You can always connect again later.',
	'partners.removeError': "Couldn't remove the connection: {message}",

	// Swipes
	'swipes.title': 'Your Swipes',
	'swipes.search': 'Search names...',
	'swipes.all': 'All',
	'swipes.liked': 'Liked',
	'swipes.disliked': 'Passed',
	'swipes.loading': 'Loading your swipes...',
	'swipes.error': "Couldn't load your swipes: {message}",
	'swipes.empty': "You haven't swiped on any names yet.",
	'swipes.emptyCta': 'Start swiping',
	'swipes.noResults': 'No swipes match your search.',
	'swipes.summary': 'Liked: {liked} · Passed: {disliked}',
	'swipes.filterLabel': 'Show',
	'swipes.showing': 'Showing {count} of {total}',
	'swipes.undo': 'Put back in the deck',
	'swipes.flip': 'Change your mind',
	'swipes.undone': 'Put {name} back in the deck',

	// Settings
	'settings.title': 'Settings',
	'settings.appearance': 'Appearance',
	'settings.theme': 'Theme',
	'settings.themeLight': 'Light',
	'settings.themeDark': 'Dark',
	'settings.language': 'Language',
	'settings.account': 'Account',
	'settings.signedInAs': 'Signed in as',
	'settings.anonymous': 'Browsing anonymously',
	'settings.anonymousHint': 'Log in to keep your swipes and connect with a partner.',
	'settings.logIn': 'Log in',
	'settings.signOut': 'Sign out',
	'settings.data': 'Your data',
	'settings.swipeCount': "You've swiped on {count} names.",
	'settings.swipeCount_one': "You've swiped on 1 name.",
	'settings.dangerZone': 'Danger zone',
	'settings.resetSwipes': 'Delete all my swipes',
	'settings.resetHint': 'This puts every name back in the deck. It cannot be undone.',
	'settings.resetConfirm': 'Delete all {count} of your swipes? This cannot be undone.',
	'settings.resetConfirm_one': 'Delete your only swipe? This cannot be undone.',
	'settings.resetting': 'Deleting...',
	'settings.resetDone': 'All your swipes were deleted.',
	'settings.resetError': "Couldn't delete your swipes: {message}",

	// Connect
	'connect.connecting': 'Connecting you two...',
	'connect.errorTitle': "That link didn't work",
	'connect.errorNoId':
		'This connect link is missing a partner id. Ask your partner to send it again.',
	'connect.errorSelf': "That's your own connect link! Send it to your partner instead.",
	'connect.errorAnon': 'You need to log in before you can connect with a partner.',
	'connect.errorGeneric': "Couldn't connect you: {message}",
	'connect.goHome': 'Back to homepage',
	'connect.logIn': 'Log in',

	// Login
	// Auth callback
	'callback.errorSub': 'Seems there was an error logging in...',
	'callback.retryPre': 'Please, ',
	'callback.retryLink': 'try again',
	'callback.retryPost': '!',
	'callback.processing': 'Processing login, please wait...',

	'login.protected':
		"You'll have to <em>log in</em> to use the <em>{page}</em> page... But it's worth it!",
	'login.title': '🔒 Log in',
	'login.email': 'Email',
	'login.continueEmail': 'Continue with Email',
	'login.continueEmailShort': 'Continue with email',
	'login.sending': 'Sending OTP...',
	'login.or': 'OR',
	'login.google': 'Continue with Google',
	'login.github': 'Continue with GitHub',
	'login.otpSent': 'Check your email for the OTP code!',
	'login.verify': 'Verify OTP code',
	'login.verifying': 'Verifying...',
	'login.disclaimer1': 'Logging in will allow you to save your swipes and connect with a partner.',
	'login.disclaimer2': 'We will never share your email with anyone.',
	'login.disclaimer3': 'We will never send you spam.'
} as const;

export type MessageKey = keyof typeof en;

const es: Record<MessageKey, string> = {
	'nav.toggleTheme': 'Cambiar tema',
	'nav.signOut': 'Cerrar sesión',
	'nav.logIn': 'Entrar',
	'nav.builtBy': 'Hecho por',
	'nav.language': 'Idioma:',
	'common.cancel': 'Cancelar',
	'back.to': 'Volver a {page}',
	'page.home': 'inicio',
	'page.swiping': 'swiping',
	'page.swipes': 'tus swipes',
	'page.matches': 'coincidencias',
	'page.partners': 'parejas',
	'page.settings': 'ajustes',
	'page.login': 'entrar',

	'error.title': '¡Vaya! 🫢',
	'error.subtitle': 'Parece que algo ha salido mal...',
	'error.construction': 'La web está en construcción, así que seguramente sea culpa nuestra',

	'home.title1': 'Encontrad un nombre',
	'home.title2': '¡que os guste a los dos!',
	'home.sub1': 'Da igual si estáis esperando un bebé...',
	'home.sub2': 'O si acabáis de conoceros 👀',
	'home.cta': 'empezar a swipear 👉',
	'home.howTitle': '¿Cómo funciona?',
	'home.how1': 'Desliza a la derecha si te gusta un nombre',
	'home.how2': 'Desliza a la izquierda si no',
	'home.how3': 'Entra para guardar tus swipes',
	'home.how4': 'Conecta con tu pareja',
	'home.how5': '¡Mira los nombres que coinciden!',
	'home.factTitle': 'Dato aleatorio 🔀',
	'home.factHtml':
		'En <em>Islandia</em>, un comité debe aprobar los nombres que no están en la lista oficial. Hasta que lo aprueban, al bebé se le llama literalmente <em>«Niña»</em> (Stúlka) o <em>«Niño»</em> (Drengur).',

	'swiping.question': '¿Te gusta este nombre?',
	'swiping.errorNames': '¡Error al cargar los nombres!',
	'swiping.noNamesLeft': '¡No quedan nombres!',
	'swiping.undo': 'Deshacer el último swipe',
	'swiping.changedMind': '¿Cambiaste de idea? Elige un nombre.',
	'swiping.no': 'no',
	'swiping.yes': 'sí',
	'swiping.partners': 'Parejas',
	'swiping.matches': 'Coincidencias',
	'swiping.settings': 'Ajustes',
	'swiping.previousSwipes': 'Swipes anteriores',
	'swiping.loadingSwipes': 'Cargando swipes anteriores...',
	'swiping.oops': '¡Ups! {message} 👀',
	'swiping.noSwipes': 'Todavía no has hecho ningún swipe.',
	'swiping.seeMore': '... ver más',

	'matches.title': 'Coincidencias',
	'matches.partner': 'Pareja',
	'matches.gender': 'Género',
	'matches.origin': 'Origen',
	'matches.any': 'Cualquiera',
	'matches.loadingOption': 'Cargando...',
	'matches.noPartnersOption': 'Sin parejas',
	'matches.loading': 'Cargando coincidencias...',
	'matches.none': 'No hay coincidencias.',
	'matches.keepSwiping': '¡Seguid swipeando para encontrar nombres que os gusten a los dos!',
	'matches.connectPrompt': 'Conecta con tu pareja',
	'matches.connectPromptRest': ' para ver las coincidencias.',
	'matches.noneForFilters': 'No hay coincidencias con estos filtros.',
	'matches.clearFilters': 'Quitar filtros',
	'matches.count': '{count} de {total} coincidencias',

	'partners.shareTitle': '¡Envía este enlace a tu pareja!',
	'partners.copyLink': 'Copiar enlace',
	'partners.copied': '¡Copiado!',
	'partners.connectHint': 'Conectad para ver los nombres que os gustan a los dos.',
	'partners.title': 'Parejas',
	'partners.loading': 'Cargando parejas...',
	'partners.none': 'Todavía no tienes ninguna pareja.',
	'partners.shareHint': 'Comparte tu enlace para empezar.',
	'partners.matchesTooltip': '{count} coincidencias',
	'partners.matchesTooltip_one': '1 coincidencia',
	'partners.removeTooltip': 'Eliminar conexión',
	'partners.confirmRemove': '¿Eliminar tu conexión con {name}? Siempre podéis volver a conectaros.',
	'partners.removeError': 'No se pudo eliminar la conexión: {message}',

	'swipes.title': 'Tus swipes',
	'swipes.search': 'Buscar nombres...',
	'swipes.all': 'Todos',
	'swipes.liked': 'Me gustan',
	'swipes.disliked': 'Descartados',
	'swipes.loading': 'Cargando tus swipes...',
	'swipes.error': 'No se pudieron cargar tus swipes: {message}',
	'swipes.empty': 'Todavía no has swipeado ningún nombre.',
	'swipes.emptyCta': 'Empezar a swipear',
	'swipes.noResults': 'Ningún swipe coincide con tu búsqueda.',
	'swipes.summary': 'Me gustan: {liked} · Descartados: {disliked}',
	'swipes.filterLabel': 'Mostrar',
	'swipes.showing': 'Mostrando {count} de {total}',
	'swipes.undo': 'Devolver al mazo',
	'swipes.flip': 'Cambiar de opinión',
	'swipes.undone': '{name} vuelve al mazo',

	'settings.title': 'Ajustes',
	'settings.appearance': 'Apariencia',
	'settings.theme': 'Tema',
	'settings.themeLight': 'Claro',
	'settings.themeDark': 'Oscuro',
	'settings.language': 'Idioma',
	'settings.account': 'Cuenta',
	'settings.signedInAs': 'Sesión iniciada como',
	'settings.anonymous': 'Estás navegando de forma anónima',
	'settings.anonymousHint': 'Entra para guardar tus swipes y conectar con tu pareja.',
	'settings.logIn': 'Entrar',
	'settings.signOut': 'Cerrar sesión',
	'settings.data': 'Tus datos',
	'settings.swipeCount': 'Has swipeado {count} nombres.',
	'settings.swipeCount_one': 'Has swipeado 1 nombre.',
	'settings.dangerZone': 'Zona peligrosa',
	'settings.resetSwipes': 'Borrar todos mis swipes',
	'settings.resetHint': 'Esto devuelve todos los nombres al mazo. No se puede deshacer.',
	'settings.resetConfirm': '¿Borrar tus {count} swipes? Esto no se puede deshacer.',
	'settings.resetConfirm_one': '¿Borrar tu único swipe? Esto no se puede deshacer.',
	'settings.resetting': 'Borrando...',
	'settings.resetDone': 'Se han borrado todos tus swipes.',
	'settings.resetError': 'No se pudieron borrar tus swipes: {message}',

	'connect.connecting': 'Conectándoos...',
	'connect.errorTitle': 'Ese enlace no ha funcionado',
	'connect.errorNoId':
		'A este enlace le falta el id de tu pareja. Pídele que te lo envíe otra vez.',
	'connect.errorSelf': '¡Ese es tu propio enlace! Envíaselo a tu pareja.',
	'connect.errorAnon': 'Tienes que entrar antes de conectar con tu pareja.',
	'connect.errorGeneric': 'No se pudo conectar: {message}',
	'connect.goHome': 'Volver al inicio',
	'connect.logIn': 'Entrar',

	'callback.errorSub': 'Parece que ha habido un error al entrar...',
	'callback.retryPre': '¡Por favor, ',
	'callback.retryLink': 'inténtalo de nuevo',
	'callback.retryPost': '!',
	'callback.processing': 'Procesando el inicio de sesión, espera un momento...',

	'login.protected':
		'Tendrás que <em>entrar</em> para usar la página de <em>{page}</em>... ¡Pero merece la pena!',
	'login.title': '🔒 Entrar',
	'login.email': 'Email',
	'login.continueEmail': 'Continuar con email',
	'login.continueEmailShort': 'Continuar con email',
	'login.sending': 'Enviando código...',
	'login.or': 'O',
	'login.google': 'Continuar con Google',
	'login.github': 'Continuar con GitHub',
	'login.otpSent': '¡Mira tu email para el código!',
	'login.verify': 'Verificar código',
	'login.verifying': 'Verificando...',
	'login.disclaimer1': 'Entrar te permite guardar tus swipes y conectar con tu pareja.',
	'login.disclaimer2': 'Nunca compartiremos tu email con nadie.',
	'login.disclaimer3': 'Nunca te enviaremos spam.'
};

const dictionaries: Record<Lang, Record<MessageKey, string>> = { en, es };

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

const I18N_KEY = Symbol('i18n');

type I18nState = { lang: Lang };

/** Called once from the root layout so every child renders in the same language. */
export function setI18n(initial: Lang): I18nState {
	const i18n = $state<I18nState>({ lang: initial });
	setContext(I18N_KEY, i18n);
	return i18n;
}

export function getI18n(): I18nState {
	return getContext<I18nState>(I18N_KEY) ?? { lang: 'en' };
}

function interpolate(message: string, vars?: Record<string, string | number>) {
	if (!vars) return message;
	return Object.entries(vars).reduce(
		(acc, [name, value]) => acc.replaceAll(`{${name}}`, String(value)),
		message
	);
}

/**
 * Returns a `t()` bound to the current language. Because it reads the reactive
 * `lang` on every call, components re-render when the language changes.
 */
export function useTranslate(): Translate {
	const i18n = getI18n();
	return (key, vars) => {
		const dict: Partial<Record<string, string>> = dictionaries[i18n.lang];
		// A `<key>_one` entry, when present, is used for a `count` of exactly 1.
		const singular = Number(vars?.count) === 1 ? dict[`${key}_one`] : undefined;
		return interpolate(singular ?? dict[key] ?? en[key] ?? key, vars);
	};
}
