import VueString from '@/plugins/VueString';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$String = VueString;
    }
}
