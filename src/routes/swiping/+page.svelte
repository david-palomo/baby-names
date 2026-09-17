<script lang="ts">
	import { fly } from 'svelte/transition';
	import { getUser, supabase } from '$lib/supabase';
	import { Users, Undo, Heart, Settings } from 'lucide-svelte';
	import { IconBrandTinder } from '@tabler/icons-svelte';
	import { store } from '$lib/store.svelte';
	import { fetchState } from '$lib/fetchState.svelte';
	import type { BabyName, BabyNameInfo, NameMetadata, Swipe, SwipedName } from '$lib/types';
	import { tick, untrack } from 'svelte';
	import BackButton from '$lib/components/BackButton.svelte';
	import { useTranslate } from '$lib/i18n.svelte';
	import { dedupeById } from '$lib/swipes';

	const t = useTranslate();

	let swipes = $state<SwipedName[]>([]);
	let names = $state<BabyName[]>([]);
	const swipesState = fetchState();
	const namesState = fetchState();

	const currentName = $derived(names.length > 0 ? names[names.length - 1] : null);

	// Origin/meaning for every name in the deck, fetched once alongside it so
	// the card can show it immediately instead of on demand.
	let meta = $state<Record<number, NameMetadata>>({});

	/** Origin and meaning, kept apart so the origin can carry its own colour. */
	const infoParts = $derived.by(() => {
		const entry = currentName ? meta[currentName.id] : null;
		const origin = entry?.origin?.trim() || '';
		const meaning = entry?.meaning?.trim() || '';
		// Gender is only used to filter matches, so it is not shown here.
		return origin || meaning ? { origin, meaning } : null;
	});

	// --- Drag to swipe ---
	const SWIPE_THRESHOLD = 90;
	/** Fly-out duration. Shared with the CSS via --fly-ms so they can't drift. */
	const FLY_MS = 420;
	let dragX = $state(0);
	let dragging = $state(false);
	let flyOut = $state(0); // -1 left, 1 right, 0 resting
	let resetting = $state(false); // snap back without animating

	let pointerId: number | null = null;
	let startX = 0;
	let startY = 0;
	let axis: 'h' | 'v' | null = null;

	const cardTransform = $derived(
		flyOut !== 0
			? `translateX(${flyOut * 140}%) rotate(${flyOut * 18}deg)`
			: dragX !== 0
				? `translateX(${dragX}px) rotate(${dragX / 22}deg)`
				: ''
	);
	// Which stamp to show: 0 = undecided, 1 = yes, -1 = no. Once the card is
	// flying out the answer is settled, so the stamp stays at full strength.
	const intent = $derived(flyOut !== 0 ? flyOut : Math.abs(dragX) < 35 ? 0 : Math.sign(dragX));
	const intentStrength = $derived(
		flyOut !== 0 ? 1 : Math.min(1, Math.abs(dragX) / SWIPE_THRESHOLD)
	);
	// Secondary cue: the card's own border picks up the answer's colour.
	// Empty string removes the custom property, so the default border returns.
	const swipeTint = $derived(
		intent > 0 ? 'var(--pico-ok-bg)' : intent < 0 ? 'var(--pico-error-bg)' : ''
	);

	function onPointerDown(event: PointerEvent) {
		if (!currentName || flyOut !== 0) return;
		// Let the buttons inside the card work normally.
		if ((event.target as HTMLElement).closest('button, a')) return;
		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		axis = null;
		dragging = true;
	}

	function onPointerMove(event: PointerEvent) {
		if (!dragging || event.pointerId !== pointerId) return;
		const dx = event.clientX - startX;
		const dy = event.clientY - startY;

		// Decide once whether this is a swipe or a page scroll.
		if (!axis) {
			if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
			axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
			if (axis === 'h') {
				// Not every pointer can be captured (synthetic events, some browsers).
				try {
					(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
				} catch {
					/* dragging still works without capture */
				}
			}
		}
		if (axis !== 'h') return;
		dragX = dx;
	}

	function onPointerUp() {
		if (!dragging) return;
		dragging = false;
		const dx = dragX;
		pointerId = null;

		if (axis === 'h' && Math.abs(dx) >= SWIPE_THRESHOLD) {
			commitSwipe(dx > 0);
		} else {
			dragX = 0;
		}
		axis = null;
	}

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	/**
	 * Stamps the card yes/no, animates it off-screen, then records the swipe.
	 * The stamp and the border tint come up with the very first frame of the
	 * fly-out, so a button or a key press reacts as immediately as a drag.
	 */
	async function commitSwipe(liked: boolean) {
		if (!currentName || flyOut !== 0) return;

		flyOut = liked ? 1 : -1;
		await wait(FLY_MS);

		resetting = true;
		flyOut = 0;
		dragX = 0;
		await handleSwipe(liked);
		await tick();
		requestAnimationFrame(() => (resetting = false));
	}

	function onKeyDown(event: KeyboardEvent) {
		if (!currentName) return;
		if (event.key === 'ArrowRight') commitSwipe(true);
		else if (event.key === 'ArrowLeft') commitSwipe(false);
	}

	async function getSwipes() {
		if (store.user && ['loading', 'success'].includes(swipesState.status)) return;
		swipesState.setLoading();

		const { data, error } = await supabase.from('v_swipes').select('id,name,liked').limit(100);

		if (error) {
			swipesState.setError(error.message);
		} else {
			swipes = dedupeById(data).toReversed();
			swipesState.setSuccess();
		}
	}

	async function getNames() {
		if (store.user && ['loading', 'success'].includes(namesState.status)) return;
		namesState.setLoading();

		const { data, error } = await supabase.from('v_random_names').select('id,name');

		if (error) {
			namesState.setError(error.message);
		} else {
			names = data || [];
			namesState.setSuccess();
			loadMeta(names.map((n) => n.id));
		}
	}

	/**
	 * Selects `*` rather than naming the metadata columns, so this still
	 * resolves against a database where 0001_name_metadata.sql hasn't been run
	 * — the card simply shows no info line in that case.
	 */
	async function loadMeta(ids: number[]) {
		const missing = ids.filter((id) => !(id in meta));
		if (missing.length === 0) return;

		const { data } = await supabase.from('babynames').select('*').in('id', missing);
		if (!data) return;

		const next = { ...meta };
		for (const row of data as BabyNameInfo[]) {
			next[row.id] = { origin: row.origin, meaning: row.meaning };
		}
		meta = next;
	}

	async function handleSwipe(liked: boolean) {
		const current = names.pop();
		if (!current) return;

		const swipe: Swipe = { babyname_id: current.id, liked };
		const { error } = await supabase.from('swipes').upsert(swipe);

		if (error?.code === '23503' && error.message.includes('swipes_user_id_fkey')) {
			store.user = await getUser();
			const retryData = swipes.map((s) => ({ babyname_id: s.id, liked: s.liked })).concat(swipe);
			await supabase.from('swipes').upsert(retryData);
		}

		const existingIndex = swipes.findIndex((s) => s.id === current.id);
		if (existingIndex > -1) {
			swipes.splice(existingIndex, 1);
		}
		swipes.push({ ...current, liked });
		if (swipes.length > 100) {
			swipes.shift();
		}
	}

	async function handleUndo() {
		const lastSwipe = swipes.pop();
		if (!lastSwipe) return;

		await supabase.from('swipes').delete().match({
			user_id: store.user?.id,
			babyname_id: lastSwipe.id
		});

		names.push({ id: lastSwipe.id, name: lastSwipe.name });
	}

	function putBackInDeck(swipe: SwipedName) {
		names.push({ id: swipe.id, name: swipe.name });
	}

	$effect(() => {
		const id = currentName?.id;
		if (id == null || id in meta) return;
		untrack(() => loadMeta([id]));
	});

	$effect(() => {
		if (store.user) {
			untrack(() => {
				swipes = [];
				swipesState.reset();
				getNames();
				getSwipes();
			});
		}
	});
</script>

<svelte:window onkeydown={onKeyDown} />

<BackButton href="/" />

<div in:fly={{ x: store.transitionDirection * 20, duration: 300 }}>
	<!-- Fixed height, so nothing reflows when the info slot swaps. -->
	<div
		class="card-drag mb-6 max-h-[55vh] min-h-[17.5rem] 2xs:h-[21.5rem]"
		class:dragging
		class:resetting
		class:flying={flyOut !== 0}
		style:transform={cardTransform}
		style:--swipe-tint={swipeTint}
		style:--fly-ms={`${FLY_MS}ms`}
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		<article class="card-face flex flex-col items-center justify-center text-center">
			<p class="text-lg text-[var(--pico-muted-color)]">{t('swiping.question')}</p>
			<p class="flex h-20 items-center font-title text-4xl font-bold">
				{#if namesState.status === 'idle' || namesState.status === 'loading'}
					...
				{:else if namesState.status === 'error'}
					<span class="text-base text-[var(--pico-error)]">{t('swiping.errorNames')}</span>
				{:else if currentName}
					{currentName.name}
				{:else}
					{t('swiping.noNamesLeft')}
				{/if}
			</p>

			<!-- Always-on info line. Fixed height so a name without metadata
			     leaves the rest of the card exactly where it is. -->
			<div class="flex min-h-[2.75rem] w-full items-center justify-center px-6">
				{#if infoParts}
					<!-- Flex rather than inline text, so the gaps either side of the
					     separator are exactly equal and don't depend on whitespace. -->
					<p class="m-0 flex max-w-xs flex-wrap items-baseline justify-center gap-x-2 text-sm">
						{#if infoParts.origin}
							<span class="font-bold text-[var(--pico-primary)]">{infoParts.origin}</span>
						{/if}
						{#if infoParts.origin && infoParts.meaning}
							<span class="text-[var(--pico-primary)]" aria-hidden="true">|</span>
						{/if}
						{#if infoParts.meaning}
							<span class="text-balance">{infoParts.meaning}</span>
						{/if}
					</p>
				{/if}
			</div>

			<!-- Undo sits beside the pair it undoes, deliberately quieter. The
			     spacer opposite keeps no/yes centred on the card. -->
			<div class="flex items-center justify-center gap-2 pt-2 4xs:gap-3">
				<button
					type="button"
					class="undo-btn m-0 flex h-10 w-10 items-center justify-center p-0"
					title={t('swiping.undo')}
					aria-label={t('swiping.undo')}
					disabled={swipes.length === 0}
					onclick={handleUndo}
				>
					<Undo size={18} />
				</button>
				<button
					onclick={() => commitSwipe(false)}
					type="button"
					disabled={!currentName}
					class="error-btn m-0 w-20 px-4 py-2 text-lg font-bold 4xs:w-24">{t('swiping.no')}</button
				>
				<button
					onclick={() => commitSwipe(true)}
					type="button"
					disabled={!currentName}
					class="ok-btn m-0 w-20 px-4 py-2 text-lg font-bold 4xs:w-24">{t('swiping.yes')}</button
				>
				<span class="h-10 w-10" aria-hidden="true"></span>
			</div>

			<!-- Drag intent badges -->
			<span
				class="badge badge-yes"
				class:stamped={flyOut !== 0}
				aria-hidden="true"
				style:opacity={intent > 0 ? intentStrength : 0}
			>
				{t('swiping.yes')}
			</span>
			<span
				class="badge badge-no"
				class:stamped={flyOut !== 0}
				aria-hidden="true"
				style:opacity={intent < 0 ? intentStrength : 0}
			>
				{t('swiping.no')}
			</span>
		</article>
	</div>

	<div class="mb-6 flex gap-4">
		<a
			href="/partners"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-primary)] xs:px-5"
		>
			<Users class="text-[var(--pico-primary)]" />
			<span class="hidden px-2 xs:inline">{t('swiping.partners')}</span>
		</a>
		<a
			href="/matches"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-error)] xs:px-5"
		>
			<IconBrandTinder class="text-[var(--pico-error)]" />
			<span class="px-2">{t('swiping.matches')}</span>
		</a>
		<a
			href="/settings"
			class="card flex w-full items-center justify-center px-3 py-3 hover:border-[var(--pico-accent3)] xs:px-5"
		>
			<Settings class="text-[var(--pico-accent3)]" />
			<span class="hidden px-2 xs:inline">{t('swiping.settings')}</span>
		</a>
	</div>

	<article class="flex w-full flex-col gap-4 p-6 sm:px-8">
		<div class="flex flex-col gap-1">
			<h2 class="m-0 flex items-center gap-3 pt-1 text-lg font-bold">
				<Heart class="text-[var(--pico-error)]" />{t('swiping.previousSwipes')}
			</h2>
			{#if swipesState.status === 'success' && swipes.length > 0}
				<p class="m-0 text-xs text-[var(--pico-muted-color)]">{t('swiping.changedMind')}</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-x-4">
			{#if swipesState.status === 'idle' || swipesState.status === 'loading'}
				<p class="py-1 text-[var(--pico-muted-color)]">{t('swiping.loadingSwipes')}</p>
			{:else if swipesState.status === 'error'}
				<p class="py-1 text-[var(--pico-muted-color)]">
					{t('swiping.oops', { message: swipesState.message })}
				</p>
			{:else if swipes.length === 0}
				<p class="py-1 text-[var(--pico-muted-color)]">{t('swiping.noSwipes')}</p>
			{:else}
				{#each swipes.slice(-16).toReversed() as swipe (swipe.id)}
					<button
						class="inline border-0 py-1
							{swipe.liked ? 'text-[var(--pico-ok)]' : 'line-through decoration-2 opacity-50'}
							hover:text-[var(--pico-accent2)] hover:underline hover:decoration-auto hover:opacity-100"
						title={t('swipes.undo')}
						onclick={() => putBackInDeck(swipe)}
					>
						{swipe.name}
					</button>
				{/each}
				<a href="/swipes" class="py-1 text-[var(--pico-accent2)] hover:underline"
					>{t('swiping.seeMore')}</a
				>
			{/if}
		</div>
	</article>
</div>

<style>
	.card-drag {
		transition: transform 260ms ease-out;
		touch-action: pan-y;
		cursor: grab;
		/* Dragging a card shouldn't start a text selection. */
		-webkit-user-select: none;
		user-select: none;
	}
	/* Leaving takes longer than springing back, so the answer has time to read. */
	.card-drag.flying {
		transition: transform var(--fly-ms, 420ms) cubic-bezier(0.22, 0.61, 0.36, 1);
	}
	.card-drag.dragging {
		transition: none;
		cursor: grabbing;
	}
	/* The next name is already on screen by now, so clear the stamp and the
	   tint instantly - animating them out would flash them over the new card. */
	.card-drag.resetting,
	.card-drag.resetting .card-face,
	.card-drag.resetting .badge {
		transition: none;
	}

	.card-drag {
		position: relative;
	}
	.card-face {
		position: absolute;
		inset: 0;
		margin: 0;
		border-color: var(--swipe-tint, var(--pico-border-color));
		transition: border-color 150ms ease;
	}

	.badge {
		position: absolute;
		top: 1.25rem;
		font-family: inherit;
		font-size: 1.5rem;
		font-weight: 700;
		text-transform: uppercase;
		border-width: 3px;
		border-style: solid;
		border-radius: var(--pico-border-radius);
		padding: 0.1rem 0.75rem;
		pointer-events: none;
		transition:
			opacity 120ms linear,
			transform 160ms ease-out;
	}
	.badge-yes {
		left: 1.25rem;
		color: var(--pico-ok-bg);
		border-color: var(--pico-ok-bg);
		transform: rotate(-12deg) scale(1);
	}
	/* Pops once the answer is settled, so a tap or a key press lands as
	   firmly as a swipe does. */
	.badge-yes.stamped {
		transform: rotate(-12deg) scale(1.15);
	}
	.badge-no {
		right: 1.25rem;
		color: var(--pico-error);
		border-color: var(--pico-error);
		transform: rotate(12deg) scale(1);
	}
	.badge-no.stamped {
		transform: rotate(12deg) scale(1.15);
	}

	.undo-btn {
		background-color: transparent;
		border-color: var(--pico-border-color-aux);
		color: var(--pico-accent2);
	}
	.undo-btn:hover:not(:disabled) {
		border-color: var(--pico-accent2);
	}
	.undo-btn:disabled {
		opacity: 0.35;
	}

	.error-btn {
		background-color: var(--pico-error-bg);
		border-color: var(--pico-error-bg);
	}
	.error-btn:hover {
		background-color: var(--pico-error-hover);
		border-color: var(--pico-error-hover);
	}
	.ok-btn {
		background-color: var(--pico-ok-bg);
		border-color: var(--pico-ok-bg);
		outline-color: var(--pico-ok-bg);
	}
	.ok-btn:hover {
		background-color: var(--pico-ok-hover);
		border-color: var(--pico-ok-hover);
	}

	@media (prefers-reduced-motion: reduce) {
		.card-drag,
		.card-face,
		.badge {
			transition: none;
		}
	}
</style>
