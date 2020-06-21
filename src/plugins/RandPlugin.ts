import Rand from '@/plugins/Rand';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Rand = Rand;
    }
}
