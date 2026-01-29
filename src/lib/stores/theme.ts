// Theme store - Always dark mode
import { writable } from 'svelte/store';

export type Theme = 'dark';

export const theme = writable<Theme>('dark');
