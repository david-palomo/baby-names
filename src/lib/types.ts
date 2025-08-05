export type BabyName = { id: string; name: string };
export type Swipe = { babyname_id: string; liked: boolean };
export type SwipedName = BabyName & { liked: boolean };
export type Partner = { id: string, name: string, avatar_url: string };
export type Match = { name: string };
