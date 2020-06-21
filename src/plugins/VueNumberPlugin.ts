import VueNumber from '@/plugins/VueNumber';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Number = VueNumber;
    }
}
