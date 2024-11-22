<script>
	let { children, href, className } = $props();
</script>

<!-- svelte-ignore a11y_no_redundant_roles -->
<a {href} class={className} role="link">
	{@render children()}
</a>
