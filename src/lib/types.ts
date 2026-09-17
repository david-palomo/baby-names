/** `babynames.id` is a bigint in Postgres, so it arrives as a number. */
export type BabyName = { id: number; name: string };

/** Optional columns added by supabase/migrations/0001_name_metadata.sql. */
export type NameMetadata = {
	gender?: string | null;
	origin?: string | null;
	meaning?: string | null;
};

export type BabyNameInfo = BabyName & NameMetadata;
export type Swipe = { babyname_id: number; liked: boolean };
export type SwipedName = BabyName & { liked: boolean };
export type Partner = { id: string; name: string; avatar_url: string | null };
export type Match = { name: string };
