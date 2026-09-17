<script lang="ts">
	import peanutBaby from '$lib/assets/peanutbaby.webp';
	import BackButton from '$lib/components/BackButton.svelte';
	import { fly } from 'svelte/transition';
	import { useTranslate } from '$lib/i18n.svelte';

	const t = useTranslate();
</script>

<BackButton />

<div in:fly={{ y: 20, duration: 300 }}>
	<article class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		<p class="font-title text-3xl font-bold xl:text-4xl">{t('error.title')}</p>
		<p class="text-[var(--pico-muted-color)]">{t('error.subtitle')}</p>
		<img class="rounded" src={peanutBaby} alt="Peanut Butter Baby meme" />
		<p class="max-w-64 text-balance text-[var(--pico-muted-color)]">
			{t('error.construction')}
		</p>
	</article>
</div>
