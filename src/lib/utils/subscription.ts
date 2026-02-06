import type { Subscription } from '$lib/domain/types';

export function isPremium(subscription?: Subscription | null): boolean {
	if (!subscription) return false;
	if (subscription.status !== 'active') return false;
	if (subscription.ends_at && new Date(subscription.ends_at) < new Date()) return false;
	return true;
}

export function getSubscriptionDaysLeft(subscription?: Subscription | null): number | null {
	if (!subscription || subscription.status !== 'active' || !subscription.ends_at) return null;
	const diff = new Date(subscription.ends_at).getTime() - Date.now();
	return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
