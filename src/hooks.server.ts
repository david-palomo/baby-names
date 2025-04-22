import type { Handle } from '@sveltejs/kit';

export const handle: Handle = (async ({ event, resolve }) => {
    const theme = event.cookies.get('preferredColorScheme');

    return resolve(event, {
        transformPageChunk: ({ html }) => html.replace('data-theme', theme ? `data-theme="${theme}"` : '')
    });
});
