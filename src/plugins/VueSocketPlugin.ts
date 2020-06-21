import VueSocket from '@/plugins/VueSocket';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$socket = new VueSocket();
    }
}
