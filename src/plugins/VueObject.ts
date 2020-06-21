export default class VueObject
{
    public value: any;

    constructor(object: any = {})
    {
        this.value = object;
    }

    public findNested(nestedValues: any[]): any
    {
        return nestedValues.reduce((a, nestedValue) =>
        {
            return a?.[nestedValue];
        }, this.value);
    }

    public map(callback: ([key, value]: [string, any], ...rest) => any): VueObject
    {
        return new VueObject(Object.entries(this.value).reduce((a, [key, value], ...args) =>
        {
            a[key] = callback([key, value], ...args);
            return a;
        }, {}));
    }

    public unwrap(): any
    {
        return this.value[Object.keys(this.value)[0]];
    }
}
