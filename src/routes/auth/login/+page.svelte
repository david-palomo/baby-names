<script lang="ts">
	import { fly } from 'svelte/transition';
	import Google from '$lib/icons/Google.svelte';
	import Github from '$lib/icons/Github.svelte';
	import { SendHorizontal } from 'lucide-svelte';
	import { supabase } from '$lib/supabase';
	import { goto } from '$app/navigation';
	import { store } from '$lib/store.svelte';

	let email = '';
	let otp = '';
	let loading = false;
	let errorMessage = '';
	let otpMessage = '';
	let showOtpField = false;

	async function sendOtp() {
		loading = true;
		errorMessage = '';
		otpMessage = '';

		const { error } = await supabase.auth.signInWithOtp({ email });
		if (error) {
			errorMessage = error.message;
		} else {
			otpMessage = 'Check your email for the OTP code!';
			showOtpField = true;
		}

		loading = false;
	}

	async function verifyOtp() {
		loading = true;
		errorMessage = '';
		otpMessage = '';

		const { data, error } = await supabase.auth.verifyOtp({
			email,
			token: otp,
			type: 'email'
		});

		if (error) {
			errorMessage = error.message;
		} else {
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

<article in:fly class="mb-6 flex h-96 flex-col justify-start gap-6 px-8 sm:gap-8 md:px-10">
	<p class="pb-2 pr-4 pt-6 text-center text-2xl font-bold sm:pt-8">🔒 Log in</p>

	<div class="flex flex-col-reverse items-start justify-center gap-6 sm:flex-row md:gap-10">
		<form
			class="w-full text-center sm:w-1/2"
			on:submit|preventDefault={showOtpField ? verifyOtp : sendOtp}
		>
			{#if !showOtpField}
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
				{#if otpMessage}
					<p class="success mb-4 mt-2 p-2 text-center">{otpMessage}</p>
				{:else if errorMessage}
					<p class="error mb-4 mt-2 p-2 text-center">{errorMessage}</p>
				{:else}
					<p class="mb-4 mt-2 p-2 text-center">...</p>
				{/if}
				<div>
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
				</div>
			{/if}
		</form>

		{#if !showOtpField}
			<div class="hidden sm:block">
				<p class="pt-10 text-center text-[var(--pico-muted-color)]">OR</p>
			</div>
			<div class="border-anim flex w-full flex-col justify-start sm:w-1/2">
				<button
					type="button"
					class="flex w-full justify-center gap-1 border-2 font-medium text-current outline"
					on:click={signInWithGoogle}
					disabled={loading}
				>
					<Google />
					<span>Continue with Google</span>
				</button>
				<button
					type="button"
					class="mb-0 flex w-full justify-center gap-1 border-2 font-medium text-current outline"
					on:click={signInWithGithub}
					disabled={loading}
				>
					<Github />
					<span>Continue with GitHub</span>
				</button>
			</div>
		{/if}
	</div>
	{#if !showOtpField && !errorMessage && !otpMessage}
		<div class="hidden text-center text-sm text-[var(--pico-muted-color)] sm:block">
			Logging in will allow you to save your swipes and connect with a partner.
			<br />We will never share your email with anyone.
			<br />We will never send you spam.
		</div>
	{/if}

	{#if !showOtpField && errorMessage}
		<div class="error p-2 text-center">{errorMessage}</div>
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
