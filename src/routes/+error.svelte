<script>
	import { page } from '$app/state';
</script>

<div class="flex flex-grow flex-col justify-center px-6 pb-36 pt-12 text-center">
	<h1 class="pb-3 text-3xl text-[var(--pico-muted-color)]">{page.status}</h1>
	<h2 class="text-lg text-[var(--pico-muted-color)]">{page.error?.message}</h2>
</div>
