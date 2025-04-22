import type { User } from "$lib/supabase";

export const store = $state({
    user: null as User | null,
});
