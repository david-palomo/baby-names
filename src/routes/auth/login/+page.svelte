<script lang="ts">
	import { fly } from 'svelte/transition';
	import Google from '$lib/icons/Google.svelte';
	import Github from '$lib/icons/Github.svelte';
	import { SendHorizontal } from 'lucide-svelte';
	import { getUser, supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate, type MessageKey } from '$lib/i18n.svelte';

	const t = useTranslate();

	let email = $state('');
	let token = $state('');
	let loading = $state(false);
	let errorMessage = $state('');
	let otpSent = $state(false);

	const pageNames: Record<string, MessageKey> = {
		'/swiping': 'page.swiping',
		'/swipes': 'page.swipes',
		'/matches': 'page.matches',
		'/partners': 'page.partners',
		'/settings': 'page.settings',
		'/connect': 'page.partners'
	};

	const protectedPageName = $derived.by(() => {
		const next = page.url.searchParams.get('next') ?? '';
		const key = pageNames[next.split('?')[0]];
		return key ? t(key) : next.replace(/^.*[\\/]/, '');
	});

	async function sendOtp() {
		loading = true;
		errorMessage = '';
		const { error } = await supabase.auth.signInWithOtp({ email });
		if (error) errorMessage = error.message;
		else otpSent = true;
		loading = false;
	}

	async function verifyOtp() {
		loading = true;
		errorMessage = '';
		const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
		if (error) {
			errorMessage = error.message;
		} else {
			const urlParams = new URLSearchParams(window.location.search);
			const anonUserId = store.user?.is_anonymous ? store.user.id : null;
			const nextUrl = urlParams.get('next') || '/';
			store.user = await getUser();
			if (anonUserId && store.user?.id) {
				await supabase.rpc('copy_swipes', {
					source_user_id: anonUserId,
					target_user_id: store.user.id
				});
			}
			goto(nextUrl);
		}
		loading = false;
	}

	async function signInWithOauth(provider: 'github' | 'google') {
		// Built once to assemble a redirect URL, never held as reactive state.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const urlParams = new URLSearchParams(window.location.search);
		if (store.user?.is_anonymous) urlParams.set('anon_user_id', store.user.id);
		const redirectTo = `${window.location.origin}/auth/callback?${urlParams.toString()}`;
		await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
	}

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (otpSent) verifyOtp();
		else sendOtp();
	}
</script>

<BackButton />

<div in:fly={{ y: 20, duration: 300 }}>
	{#if page.url.searchParams.get('protected')}
		<article class="mb-6 p-4 text-center">
			<p class="text-balance text-[var(--pico-muted-color)]">
				<!-- Static copy from our own dictionary, never user input; only <em> markup. -->
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html t('login.protected', { page: protectedPageName })}
			</p>
		</article>
	{/if}
	<article class="mb-6 flex h-96 flex-col justify-start gap-6 px-8 sm:gap-8 md:px-10">
		<h2 class="pr-4 pt-4 text-center font-title text-2xl font-bold sm:pt-8">{t('login.title')}</h2>

		<div class="flex flex-col-reverse items-start justify-center gap-6 sm:flex-row md:gap-10">
			<form class="w-full text-center sm:w-1/2" onsubmit={handleSubmit}>
				{#if !otpSent}
					<div class="hidden sm:block">
						<input type="email" placeholder={t('login.email')} bind:value={email} required />
						<button type="submit" class="w-full" disabled={loading}>
							{loading ? t('login.sending') : t('login.continueEmail')}
						</button>
					</div>

					<div class="pb-6 text-center text-[var(--pico-muted-color)] sm:hidden">
						{t('login.or')}
					</div>
					<fieldset role="group" class="sm:hidden">
						<input
							type="email"
							placeholder={t('login.continueEmailShort')}
							bind:value={email}
							required
							class="border-2 placeholder-[var(--pico-secondary)]"
						/>
						<button type="submit" disabled={loading} aria-label={t('login.continueEmail')}>
							{#if loading}
								<SendHorizontal class="animate-spin" />
							{:else}
								<SendHorizontal />
							{/if}
						</button>
					</fieldset>
				{:else}
					<p class="{errorMessage ? 'error' : 'success'} mb-4 mt-2 p-2 text-center">
						{errorMessage || t('login.otpSent')}
					</p>
					<div>
						<input
							type="text"
							placeholder="••••••"
							bind:value={token}
							required
							inputmode="numeric"
							pattern="[0-9]*"
							maxlength="6"
							name="otp"
							autocomplete="one-time-code"
							class="text-center font-mono text-lg tracking-[6px]"
						/>
						<button type="submit" class="w-full" disabled={loading}>
							{loading ? t('login.verifying') : t('login.verify')}
						</button>
					</div>
				{/if}
			</form>

			{#if !otpSent}
				<div class="hidden sm:block">
					<p class="pt-10 text-center text-[var(--pico-muted-color)]">{t('login.or')}</p>
				</div>
				<div class="border-anim flex w-full flex-col justify-start sm:w-1/2">
					<button
						type="button"
						class="flex w-full justify-center gap-1 border-2 font-medium text-current outline"
						onclick={() => signInWithOauth('google')}
						disabled={loading}
					>
						<Google />
						<span>{t('login.google')}</span>
					</button>
					<button
						type="button"
						class="mb-0 flex w-full justify-center gap-1 border-2 font-medium text-current outline"
						onclick={() => signInWithOauth('github')}
						disabled={loading}
					>
						<Github />
						<span>{t('login.github')}</span>
					</button>
				</div>
			{/if}
		</div>
		{#if !otpSent}
			{#if errorMessage}
				<div class="error p-2 text-center">{errorMessage}</div>
			{:else}
				<div class="hidden text-center text-sm text-[var(--pico-muted-color)] sm:block">
					{t('login.disclaimer1')}
					<br />{t('login.disclaimer2')}
					<br />{t('login.disclaimer3')}
				</div>
			{/if}
		{/if}
	</article>
</div>

<style>
	.error {
		color: var(--pico-error);
		border-radius: var(--pico-border-radius);
	}
	.error::after {
		content: '... 👀';
	}
</style>
