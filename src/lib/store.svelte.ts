import type { User } from "$lib/supabase";

export const defaultPath = '/swiping';
export const store = $state({
    user: null as User | null,
    previousPath: defaultPath,
    transitionDirection: 1
});
