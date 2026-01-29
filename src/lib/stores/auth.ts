// Auth store for mibarrio - Uses shared Supabase with appyuda
import { writable, derived, type Readable } from 'svelte/store';
import { supabase } from '$lib/supabase';

// User profile type (matches appyuda's profiles table)
export interface UserProfile {
	id: string;
	email: string;
	full_name: string;
	avatar_url?: string | null;
	phone?: string | null;
	role: 'helper' | 'seeker' | 'both';
	is_verified: boolean;
	is_active: boolean;
	is_admin: boolean;
	is_mibarrio_provider: boolean;
	created_at: string;
}

// Mibarrio provider info
export interface MibarrioProvider {
	id: string;
	user_id: string;
	business_name: string;
	business_type: 'individual' | 'business';
	department: string;
	is_active: boolean;
	is_verified: boolean;
}

interface AuthState {
	user: UserProfile | null;
	provider: MibarrioProvider | null;
	loading: boolean;
	initialized: boolean;
}

const USER_CACHE_KEY = 'mibarrio_user_cache';

function getStorageCache(): { user: UserProfile; provider: MibarrioProvider | null } | null {
	if (typeof window === 'undefined') return null;
	try {
		const cached = localStorage.getItem(USER_CACHE_KEY);
		return cached ? JSON.parse(cached) : null;
	} catch {
		return null;
	}
}

function setStorageCache(user: UserProfile | null, provider: MibarrioProvider | null) {
	if (typeof window === 'undefined') return;
	try {
		if (user) {
			localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, provider }));
		} else {
			localStorage.removeItem(USER_CACHE_KEY);
		}
	} catch {
		// Ignore storage errors
	}
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		provider: null,
		loading: true,
		initialized: false
	});

	let initialLoadComplete = false;

	async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
		const { data, error } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (error || !data) return null;
		return data as UserProfile;
	}

	async function fetchMibarrioProvider(userId: string): Promise<MibarrioProvider | null> {
		const { data, error } = await supabase
			.from('mb_providers')
			.select('id, user_id, business_name, business_type, department, is_active, is_verified')
			.eq('user_id', userId)
			.maybeSingle();

		if (error || !data) return null;
		return data as MibarrioProvider;
	}

	async function initialize() {
		if (initialLoadComplete) return;

		// Load cached data for faster UI
		const cached = getStorageCache();
		if (cached) {
			update((s) => ({ ...s, user: cached.user, provider: cached.provider, loading: true }));
		}

		// Set up auth state listener
		supabase.auth.onAuthStateChange(async (event, session) => {
			if (!initialLoadComplete) return;

			if (session?.user) {
				const profile = await fetchUserProfile(session.user.id);
				const provider = profile ? await fetchMibarrioProvider(session.user.id) : null;
				set({
					user: profile,
					provider,
					loading: false,
					initialized: true
				});
				setStorageCache(profile, provider);
			} else {
				set({
					user: null,
					provider: null,
					loading: false,
					initialized: true
				});
				setStorageCache(null, null);
			}
		});

		// Initial session check
		const {
			data: { session }
		} = await supabase.auth.getSession();

		initialLoadComplete = true;

		if (session?.user) {
			const profile = await fetchUserProfile(session.user.id);
			const provider = profile ? await fetchMibarrioProvider(session.user.id) : null;
			set({
				user: profile,
				provider,
				loading: false,
				initialized: true
			});
			setStorageCache(profile, provider);
		} else {
			set({
				user: null,
				provider: null,
				loading: false,
				initialized: true
			});
		}
	}

	async function login(
		email: string,
		password: string
	): Promise<{ success: boolean; error: string | null }> {
		update((s) => ({ ...s, loading: true }));

		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) {
			update((s) => ({ ...s, loading: false }));
			return { success: false, error: translateError(error.message) };
		}

		if (data.user) {
			const profile = await fetchUserProfile(data.user.id);
			const provider = profile ? await fetchMibarrioProvider(data.user.id) : null;
			set({
				user: profile,
				provider,
				loading: false,
				initialized: true
			});
			setStorageCache(profile, provider);
		}

		return { success: true, error: null };
	}

	async function register(
		email: string,
		password: string,
		fullName: string
	): Promise<{ success: boolean; error: string | null; emailConfirmationRequired: boolean }> {
		update((s) => ({ ...s, loading: true }));

		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName
				}
			}
		});

		if (error) {
			update((s) => ({ ...s, loading: false }));
			return { success: false, error: translateError(error.message), emailConfirmationRequired: false };
		}

		// Check if email confirmation is required
		if (data.user && !data.session) {
			update((s) => ({ ...s, loading: false }));
			return { success: true, error: null, emailConfirmationRequired: true };
		}

		// If auto-confirmed, fetch profile (trigger creates it)
		if (data.user && data.session) {
			// Profile is created by handle_new_user trigger in Supabase
			// Just fetch it and set the state
			const profile = await fetchUserProfile(data.user.id);
			set({
				user: profile,
				provider: null,
				loading: false,
				initialized: true
			});
			setStorageCache(profile, null);
		}

		return { success: true, error: null, emailConfirmationRequired: false };
	}

	async function logout() {
		update((s) => ({ ...s, loading: true }));
		await supabase.auth.signOut();
		set({
			user: null,
			provider: null,
			loading: false,
			initialized: true
		});
		setStorageCache(null, null);
	}

	async function refreshProvider() {
		let currentState: AuthState | undefined;
		const unsub = subscribe((s) => {
			currentState = s;
		});
		unsub();

		if (currentState?.user) {
			const provider = await fetchMibarrioProvider(currentState.user.id);
			update((s) => ({ ...s, provider }));
			setStorageCache(currentState.user, provider);
		}
	}

	return {
		subscribe,
		initialize,
		login,
		register,
		logout,
		refreshProvider
	};
}

function translateError(message: string): string {
	const errors: Record<string, string> = {
		'Invalid login credentials': 'Email o contraseña incorrectos',
		'Email not confirmed': 'Por favor confirmá tu email antes de ingresar',
		'User already registered': 'Este email ya está registrado',
		'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres'
	};
	return errors[message] || message;
}

export const auth = createAuthStore();

// Derived stores
export const user: Readable<UserProfile | null> = derived(auth, ($auth) => $auth.user);
export const provider: Readable<MibarrioProvider | null> = derived(auth, ($auth) => $auth.provider);
export const isAuthenticated: Readable<boolean> = derived(auth, ($auth) => $auth.user !== null);
export const isLoading: Readable<boolean> = derived(auth, ($auth) => $auth.loading);
export const isInitialized: Readable<boolean> = derived(auth, ($auth) => $auth.initialized);
export const hasMibarrioProvider: Readable<boolean> = derived(auth, ($auth) => $auth.provider !== null);
