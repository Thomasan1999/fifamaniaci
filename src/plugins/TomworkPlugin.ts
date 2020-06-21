import Tomwork from '@/plugins/Tomwork';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Tomwork = Tomwork;
    }
}
