<script lang="ts">
	import { fly } from 'svelte/transition';
	import { useTranslate } from '$lib/i18n.svelte';

	const t = useTranslate();
</script>

<div in:fly={{ y: -20, duration: 300 }}>
	<article
		class="mb-6 flex max-h-[55vh] min-h-80 flex-col items-center justify-center text-center 2xs:h-96"
	>
		<p class="font-title text-3xl font-bold xl:text-4xl">
			<span class="block">{t('home.title1')}</span>
			<span class="block">{t('home.title2')}</span>
		</p>
		<p class="mt-8 text-[var(--pico-muted-color)]">{t('home.sub1')}</p>
		<p class="text-[var(--pico-muted-color)]">{t('home.sub2')}</p>
		<a href="/swiping" role="button" class="mt-8 py-2 text-lg xl:mt-10">{t('home.cta')}</a>
	</article>

	<div class="grid grid-cols-1 gap-6 sm:grid-cols-9">
		<article class="flex flex-col justify-evenly px-8 py-6 sm:col-span-5 lg:px-10 lg:py-8">
			<h2 class="py-1 font-title text-2xl font-bold">{t('home.howTitle')}</h2>
			<ul class="list-emoji list-disc pl-6 pt-4 text-[var(--pico-muted-color)]">
				<li style="--marker-content: '👉'">{t('home.how1')}</li>
				<li style="--marker-content: '👈'">{t('home.how2')}</li>
				<li style="--marker-content: '🔒'">{t('home.how3')}</li>
				<li style="--marker-content: '💑'">{t('home.how4')}</li>
				<li style="--marker-content: '🎉'">{t('home.how5')}</li>
			</ul>
		</article>
		<article class="flex flex-col justify-between px-8 py-6 sm:col-span-4 lg:px-10 lg:py-8">
			<h2 class="flex flex-row items-center gap-2 py-1 font-title text-2xl font-bold">
				<span>{t('home.factTitle')}</span>
			</h2>
			<!-- Static copy from our own dictionary, never user input; only <em> markup. -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<p class="mt-2 text-[var(--pico-muted-color)]">{@html t('home.factHtml')}</p>
		</article>
	</div>
</div>

<style>
	.list-emoji li::marker {
		content: var(--marker-content) '  ';
	}
</style>
