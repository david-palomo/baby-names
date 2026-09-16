<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import type { Partner } from '$lib/types';
	import { fly } from 'svelte/transition';
	import { CircleUserRound, Check, Copy, X } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate } from '$lib/i18n.svelte';
	import { untrack } from 'svelte';

	const t = useTranslate();

	let partners = $state<Partner[]>([]);
	let matchCounts = $state<Record<string, number>>({});
	let isLoading = $state(true);
	let connectLinkCopied = $state(false);
	let confirmingRemoval = $state<string | null>(null);
	let removing = $state<string | null>(null);
	let removeError = $state('');

	// Reactive derived state for the connect URL
	let connectUrl = $derived(
		store.user ? `${window.location.origin}/connect?id=${store.user.id}` : ''
	);

	async function fetchPartners() {
		isLoading = true;
		const { data, error } = await supabase
			.from('v_partners')
			.select('id, name, avatar_url')
			.neq('id', store.user?.id);

		if (error) {
			console.error('Error fetching partners:', error);
			partners = [];
		} else {
			partners = data || [];
			fetchMatchCounts();
		}
		isLoading = false;
	}

	/** One cheap `head` count per partner, so the badge shows a real number. */
	async function fetchMatchCounts() {
		const entries = await Promise.all(
			partners.map(async (partner) => {
				const { count } = await supabase
					.from('v_matches')
					.select('name', { count: 'exact', head: true })
					.or(`user_id.eq.${partner.id},partner_id.eq.${partner.id}`);
				return [partner.id, count ?? 0] as const;
			})
		);
		matchCounts = Object.fromEntries(entries);
	}

	async function copyConnectLink() {
		if (!connectUrl) return;
		await navigator.clipboard.writeText(connectUrl);
		connectLinkCopied = true;
		setTimeout(() => (connectLinkCopied = false), 3000);
	}

	/**
	 * Connections are stored one row per pair, and either side may have created
	 * it, so delete whichever direction exists. RLS keeps this to your own rows.
	 */
	async function removeConnection(partnerId: string) {
		const me = store.user?.id;
		if (!me) return;

		removing = partnerId;
		removeError = '';

		const { error } = await supabase
			.from('connections')
			.delete()
			.or(
				`and(user_id.eq.${me},partner_id.eq.${partnerId}),` +
					`and(user_id.eq.${partnerId},partner_id.eq.${me})`
			);

		if (error) {
			removeError = t('partners.removeError', { message: error.message });
		} else {
			partners = partners.filter((p) => p.id !== partnerId);
		}

		removing = null;
		confirmingRemoval = null;
	}

	$effect(() => {
		if (store.user) untrack(() => fetchPartners());
	});
</script>

<BackButton href="/swiping" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<!-- Section to share connection link -->
	<article class="mb-6 p-8 text-center">
		<h2 class="font-title text-2xl font-bold tracking-wide">{t('partners.shareTitle')}</h2>
		<fieldset role="group" class="my-6">
			<input type="text" id="connect-link" name="connect-link" value={connectUrl} readonly />
			<button
				onclick={copyConnectLink}
				data-tooltip={t('partners.copyLink')}
				aria-label={t('partners.copyLink')}
				class="flex-0 px-6"
			>
				{#if connectLinkCopied}
					<Check size={20} />
				{:else}
					<Copy size={20} />
				{/if}
			</button>
		</fieldset>
		<div>
			{#if connectLinkCopied}
				<p class="copied-indicator text-xl/6 font-medium text-[var(--pico-primary)]">
					{t('partners.copied')}
				</p>
			{:else}
				<p class="text-[var(--pico-muted-color)]">{t('partners.connectHint')}</p>
			{/if}
		</div>
	</article>

	<!-- Section for existing partners -->
	<h2 class="pb-6 font-title text-2xl font-bold opacity-90">{t('partners.title')}</h2>

	{#if removeError}
		<p class="pb-4 text-sm text-[var(--pico-error)]">{removeError}</p>
	{/if}

	{#if isLoading}
		<p aria-busy="true" class="mt-4">{t('partners.loading')}</p>
	{:else if partners.length > 0}
		<div class="grid">
			{#each partners as partner (partner.id)}
				<article>
					<div class="flex items-center justify-between gap-x-4">
						<div class="flex min-w-0 items-center gap-x-4">
							{#if partner.avatar_url}
								<img
									src={partner.avatar_url}
									alt="{partner.name}'s avatar"
									class="h-12 w-12 rounded-full object-cover"
								/>
							{:else}
								<!-- Placeholder SVG for when there is no avatar -->
								<div class="flex h-12 w-10 items-center justify-center">
									<CircleUserRound size={44} strokeWidth={1.5} />
								</div>
							{/if}
							<p class="max-w-[16ch] overflow-hidden overflow-ellipsis whitespace-nowrap">
								{partner.name}
							</p>
						</div>

						<div class="flex shrink-0 items-center space-x-4">
							<!-- Matches -->
							<a
								href="/matches?id={partner.id}"
								class="flex items-center justify-center gap-1 text-sm font-bold"
								data-tooltip={t('partners.matchesTooltip', { count: matchCounts[partner.id] ?? 0 })}
							>
								<IconBrandTinder />{matchCounts[partner.id] ?? 0}
							</a>
							<!-- Remove Connection -->
							<button
								onclick={() => (confirmingRemoval = partner.id)}
								class="flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0 text-sm font-bold"
								data-tooltip={t('partners.removeTooltip')}
								aria-label={t('partners.removeTooltip')}
								disabled={removing === partner.id}
							>
								<X size={28} color="var(--pico-error)" />
							</button>
						</div>
					</div>

					{#if confirmingRemoval === partner.id}
						<div class="mt-4 border-t border-[var(--pico-border-color-aux)] pt-4">
							<p class="m-0 text-balance text-sm">
								{t('partners.confirmRemove', { name: partner.name })}
							</p>
							<div class="flex flex-wrap gap-3 pt-3">
								<button
									class="danger-btn m-0 w-auto py-1"
									disabled={removing === partner.id}
									onclick={() => removeConnection(partner.id)}
								>
									{t('partners.removeTooltip')}
								</button>
								<button
									class="secondary m-0 w-auto py-1 outline"
									disabled={removing === partner.id}
									onclick={() => (confirmingRemoval = null)}
								>
									{t('common.cancel')}
								</button>
							</div>
						</div>
					{/if}
				</article>
			{/each}
		</div>
	{:else}
		<article class="text-center">
			<p>{t('partners.none')}</p>
			<p class="text-sm" style="color: var(--pico-muted-color);">
				{t('partners.shareHint')}
			</p>
		</article>
	{/if}
</div>

<style>
	.danger-btn {
		background-color: var(--pico-error-bg);
		border-color: var(--pico-error-bg);
		color: var(--pico-primary-inverse);
	}
	.danger-btn:hover {
		background-color: var(--pico-error-hover);
		border-color: var(--pico-error-hover);
	}
</style>
