import zenscroll from 'zenscroll';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$scroll = zenscroll;
    }
}
