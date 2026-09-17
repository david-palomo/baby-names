<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { fly } from 'svelte/transition';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate, type MessageKey } from '$lib/i18n.svelte';
	import { untrack } from 'svelte';

	const t = useTranslate();

	let error = $state<{ key: MessageKey; message?: string } | null>(null);
	let needsLogin = $state(false);

	async function connect() {
		const partnerId = page.url.searchParams.get('id');

		if (!partnerId) {
			error = { key: 'connect.errorNoId' };
			return;
		}
		if (!store.user || store.user.is_anonymous) {
			error = { key: 'connect.errorAnon' };
			needsLogin = true;
			return;
		}
		if (partnerId === store.user.id) {
			error = { key: 'connect.errorSelf' };
			return;
		}

		const { error: insertError } = await supabase
			.from('connections')
			.insert([{ user_id: store.user.id, partner_id: partnerId }]);

		// 23505 is a unique violation, i.e. these two are already connected.
		if (insertError && insertError.code !== '23505') {
			error = { key: 'connect.errorGeneric', message: insertError.message };
			return;
		}

		goto('/partners');
	}

	$effect(() => {
		if (store.user) untrack(() => connect());
	});
</script>

{#if error}
	<BackButton href="/swiping" />
{/if}

<div in:fly={{ y: 20, duration: 300 }}>
	<article class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		{#if error}
			<p class="m-0 font-title text-2xl font-bold">{t('connect.errorTitle')}</p>
			<p class="m-0 max-w-sm text-balance text-[var(--pico-muted-color)]">
				{t(error.key, { message: error.message ?? '' })}
			</p>
			<div class="flex flex-wrap justify-center gap-3 pt-2">
				{#if needsLogin}
					<a href="/auth/login?next={page.url.pathname}{page.url.search}" role="button" class="m-0">
						{t('connect.logIn')}
					</a>
				{/if}
				<a href="/" role="button" class="secondary m-0 outline">{t('connect.goHome')}</a>
			</div>
		{:else}
			<p class="m-0" aria-busy="true">{t('connect.connecting')}</p>
		{/if}
	</article>
</div>
