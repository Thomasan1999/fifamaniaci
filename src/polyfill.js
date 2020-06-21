if (!Object.fromEntries)
{
    Object.fromEntries = (iterable) =>
    {
        return [...iterable].reduce((a, [key, value]) =>
        {
            a[key] = value;
            return a;
        }, {});
    };
}
