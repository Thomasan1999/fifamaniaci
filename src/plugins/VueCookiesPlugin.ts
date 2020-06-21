import VueCookies from '@/plugins/VueCookies';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$cookies = VueCookies;
    }
}
