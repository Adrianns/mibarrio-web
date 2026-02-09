<script lang="ts">
	import '../app.css';
	import Toast from '$lib/components/Toast.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { APP_NAME, APP_DESCRIPTION } from '$lib/config';
	import { auth } from '$lib/stores/auth';
	import { initializeActivity } from '$lib/stores/activity';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let { children, data } = $props();

	// Inject env vars into window for client-side access
	if (browser && data.env) {
		(window as unknown as Record<string, string>).PUBLIC_SUPABASE_URL = data.env.PUBLIC_SUPABASE_URL;
		(window as unknown as Record<string, string>).PUBLIC_SUPABASE_ANON_KEY = data.env.PUBLIC_SUPABASE_ANON_KEY;
	}

	onMount(() => {
		auth.initialize();
		initializeActivity();
	});
</script>

<Toast />
<div class="pb-16 md:pb-0">
	{@render children()}
</div>
<BottomNav />
