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
	import { invalidateAll } from '$app/navigation';

	let { data, children } = $props();
	let theme: string;
	let lang = $state('en');

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

	async function signOut() {
		await supabase.auth.signOut();
		invalidateAll();
	}

	$effect(() => {
		store.user = data.user;
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
						title="Toggle theme"
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
					<a href="/" class="my-0.5 flex flex-col items-center font-bold lg:my-1">
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleAbove}</span>
						<span class="flex items-center space-x-2 text-xl lowercase 2xs:text-2xl"
							>{projectTitle}</span
						>
					</a>
				</li>
			</ul>
			<ul>
				{#if store.user?.is_anonymous === false}
					<button
						class="card border-[var(--pico-border-color-aux)] py-1 pl-1.5 pr-2.5 hover:border-[var(--pico-error-bg)] xs:pl-3 xs:pr-2"
						onclick={signOut}
					>
						<span class="hidden xs:inline">Sign out</span>
						<span class="text-xl xs:text-lg">👋</span>
					</button>
				{:else}
					<a
						class="card flex items-center gap-2 px-2 py-1 hover:border-[var(--pico-primary-border)] xs:px-1 xs:pl-3"
						title="Log in"
						href="/auth/login?next={page.url.pathname}"
					>
						<span class="hidden xs:inline">Log in</span>
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
				<span class="text-xs uppercase text-[var(--pico-primary)]">Built by</span>
				<Link href="{githubLink}/{githubUser}" className="secondary underline-offset-4">
					{githubUser}
				</Link>
			</div>
			<div class="mx-2 flex items-baseline gap-2">
				<span class="hidden text-xs uppercase text-[var(--pico-primary)] 2xs:inline">Language:</span
				>
				<select class="card lang-select py-1 pl-3 pr-8" bind:value={lang}>
					<option value="en">English</option>
					<option value="es">Español</option>
				</select>
			</div>
		</div>
	</footer>
</div>

<style>
	.wrapper {
		min-height: 100vh;
		min-height: 100dvh;
	}
	.lang-select {
		padding-right: 2rem;
		padding-left: 0.75rem;
		padding-block: 0.1rem;
	}
</style>
