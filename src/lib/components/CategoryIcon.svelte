<script lang="ts">
	import {
		Zap,
		Droplets,
		Hammer,
		Paintbrush,
		Axe,
		Flower2,
		Wrench,
		Monitor,
		Key,
		Truck,
		Sparkles,
		Heart,
		Stethoscope,
		Scale,
		Calculator,
		UtensilsCrossed,
		Coffee,
		Croissant,
		Beef,
		Apple,
		Pill,
		Scissors,
		Dumbbell,
		PawPrint,
		WashingMachine,
		Store,
		ShoppingCart,
		Settings,
		Printer,
		Flower,
		BookOpen,
		Glasses,
		MoreHorizontal,
		type Icon as IconType
	} from 'lucide-svelte';
	import type { ComponentType } from 'svelte';

	interface Props {
		name: string;
		class?: string;
	}

	let { name, class: className = 'w-6 h-6' }: Props = $props();

	const iconMap: Record<string, ComponentType<IconType>> = {
		Zap,
		Droplets,
		Hammer,
		Paintbrush,
		Axe,
		Flower2,
		Wrench,
		Monitor,
		Key,
		Truck,
		Sparkles,
		Heart,
		Stethoscope,
		Scale,
		Calculator,
		UtensilsCrossed,
		Coffee,
		Croissant,
		Beef,
		Apple,
		Pill,
		Scissors,
		Dumbbell,
		PawPrint,
		WashingMachine,
		Store,
		ShoppingCart,
		Settings,
		Printer,
		Flower,
		BookOpen,
		Glasses,
		MoreHorizontal
	};

	const IconComponent = $derived(iconMap[name]);
</script>

{#if IconComponent}
	<IconComponent class={className} />
{:else}
	<span class={className}>{name.charAt(0)}</span>
{/if}
