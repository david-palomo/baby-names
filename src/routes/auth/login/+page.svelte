<script lang="ts">
	import { fly } from 'svelte/transition';
	import Google from '$lib/icons/Google.svelte';
	import Github from '$lib/icons/Github.svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';

	let email = '';
	let otp = '';
	let loading = false;
	let errorMessage = '';
	let successMessage = '';
	let showOtpField = false;

	async function sendOtp() {
		loading = true;
		errorMessage = '';
		successMessage = '';

		const { error } = await supabase.auth.signInWithOtp({ email });
		if (error) {
			errorMessage = error.message;
		} else {
			successMessage = 'Check your email for the OTP code!';
			showOtpField = true;
		}

		loading = false;
	}

	async function verifyOtp() {
		loading = true;
		errorMessage = '';
		successMessage = '';

		const { data, error } = await supabase.auth.verifyOtp({
			email,
			token: otp,
			type: 'email'
		});

		if (error) {
			errorMessage = error.message;
		} else {
			successMessage = 'You are now logged in!';
			store.user = data.user;
			goto('/game');
		}

		loading = false;
	}

	async function signInWithGoogle() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (error) errorMessage = error.message;
	}

	async function signInWithGithub() {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: 'github',
			options: {
				redirectTo: `${window.location.origin}/auth/callback`
			}
		});

		if (error) errorMessage = error.message;
	}
</script>

<article in:fly class="mb-6 px-6">
	<p class="pb-6 pr-4 pt-2 text-center text-lg font-bold">🔒 Sign in</p>

	{#if errorMessage}
		<div class="error mb-4 p-2 text-center">{errorMessage}</div>
	{/if}

	{#if successMessage}
		<div class="success mb-4 p-2 text-center">{successMessage}</div>
	{/if}

	<div class="flex flex-col-reverse items-start justify-center gap-8 sm:flex-row">
		<form class="w-full sm:w-1/2" on:submit|preventDefault={showOtpField ? verifyOtp : sendOtp}>
			{#if !showOtpField}
				<input type="email" placeholder="Email" bind:value={email} required />
				<button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Sending OTP...' : 'Continue with Email'}
				</button>
			{:else}
				<input
					type="text"
					placeholder="••••••"
					bind:value={otp}
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
			{/if}
		</form>

		{#if !showOtpField}
			<div class="border-anim flex w-full flex-col sm:w-1/2">
				<button
					type="button"
					class="flex w-full justify-center gap-1 border font-medium text-current outline"
					on:click={signInWithGoogle}
					disabled={loading}
				>
					<Google />
					<span>Continue with Google</span>
				</button>
				<button
					type="button"
					class="mb-0 flex w-full justify-center gap-1 border font-medium text-current outline"
					on:click={signInWithGithub}
					disabled={loading}
				>
					<Github />
					<span>Continue with GitHub</span>
				</button>
			</div>
		{/if}
	</div>
</article>

<style>
	.error {
		background-color: var(--pico-error-bg);
		color: var(--pico-secondary-inverse);
		border-radius: var(--pico-border-radius);
	}
	.success {
		background-color: var(--pico-success-bg);
		color: var(--pico-secondary-inverse);
		border-radius: var(--pico-border-radius);
	}
</style>
