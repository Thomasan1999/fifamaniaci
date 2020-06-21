import VueHttp from '@/plugins/VueHttp';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$http = VueHttp;
    }
}
