import { browser } from '$app/environment';

const ACTIVITY_STORAGE_KEY = 'mibarrio_user_activity';
const MAX_RECENT_SEARCHES = 10;
const MAX_RECENTLY_VIEWED = 10;
const SCHEMA_VERSION = 1;

// Types
export interface RecentSearch {
	id: string;
	query: string;
	filters: {
		departamento?: string;
		barrio?: string;
		categoria?: string;
		tipo?: 'service' | 'business';
	};
	timestamp: string;
	resultCount?: number;
}

export interface RecentlyViewedProvider {
	id: string;
	name: string;
	category: string;
	department: string;
	logoUrl?: string;
	viewedAt: string;
}

export interface CategoryViewCount {
	category: string;
	count: number;
	lastViewed: string;
}

export interface UserActivityData {
	version: number;
	recentSearches: RecentSearch[];
	recentlyViewed: RecentlyViewedProvider[];
	categoryViews: CategoryViewCount[];
	lastUpdated: string;
}

// Internal state
let activityData: UserActivityData = getDefaultActivityData();
let subscribers: Set<(data: UserActivityData) => void> = new Set();

function getDefaultActivityData(): UserActivityData {
	return {
		version: SCHEMA_VERSION,
		recentSearches: [],
		recentlyViewed: [],
		categoryViews: [],
		lastUpdated: new Date().toISOString()
	};
}

function notifySubscribers() {
	subscribers.forEach((callback) => callback(activityData));
}

// SSR-safe localStorage access
function loadFromStorage(): UserActivityData {
	if (!browser) return getDefaultActivityData();
	try {
		const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			if (parsed.version === SCHEMA_VERSION) {
				return parsed;
			}
		}
	} catch {
		// Ignore parse errors
	}
	return getDefaultActivityData();
}

function saveToStorage(data: UserActivityData): void {
	if (!browser) return;
	try {
		data.lastUpdated = new Date().toISOString();
		localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(data));
	} catch {
		// Ignore storage errors (quota exceeded, etc.)
	}
}

// Public API
export function initializeActivity(): void {
	if (browser) {
		activityData = loadFromStorage();
		notifySubscribers();
	}
}

export function addRecentSearch(search: Omit<RecentSearch, 'id' | 'timestamp'>): void {
	// Skip empty searches with no filters
	const hasFilters =
		search.query ||
		search.filters.departamento ||
		search.filters.barrio ||
		search.filters.categoria ||
		search.filters.tipo;

	if (!hasFilters) return;

	const newSearch: RecentSearch = {
		id: crypto.randomUUID(),
		...search,
		timestamp: new Date().toISOString()
	};

	// Check for duplicate searches (same filters)
	const isDuplicate = (a: RecentSearch, b: RecentSearch) =>
		a.query === b.query &&
		a.filters.departamento === b.filters.departamento &&
		a.filters.barrio === b.filters.barrio &&
		a.filters.categoria === b.filters.categoria &&
		a.filters.tipo === b.filters.tipo;

	activityData.recentSearches = [
		newSearch,
		...activityData.recentSearches.filter((s) => !isDuplicate(s, newSearch))
	].slice(0, MAX_RECENT_SEARCHES);

	// Update category count if searching by category
	if (search.filters.categoria) {
		updateCategoryCount(search.filters.categoria);
	}

	saveToStorage(activityData);
	notifySubscribers();
}

export function addRecentlyViewed(
	provider: Omit<RecentlyViewedProvider, 'viewedAt'>
): void {
	const newView: RecentlyViewedProvider = {
		...provider,
		viewedAt: new Date().toISOString()
	};

	// Remove if already exists (will be re-added at top)
	activityData.recentlyViewed = [
		newView,
		...activityData.recentlyViewed.filter((p) => p.id !== provider.id)
	].slice(0, MAX_RECENTLY_VIEWED);

	// Update category view count
	if (provider.category) {
		updateCategoryCount(provider.category);
	}

	saveToStorage(activityData);
	notifySubscribers();
}

function updateCategoryCount(category: string): void {
	const existing = activityData.categoryViews.find((c) => c.category === category);
	if (existing) {
		existing.count++;
		existing.lastViewed = new Date().toISOString();
	} else {
		activityData.categoryViews.push({
			category,
			count: 1,
			lastViewed: new Date().toISOString()
		});
	}
}

// Get recommended categories based on user activity
export function getRecommendedCategories(limit = 5): string[] {
	const categoryScores = new Map<string, number>();

	// Weight category views
	activityData.categoryViews.forEach((cv) => {
		const daysSinceView = Math.floor(
			(Date.now() - new Date(cv.lastViewed).getTime()) / (1000 * 60 * 60 * 24)
		);
		// Decay factor: recent views worth more
		const recencyMultiplier = Math.max(0.1, 1 - daysSinceView * 0.1);
		categoryScores.set(cv.category, cv.count * recencyMultiplier);
	});

	return [...categoryScores.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([category]) => category);
}

export function clearActivity(): void {
	activityData = getDefaultActivityData();
	if (browser) {
		localStorage.removeItem(ACTIVITY_STORAGE_KEY);
	}
	notifySubscribers();
}

export function clearRecentSearches(): void {
	activityData.recentSearches = [];
	saveToStorage(activityData);
	notifySubscribers();
}

export function clearRecentlyViewed(): void {
	activityData.recentlyViewed = [];
	saveToStorage(activityData);
	notifySubscribers();
}

// Svelte store-like subscribe function
export function subscribeToActivity(callback: (data: UserActivityData) => void): () => void {
	subscribers.add(callback);
	callback(activityData); // Immediate callback with current value
	return () => subscribers.delete(callback);
}

// Getters for current state (useful for derived values)
export function getRecentSearches(): RecentSearch[] {
	return activityData.recentSearches;
}

export function getRecentlyViewed(): RecentlyViewedProvider[] {
	return activityData.recentlyViewed;
}

export function hasActivity(): boolean {
	return activityData.recentSearches.length > 0 || activityData.recentlyViewed.length > 0;
}
