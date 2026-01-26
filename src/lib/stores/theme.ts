// Theme store - Dark/Light mode with localStorage persistence
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
	if (!browser) return 'light';

	// Check localStorage first
	const stored = localStorage.getItem('mibarrio-theme') as Theme | null;
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}

	// Check system preference
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
		return 'dark';
	}

	return 'light';
}

function createThemeStore() {
	const { subscribe, set, update } = writable<Theme>(getInitialTheme());

	function applyTheme(theme: Theme) {
		if (!browser) return;

		const root = document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
		localStorage.setItem('mibarrio-theme', theme);
	}

	// Apply initial theme
	if (browser) {
		applyTheme(getInitialTheme());
	}

	return {
		subscribe,
		set: (theme: Theme) => {
			applyTheme(theme);
			set(theme);
		},
		toggle: () => {
			update((current) => {
				const newTheme = current === 'light' ? 'dark' : 'light';
				applyTheme(newTheme);
				return newTheme;
			});
		}
	};
}

export const theme = createThemeStore();
