<script lang="ts">
	import '../app.css';
	import { Moon, SunMedium } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import Marquee from '$lib/components/Marquee.svelte';
	import { names as items } from '$lib/data';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { githubLink, githubUser, projectTitleAbove, projectTitle } from '$lib/config';
	import Link from '$lib/components/Link.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate, goto, invalidateAll } from '$app/navigation';
	import { LANG_COOKIE, languages, setI18n, useTranslate, type Lang } from '$lib/i18n.svelte';
	import { applyTheme, currentTheme, THEME_EVENT, type Theme } from '$lib/theme';

	let { data, children } = $props();

	// Set before children render so the whole tree agrees on the language.
	const i18n = setI18n(data.lang);
	const t = useTranslate();

	let theme = $state<Theme>('dark');

	if (browser) theme = currentTheme();

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(theme);
	}

	onMount(() => {
		// Keep in sync when the theme is changed from the settings page.
		const onThemeChange = (e: Event) => (theme = (e as CustomEvent<Theme>).detail);
		window.addEventListener(THEME_EVENT, onThemeChange);
		return () => window.removeEventListener(THEME_EVENT, onThemeChange);
	});

	function setLanguage(lang: Lang) {
		i18n.lang = lang;
		document.documentElement.lang = lang;
		document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000`;
	}

	async function signOut() {
		await goto('/');
		await supabase.auth.signOut();
		invalidateAll();
	}

	$effect(() => {
		store.user = data.user;
	});

	beforeNavigate(({ type }) => {
		if (type === 'popstate') {
			store.transitionDirection = -1;
		}
	});
	afterNavigate(({ from }) => {
		const fromPath = from?.url.pathname;
		if (fromPath && fromPath != page.url.pathname) {
			store.previousPath = fromPath;
		}
		store.transitionDirection = 1;
	});
</script>

<svelte:head>
	<title>{projectTitle}</title>
</svelte:head>

<div class="wrapper relative flex flex-col">
	<main class="container mb-2 flex max-w-3xl flex-grow flex-col pb-14 2xs:pb-16">
		<nav class="mx-2 py-4">
			<ul>
				<li class="px-0">
					<button
						class="card border-[var(--pico-border-color-aux)] hover:border-[var(--pico-primary-border)]"
						title={t('nav.toggleTheme')}
						onclick={toggleTheme}
					>
						<div class="toggle-sun gap-2"><SunMedium /></div>
						<div class="toggle-moon gap-2"><Moon /></div>
					</button>
					<div class={store.user?.is_anonymous === false ? 'xs:px-14' : 'xs:px-12'}></div>
				</li>
			</ul>
			<ul>
				<li class="py-0">
					<a href="/" class="my-0.5 flex flex-col items-center font-bold lowercase lg:my-1">
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleAbove}</span>
						<span class="whitespace-nowrap font-title text-xl 2xs:text-2xl">{projectTitle}</span>
					</a>
				</li>
			</ul>
			<ul>
				{#if store.user?.is_anonymous === false}
					<button
						class="card border-[var(--pico-border-color-aux)] py-1 pl-1.5 pr-2.5 hover:border-[var(--pico-error-bg)] xs:pl-3 xs:pr-2"
						onclick={signOut}
					>
						<span class="hidden xs:inline">{t('nav.signOut')}</span>
						<span class="text-xl xs:text-lg">👋</span>
					</button>
				{:else}
					<a
						class="card flex items-center gap-2 px-2 py-1 hover:border-[var(--pico-primary-border)] xs:px-1 xs:pl-3"
						title={t('nav.logIn')}
						href="/auth/login?next={page.url.pathname}"
					>
						<span class="hidden xs:inline">{t('nav.logIn')}</span>
						<span class="text-xl xs:text-lg">🔒</span>
					</a>
				{/if}
			</ul>
		</nav>

		<article class="mb-5 select-none px-0 py-2">
			<Marquee {items} duration={140} />
		</article>

		{@render children()}
	</main>

	<footer class="absolute bottom-0 h-16 w-full">
		<div class="m-auto flex max-w-3xl items-center justify-between px-2 pt-4 text-sm">
			<div class="mx-2 flex items-baseline gap-1.5">
				<span class="text-xs uppercase text-[var(--pico-primary)]">{t('nav.builtBy')}</span>
				<Link href="{githubLink}/{githubUser}" className="secondary underline-offset-4">
					{githubUser}
				</Link>
			</div>
			<div class="mx-2 flex items-baseline gap-2">
				<span class="hidden text-xs uppercase text-[var(--pico-primary)] 2xs:inline"
					>{t('nav.language')}</span
				>
				<select
					class="card lang-select py-1 pl-3 pr-8"
					aria-label={t('settings.language')}
					value={i18n.lang}
					onchange={(e) => setLanguage(e.currentTarget.value as Lang)}
				>
					{#each Object.entries(languages) as [code, label] (code)}
						<option value={code}>{label}</option>
					{/each}
				</select>
			</div>
		</div>
	</footer>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		min-height: 100dvh;
		/* A card dragged or flung past the edge must not widen the page.
		   `clip` rather than `hidden` so this never becomes a scroll
		   container (which would break sticky/anchored children). */
		overflow-x: hidden;
		overflow-x: clip;
	}
	.lang-select {
		padding-right: 2rem;
		padding-left: 0.75rem;
		padding-block: 0.1rem;
	}
</style>
