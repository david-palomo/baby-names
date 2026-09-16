import type { SwipedName } from '$lib/types';

/**
 * Keeps the first row per babyname id.
 *
 * Until supabase/migrations/0002_v_swipes_current_user.sql is applied,
 * `v_swipes` returns every swipe RLS lets you read — which includes a
 * partner's — so the same babyname id can appear more than once. Keyed lists
 * need unique ids, and a duplicate key silently breaks the list's updates.
 */
export function dedupeById(rows: SwipedName[] | null): SwipedName[] {
	const seen = new Set<number>();
	return (rows ?? []).filter((row) => !seen.has(row.id) && seen.add(row.id));
}
