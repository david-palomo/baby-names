<script lang="ts">
	import { fly } from 'svelte/transition';
	import Google from '$lib/icons/Google.svelte';
	import Github from '$lib/icons/Github.svelte';
	import { SendHorizontal } from 'lucide-svelte';
	import { supabase } from '$lib/supabase';
	import { store } from '$lib/store.svelte';

	let email = '';
	let token = '';
	let loading = false;
	let errorMessage = '';
	let otpMessage = '';

	async function sendOtp() {
		loading = true;
		errorMessage = '';
		otpMessage = '';
		const { error } = await supabase.auth.signInWithOtp({ email });
		error ? (errorMessage = error.message) : (otpMessage = 'Check your email for the OTP code!');
		loading = false;
	}

	async function verifyOtp() {
		loading = true;
		errorMessage = '';
		otpMessage = '';
		const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
		error ? (errorMessage = error.message) : (store.user = data.user);
		loading = false;
	}

	async function signInWithOauth(provider: 'github' | 'google') {
		const urlParams = new URLSearchParams(window.location.search);
		if (store.user?.is_anonymous) urlParams.set('anon_user_id', store.user.id);
		await supabase.auth.signInWithOAuth({
			provider,
			options: { redirectTo: `${window.location.origin}/auth/callback?${urlParams.toString()}` }
		});
	}
</script>

<article in:fly class="mb-6 flex h-96 flex-col justify-start gap-6 px-8 sm:gap-8 md:px-10">
	<p class="pb-2 pr-4 pt-6 text-center text-2xl font-bold sm:pt-8">🔒 Log in</p>

	<div class="flex flex-col-reverse items-start justify-center gap-6 sm:flex-row md:gap-10">
		<form
			class="w-full text-center sm:w-1/2"
			on:submit|preventDefault={otpMessage ? verifyOtp : sendOtp}
		>
			{#if !otpMessage}
				<div class="hidden sm:block">
					<input type="email" placeholder="Email" bind:value={email} required />
					<button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Sending OTP...' : 'Continue with Email'}
					</button>
				</div>

				<div class="pb-6 text-center text-[var(--pico-muted-color)] sm:hidden">OR</div>
				<fieldset role="group" class="sm:hidden">
					<input
						type="email"
						placeholder="Continue with email"
						bind:value={email}
						required
						class="border-2 placeholder-[var(--pico-secondary)]"
					/>
					<button type="submit" disabled={loading}>
						{#if loading}
							<SendHorizontal class="animate-spin" />
						{:else}
							<SendHorizontal />
						{/if}
					</button>
				</fieldset>
			{:else}
				<p class="{errorMessage ? 'error' : 'success'} mb-4 mt-2 p-2 text-center">
					{errorMessage || otpMessage}
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
						{loading ? 'Verifying...' : 'Verify OTP code'}
					</button>
				</div>
			{/if}
		</form>

		{#if !otpMessage}
			<div class="hidden sm:block">
				<p class="pt-10 text-center text-[var(--pico-muted-color)]">OR</p>
			</div>
			<div class="border-anim flex w-full flex-col justify-start sm:w-1/2">
				<button
					type="button"
					class="flex w-full justify-center gap-1 border-2 font-medium text-current outline"
					on:click={() => signInWithOauth('google')}
					disabled={loading}
				>
					<Google />
					<span>Continue with Google</span>
				</button>
				<button
					type="button"
					class="mb-0 flex w-full justify-center gap-1 border-2 font-medium text-current outline"
					on:click={() => signInWithOauth('github')}
					disabled={loading}
				>
					<Github />
					<span>Continue with GitHub</span>
				</button>
			</div>
		{/if}
	</div>
	{#if !otpMessage}
		{#if errorMessage}
			<div class="error p-2 text-center">{errorMessage}</div>
		{:else}
			<div class="hidden text-center text-sm text-[var(--pico-muted-color)] sm:block">
				Logging in will allow you to save your swipes and connect with a partner.
				<br />We will never share your email with anyone.
				<br />We will never send you spam.
			</div>
		{/if}
	{/if}
</article>

<style>
	.error {
		color: var(--pico-error);
		border-radius: var(--pico-border-radius);
	}
	.error::after {
		content: '... 👀';
	}
</style>
