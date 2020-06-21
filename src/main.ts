import Vue                              from 'vue';
import {library}                        from '@fortawesome/fontawesome-svg-core';
import {faExclamationTriangle, faUsers} from '@fortawesome/free-solid-svg-icons';
import {faPlaystation, faXbox}          from '@fortawesome/free-brands-svg-icons';
import {FontAwesomeIcon}                from '@fortawesome/vue-fontawesome';
import dayjs                            from '@/plugins/dayjsPlugin';
import LoadingContainer                 from '@/components/loading/LoadingContainer.vue';
import NumericRange                     from '@/plugins/NumericRangePlugin';
import Tomwork                          from '@/plugins/TomworkPlugin';
import VueCookies                       from '@/plugins/VueCookiesPlugin';
import VueDate                          from '@/plugins/VueDatePlugin';
import VueNumber                        from '@/plugins/VueNumberPlugin';
import VueObject                        from '@/plugins/VueObjectPlugin';
import VueString                        from '@/plugins/VueStringPlugin';
import App                              from '@/App.vue';
import mainMixin                        from '@/mixins/Main';
import router                           from '@/router';
import store                            from '@/store';
import '@/registerServiceWorker';
import zenscroll                        from '@/plugins/zenscrollPlugin';

require(`./polyfill.js`);
Vue.use(VueCookies);
Vue.use(dayjs);
Vue.use(NumericRange);
Vue.use(Tomwork);
Vue.use(VueDate);
Vue.use(VueNumber);
Vue.use(VueObject);
Vue.use(VueString);
Vue.use(zenscroll);

library.add(faExclamationTriangle, faPlaystation, faXbox, faUsers);

Vue.component(`font-awesome-icon`, FontAwesomeIcon);
Vue.component(`loading-container`, LoadingContainer);

Vue.config.productionTip = false;

Vue.mixin(mainMixin);

new Vue({
    el: `#app`,
    router,
    store,
    render: (e) =>
    {
        return e(App);
    }
});
