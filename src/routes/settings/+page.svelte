<script lang="ts">
	import { fly } from 'svelte/transition';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { Palette, UserRound, Database, TriangleAlert } from 'lucide-svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { LANG_COOKIE, languages, getI18n, useTranslate, type Lang } from '$lib/i18n.svelte';
	import { applyTheme, currentTheme, THEME_EVENT, type Theme } from '$lib/theme';
	import { onMount, untrack } from 'svelte';

	const t = useTranslate();
	const i18n = getI18n();

	let theme = $state<Theme>('dark');
	let swipeCount = $state<number | null>(null);
	let confirmingReset = $state(false);
	let resetting = $state(false);
	let resetMessage = $state<{ kind: 'ok' | 'error'; text: string } | null>(null);

	const isAnonymous = $derived(store.user?.is_anonymous !== false);

	onMount(() => {
		theme = currentTheme();
		const onThemeChange = (e: Event) => (theme = (e as CustomEvent<Theme>).detail);
		window.addEventListener(THEME_EVENT, onThemeChange);
		return () => window.removeEventListener(THEME_EVENT, onThemeChange);
	});

	function setTheme(next: Theme) {
		theme = next;
		applyTheme(next);
	}

	function setLanguage(lang: Lang) {
		i18n.lang = lang;
		document.documentElement.lang = lang;
		document.cookie = `${LANG_COOKIE}=${lang};path=/;max-age=31536000`;
	}

	async function loadSwipeCount() {
		const { count } = await supabase.from('v_swipes').select('id', { count: 'exact', head: true });
		swipeCount = count ?? 0;
	}

	async function resetSwipes() {
		if (!store.user?.id) return;
		resetting = true;
		resetMessage = null;

		const { error } = await supabase.from('swipes').delete().eq('user_id', store.user.id);

		if (error) {
			resetMessage = { kind: 'error', text: t('settings.resetError', { message: error.message }) };
		} else {
			resetMessage = { kind: 'ok', text: t('settings.resetDone') };
			swipeCount = 0;
		}
		resetting = false;
		confirmingReset = false;
	}

	async function signOut() {
		await goto('/');
		await supabase.auth.signOut();
		invalidateAll();
	}

	$effect(() => {
		if (store.user) untrack(() => loadSwipeCount());
	});
</script>

<BackButton href="/swiping" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<h1 class="pb-6 font-title text-2xl font-bold opacity-90">{t('settings.title')}</h1>

	<!-- Appearance -->
	<article class="mb-6 px-6 pb-5">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<Palette size={20} class="text-[var(--pico-primary)]" />{t('settings.appearance')}
		</h2>
		<div class="grid grid-cols-1 gap-x-6 gap-y-4 pt-4 sm:grid-cols-2">
			<div>
				<label for="theme-select">{t('settings.theme')}</label>
				<select
					id="theme-select"
					value={theme}
					onchange={(e) => setTheme(e.currentTarget.value as Theme)}
				>
					<option value="light">{t('settings.themeLight')}</option>
					<option value="dark">{t('settings.themeDark')}</option>
				</select>
			</div>
			<div>
				<label for="language-select">{t('settings.language')}</label>
				<select
					id="language-select"
					value={i18n.lang}
					onchange={(e) => setLanguage(e.currentTarget.value as Lang)}
				>
					{#each Object.entries(languages) as [code, label] (code)}
						<option value={code}>{label}</option>
					{/each}
				</select>
			</div>
		</div>
	</article>

	<!-- Account -->
	<article class="mb-6 px-6 pb-5">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<UserRound size={20} class="text-[var(--pico-accent3)]" />{t('settings.account')}
		</h2>
		<div class="flex flex-wrap items-center justify-between gap-4 pt-4">
			{#if isAnonymous}
				<div>
					<p class="m-0">{t('settings.anonymous')}</p>
					<p class="m-0 text-sm text-[var(--pico-muted-color)]">{t('settings.anonymousHint')}</p>
				</div>
				<a href="/auth/login?next=/settings" role="button" class="m-0">{t('settings.logIn')}</a>
			{:else}
				<div class="min-w-0">
					<p class="m-0 text-sm text-[var(--pico-muted-color)]">{t('settings.signedInAs')}</p>
					<p class="m-0 overflow-hidden overflow-ellipsis whitespace-nowrap font-medium">
						{store.user?.email}
					</p>
				</div>
				<button class="m-0 w-auto outline" onclick={signOut}>{t('settings.signOut')}</button>
			{/if}
		</div>
	</article>

	<!-- Data -->
	<article class="mb-6 px-6 pb-5">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<Database size={20} class="text-[var(--pico-accent2)]" />{t('settings.data')}
		</h2>
		<div class="flex flex-wrap items-center justify-between gap-4 pt-4">
			<p class="m-0" aria-busy={swipeCount === null}>
				{#if swipeCount !== null}
					{t('settings.swipeCount', { count: swipeCount })}
				{/if}
			</p>
			<a href="/swipes" class="text-[var(--pico-primary)] hover:underline">{t('swipes.title')}</a>
		</div>
	</article>

	<!-- Danger zone -->
	<article class="danger mb-6 px-6 pb-5">
		<h2 class="flex items-center gap-3 pt-1 text-lg font-bold">
			<TriangleAlert size={20} class="text-[var(--pico-error)]" />{t('settings.dangerZone')}
		</h2>
		<div class="pt-4">
			<p class="m-0 text-sm text-[var(--pico-muted-color)]">{t('settings.resetHint')}</p>

			{#if resetMessage}
				<p
					class="mb-0 mt-3 text-sm"
					style="color: {resetMessage.kind === 'error'
						? 'var(--pico-error)'
						: 'var(--pico-ok, var(--pico-primary))'}"
				>
					{resetMessage.text}
				</p>
			{/if}

			{#if confirmingReset}
				<p class="mb-3 mt-3 text-balance font-medium">
					{t('settings.resetConfirm', { count: swipeCount ?? 0 })}
				</p>
				<div class="flex flex-wrap gap-3">
					<button class="danger-btn m-0 w-auto" disabled={resetting} onclick={resetSwipes}>
						{resetting ? t('settings.resetting') : t('settings.resetSwipes')}
					</button>
					<button
						class="secondary m-0 w-auto outline"
						disabled={resetting}
						onclick={() => (confirmingReset = false)}
					>
						{t('common.cancel')}
					</button>
				</div>
			{:else}
				<button
					class="danger-btn m-0 mt-3 w-auto outline"
					disabled={!swipeCount}
					onclick={() => {
						resetMessage = null;
						confirmingReset = true;
					}}
				>
					{t('settings.resetSwipes')}
				</button>
			{/if}
		</div>
	</article>
</div>

<style>
	.danger {
		border-color: var(--pico-error-bg);
	}
	.danger-btn {
		border-color: var(--pico-error-bg);
		color: var(--pico-error);
	}
	.danger-btn:not(.outline) {
		background-color: var(--pico-error-bg);
		color: var(--pico-primary-inverse);
	}
	.danger-btn:not(.outline):hover {
		background-color: var(--pico-error-hover);
		border-color: var(--pico-error-hover);
	}
</style>
