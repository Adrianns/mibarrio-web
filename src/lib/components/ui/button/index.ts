import { type VariantProps, tv } from 'tailwind-variants';
import Root from './button.svelte';

const buttonVariants = tv({
	base: 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
	variants: {
		variant: {
			default: 'bg-primary-600 text-white hover:bg-primary-700',
			destructive: 'bg-red-500 text-white hover:bg-red-600',
			outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700',
			secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
			ghost: 'hover:bg-gray-100 text-gray-700',
			link: 'text-primary-600 underline-offset-4 hover:underline'
		},
		size: {
			default: 'h-10 px-4 py-2',
			sm: 'h-9 rounded-md px-3',
			lg: 'h-12 rounded-lg px-8 text-base',
			icon: 'h-10 w-10'
		}
	},
	defaultVariants: {
		variant: 'default',
		size: 'default'
	}
});

type Variant = VariantProps<typeof buttonVariants>['variant'];
type Size = VariantProps<typeof buttonVariants>['size'];

type Props = {
	variant?: Variant;
	size?: Size;
	class?: string;
};

export {
	Root,
	type Props,
	Root as Button,
	buttonVariants,
	type Props as ButtonProps,
	type Variant as ButtonVariant,
	type Size as ButtonSize
};
