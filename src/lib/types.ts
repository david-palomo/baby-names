export type BabyName = { id: string; name: string };
export type Swipe = { babyname_id: string; liked: boolean };
export type SwipedName = BabyName & { liked: boolean };
