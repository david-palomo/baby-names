<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		href: string;
		className?: string;
	}
	let { children, href, className }: Props = $props();
</script>

<!-- svelte-ignore a11y_no_redundant_roles -->
<a {href} class={className} role="link">
	{@render children()}
</a>
