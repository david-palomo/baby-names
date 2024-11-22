<script lang="ts">
	import '../app.css';
	import { Moon, SunMedium } from 'lucide-svelte';
	import { IconBrandGithub as Github } from '@tabler/icons-svelte';
	import { browser } from '$app/environment';
	import {
		githubLink,
		githubRepo,
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
</script>

<svelte:head>
	<title>{projectTitle}</title>
</svelte:head>

<div class="wrapper relative flex flex-col">
	<main class="container flex max-w-3xl flex-grow flex-col pb-14 2xs:pb-16">
		<nav class="mx-2 py-4">
			<ul>
				<li>
					<button class="as-link" onclick={toggleTheme}>
						<div class="toggle-sun"><SunMedium /></div>
						<div class="toggle-moon"><Moon /></div>
					</button>
				</li>
			</ul>
			<ul>
				<li class="py-0">
					<a href="/" class="my-0.5 flex flex-col items-center font-bold lg:my-1">
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleAbove}</span>
						<span class="flex items-center space-x-2 text-2xl lowercase">{projectTitle}</span>
						<span class="text-xs uppercase text-[var(--pico-primary)]">{projectTitleBelow}</span>
					</a>
				</li>
			</ul>
			<ul>
				<li><a class="secondary" href="{githubLink}/{githubUser}/{githubRepo}"><Github /></a></li>
			</ul>
		</nav>

		{@render children()}
	</main>

	<footer class="absolute bottom-0 h-14 w-full 2xs:h-16">
		<div class="m-auto flex max-w-3xl justify-between px-2 pt-3 text-sm 2xs:pt-4">
			<p class="mx-2 text-[var(--pico-muted-color)] 2xs:mx-4">
				Built by <Link href="{githubLink}/{githubUser}" className="secondary">{githubUser}</Link>
			</p>
			<p class="mx-2 text-[var(--pico-muted-color)] 2xs:mx-4">
				Powered by <Link href="https://svelte.dev" className="secondary">Svelte</Link>
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
