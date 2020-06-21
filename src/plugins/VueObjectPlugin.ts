import VueObject from '@/plugins/VueObject';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Object = VueObject;
    }
}
