<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { useTranslate, type MessageKey } from '$lib/i18n.svelte';

	let { href }: { href?: string } = $props();

	const t = useTranslate();

	const pageNames: Record<string, MessageKey> = {
		'/': 'page.home',
		'/swiping': 'page.swiping',
		'/swipes': 'page.swipes',
		'/matches': 'page.matches',
		'/partners': 'page.partners',
		'/settings': 'page.settings',
		'/auth/login': 'page.login'
	};

	const target = $derived(href || store.previousPath);
	const label = $derived.by(() => {
		const path = (target || '/').split('?')[0];
		const key = pageNames[path];
		return key ? t(key) : path.replace(/^.*[\\/]/, '') || t('page.home');
	});

	function handleClick() {
		store.transitionDirection = -1;
		goto(target);
	}
</script>

<button
	class="mb-2 flex w-fit items-center gap-2 border-0 pb-2 pr-4 text-[var(--pico-primary)] underline-offset-8 ring-0 hover:underline"
	aria-label={t('back.to', { page: label })}
	onclick={handleClick}
>
	<ArrowLeft />
	<span>{t('back.to', { page: label })}</span>
</button>
