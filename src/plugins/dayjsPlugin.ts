import dayjs from 'dayjs';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$dayjs = dayjs;
    }
}
