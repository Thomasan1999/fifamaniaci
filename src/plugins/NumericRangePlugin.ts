import NumericRange from 'numeric-range';

export default class
{
    public static install(Vue)
    {
        Vue.prototype.$Range = NumericRange;
    }
}
