<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { MapPin, Navigation, X } from 'lucide-svelte';

	let {
		lat = $bindable<number | null>(null),
		lng = $bindable<number | null>(null),
		readOnly = false
	} = $props();

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: L.Map | null = null;
	let marker: L.Marker | null = null;
	let L: typeof import('leaflet') | null = null;
	let mapReady = $state(false);
	let expanded = $state(false);
	let locating = $state(false);

	const uruguayCenter: [number, number] = [-34.9, -56.18];
	const defaultZoom = 13;
	const countryZoom = 7;

	// Auto-expand if coordinates already exist
	$effect(() => {
		if (lat !== null && lng !== null) {
			expanded = true;
		}
	});

	async function initMap() {
		if (!browser || !mapContainer) return;

		L = await import('leaflet');
		await import('leaflet/dist/leaflet.css');

		const center: [number, number] = lat !== null && lng !== null
			? [lat, lng]
			: uruguayCenter;

		const zoom = lat !== null && lng !== null ? defaultZoom : countryZoom;

		map = L.map(mapContainer, {
			center,
			zoom,
			zoomControl: true,
			attributionControl: false
		});

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			maxZoom: 19
		}).addTo(map);

		// Place existing marker if coordinates exist
		if (lat !== null && lng !== null) {
			marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(map);
			if (!readOnly) {
				marker.on('dragend', () => {
					const pos = marker!.getLatLng();
					lat = pos.lat;
					lng = pos.lng;
				});
			}
		}

		if (!readOnly) {
			map.on('click', (e: L.LeafletMouseEvent) => {
				const { lat: clickLat, lng: clickLng } = e.latlng;
				setMarker(clickLat, clickLng);
			});
		}

		mapReady = true;
	}

	function setMarker(newLat: number, newLng: number) {
		if (!L || !map) return;

		lat = newLat;
		lng = newLng;

		if (marker) {
			marker.setLatLng([newLat, newLng]);
		} else {
			marker = L.marker([newLat, newLng], { draggable: !readOnly }).addTo(map);
			marker.on('dragend', () => {
				const pos = marker!.getLatLng();
				lat = pos.lat;
				lng = pos.lng;
			});
		}
	}

	function handleLocate() {
		if (!browser || !navigator.geolocation) return;

		locating = true;
		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				setMarker(latitude, longitude);
				map?.setView([latitude, longitude], defaultZoom);
				locating = false;
			},
			() => {
				locating = false;
			},
			{ timeout: 8000, maximumAge: 300000 }
		);
	}

	function handleClear() {
		lat = null;
		lng = null;
		if (marker && map) {
			map.removeLayer(marker);
			marker = null;
		}
	}

	function handleExpand() {
		expanded = true;
		// Wait for DOM to render the map container
		queueMicrotask(() => {
			queueMicrotask(() => {
				initMap();
			});
		});
	}

	onMount(() => {
		if (expanded) {
			initMap();
		}
		return () => {
			map?.remove();
			map = null;
		};
	});
</script>

<div>
	{#if readOnly}
		{#if lat !== null && lng !== null}
			<div class="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 h-48">
				<div bind:this={mapContainer} class="w-full h-full"></div>
			</div>
		{/if}
	{:else if !expanded}
		<button
			type="button"
			onclick={handleExpand}
			class="w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
		>
			<MapPin class="h-4 w-4" />
			<span class="text-sm">Marcar ubicación en el mapa</span>
		</button>
	{:else}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
					Ubicación en el mapa
				</span>
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={handleLocate}
						disabled={locating}
						class="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 disabled:opacity-50"
					>
						<Navigation class="h-3 w-3" />
						{locating ? 'Buscando...' : 'Usar mi ubicación'}
					</button>
					{#if lat !== null && lng !== null}
						<button
							type="button"
							onclick={handleClear}
							class="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
						>
							<X class="h-3 w-3" />
							Quitar
						</button>
					{/if}
				</div>
			</div>
			<div class="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 h-56">
				<div bind:this={mapContainer} class="w-full h-full"></div>
			</div>
			{#if lat !== null && lng !== null}
				<p class="text-xs text-gray-400">Tocá el mapa o arrastrá el marcador para ajustar</p>
			{:else}
				<p class="text-xs text-gray-400">Tocá el mapa para marcar tu ubicación</p>
			{/if}
		</div>
	{/if}
</div>
