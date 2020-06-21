import Vue        from 'vue';
import Router     from 'vue-router';
import store      from '@/store';
import VueString  from '@/plugins/VueString';
import VueCookies from '@/plugins/VueCookies';

Vue.use(Router);

const router: Router = new Router({
    mode: `history`,
    base: process.env.BASE_URL,
    routes: []
});

const {state} = store;

router.beforeEach(async (to, from, next) =>
{
    if (to.meta.sectionName !== state.sections.active)
    {
        store.dispatch(`sectionsActiveSet`, to.meta.sectionName).catch((err) =>
        {
            console.error(err);
        });
    }

    const toSection: SectionValue = state.sections.value[to.meta.sectionName] || {};

    if (typeof toSection.loggedIn !== `undefined` && state.userLogged.loggedIn !== toSection.loggedIn)
    {
        const sectionsDefault: string = state.sections.default;
        const tabsTable = state[`${sectionsDefault}Tabs`];
        const tabsDefault: string = tabsTable?.default ? VueCookies.get(`${sectionsDefault}Active`) || tabsTable.default : ``;

        next({
            name: `${state.sections.default}${new VueString(tabsDefault).capitalize()}`
        });

        return;
    }

    next();
});

router.afterEach(() =>
{
    store.dispatch(`titleUpdate`).catch((err) =>
    {
        console.error(err);
    });
});

export default router;
