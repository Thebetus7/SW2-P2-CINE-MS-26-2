import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import '../css/app.css';

createInertiaApp({
    title: (title) => `${title} — Cine Center Media Hub`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
        const path = `./Pages/${name}.vue`;
        if (!pages[path]) {
            throw new Error(`Página no encontrada en Inertia: ${path}`);
        }
        return pages[path];
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
});
