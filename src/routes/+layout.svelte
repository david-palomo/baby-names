<script lang="ts">
	import '../app.css';
	import { Moon, SunMedium } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import Marquee from '$lib/components/Marquee.svelte';
	import { names as items } from '$lib/data';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { onMount } from 'svelte';
	import {
		githubLink,
		githubUser,
		projectTitleAbove,
		projectTitle,
		projectTitleBelow
	} from '$lib/config';
	import Link from '$lib/components/Link.svelte';

	let { children } = $props();
	let theme: string;

	if (browser) {
		theme =
			document.documentElement.dataset.theme ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	}
	function toggleTheme() {
		if (theme === 'light') theme = 'dark';
		else theme = 'light';
		document.documentElement.dataset.theme = theme;
		document.cookie = `preferredColorScheme=${theme};path=/;max-age=31536000`;
	}
	onMount(async () => {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		if (!session) {
			const { data, error } = await supabase.auth.signInAnonymously();
			if (error) console.error('Error creating anonymous user:', error);
			console.log('Anonymous user:', data.user?.id, 'with email: ', data.user?.email);
			store.user = data.user;
		} else {
			console.log('Logged user:', session.user.id, 'with email: ', session.user.email);
			store.user = session.user;
		}
	});

	async function signOut() {
		const { error } = await supabase.auth.signOut();
		if (error) console.error('Error signing out:', error);
		store.user = null;
	}
</script>

<svelte:head>
	<title>{projectTitle}</title>
</svelte:head>

<div class="wrapper relative flex flex-col">
	<main class="container flex max-w-3xl flex-grow flex-col pb-14 2xs:pb-16">
		<nav class="mx-2 py-4">
			<ul>
				<li class="px-0">
					<button
						class="card border-[var(--pico-border-color-aux)] hover:border-[var(--pico-primary-border)]"
						title="Toggle theme"
						onclick={toggleTheme}
					>
						<div class="toggle-sun gap-2"><SunMedium /></div>
						<div class="toggle-moon gap-2"><Moon /></div>
					</button>
					<div class="xs:px-12"></div>
				</li>
			</ul>
			<ul>
				<li class="py-0">
					<a href="/" class="my-0.5 flex flex-col items-center font-bold lg:my-1">
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleAbove}</span>
						<span class="flex items-center space-x-2 text-xl lowercase 2xs:text-2xl"
							>{projectTitle}</span
						>
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleBelow}</span>
					</a>
				</li>
			</ul>
			<ul>
				{#if store.user?.is_anonymous === false}
					<button class="as-link" onclick={signOut}>Sign out</button>
				{:else}
					<a
						class="card flex items-center gap-2 px-2 py-1 hover:border-[var(--pico-primary-border)] xs:px-1 xs:pl-3"
						title="Log in"
						href="/auth/login"
					>
						<span class="hidden xs:inline">Log in </span><span class="text-xl xs:text-lg">🔒</span>
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
		<div class="m-auto flex max-w-3xl justify-between px-2 pt-6 text-sm">
			<p class="mx-3 text-[var(--pico-muted-color)]">
				Built by <Link href="{githubLink}/{githubUser}" className="secondary">{githubUser}</Link>
			</p>
			<p class="mx-3 hidden text-[var(--pico-muted-color)] 2xs:inline-block">
				Powered by <Link href="https://svelte.dev" className="secondary">Svelte</Link>
				& <Link href="https://supabase.com" className="secondary">Supabase</Link>
			</p>
		</div>
	</footer>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		min-height: 100dvh;
	}
	.as-link {
		margin: calc(var(--pico-nav-link-spacing-vertical) * -1)
			calc(var(--pico-nav-link-spacing-horizontal) * -1);
		padding: var(--pico-nav-link-spacing-vertical) var(--pico-nav-link-spacing-horizontal);
		border: 0;
	}
</style>
