/**
 * Based on Vue Cookies v1.5.13
 * https://github.com/cmp-cc/vue-cookies
 *
 * Copyright 2016, cmp-cc
 * Released under the MIT license
 */

export default class VueCookies
{
    public static get(key: string): string | null
    {
        const keyEncoded = encodeURIComponent(key).replace(/[-.+*]/g, '\\$&');

        return decodeURIComponent(document.cookie.replace(new RegExp(`(?:(?:^|.*;)\\s*${keyEncoded}\\s*=\\s*([^;]*).*$)|^.*$`), '$1')) || null;
    }

    public static keys(): string[]
    {
        if (!document.cookie)
        {
            return [];
        }

        const keys: string[] = document.cookie.replace(/((?:^|\s*;)[^=]+)(?=;|$)|^\s*|\s*(?:=[^;]*)?(?:\1|$)/g, '').split(/\s*(?:=[^;]*)?;\s*/);

        for (let index: number = 0; index < keys.length; index += 1)
        {
            keys[index] = decodeURIComponent(keys[index]);
        }

        return keys;
    }

    public static remove(key: string): boolean
    {
        if (!this.keys().includes(key))
        {
            return false;
        }

        document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        return true;
    }

    public static set(key: string, value: any): any
    {
        if (/^(?:expires|max-age|path|domain|secure)$/i.test(key))
        {
            throw new Error(`cookie key name illegality ,Cannot be set to ['expires','max-age','path','domain','secure']\t current key name: ${key}`);
        }

        document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=; max-age=31104000; path=/`;
        return value;
    }
}
