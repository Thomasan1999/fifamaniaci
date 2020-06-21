import VueDate from '@/plugins/VueDate';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Date = VueDate;
    }
}
