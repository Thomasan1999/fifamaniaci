import equalIs from 'fast-deep-equal';
import dayjs   from 'dayjs';

export default class Tomwork
{
    public static clone<T>(obj: T): T
    {
        if (typeof obj !== `object` || obj === null)
        {
            return obj;
        }

        if (obj instanceof Date)
        {
            return new Date(obj.valueOf()) as unknown as T;
        }

        if (obj instanceof dayjs)
        {
            return (obj as unknown as dayjs.Dayjs).clone() as unknown as T;
        }

        if (obj instanceof RegExp)
        {
            return new RegExp(obj) as unknown as T;
        }

        const clone = obj instanceof Array ? [] : {};

        Object.keys(obj).forEach((i) =>
        {
            clone[i] = Tomwork.clone(obj[i]);
        });

        return clone as unknown as T;
    }

    public static emptyIs(val: any = {}): boolean
    {
        if (val === null)
        {
            return true;
        }

        if (val instanceof Array)
        {
            return !val.length;
        }

        return !Object.keys(val).length;
    }

    static equalIs = equalIs;
}
