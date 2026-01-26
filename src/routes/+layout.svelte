<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import { APP_NAME, APP_DESCRIPTION } from '$lib/config';

	let { children } = $props();
</script>

<svelte:head>
	<title>{APP_NAME}</title>
	<meta name="description" content={APP_DESCRIPTION} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Toast />
{@render children()}
