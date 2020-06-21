export type VueHttpResponse = {body: {[s: string]: any}, headers: Headers, ok: boolean, status: number};

export default class VueHttp
{
    public static _paramsGet(data): string
    {
        const paramsObj = Object.entries(data || {}).reduce((a, [paramKey, paramValue]) =>
        {
            if (typeof paramValue === `object` && paramValue !== null)
            {
                Object.entries(paramValue).forEach(([paramValueKey, paramValueValue]) =>
                {
                    a[`${paramKey}[${paramValueKey}]`] = paramValueValue;
                });

                return a;
            }

            a[paramKey] = paramValue;
            return a;
        }, {});

        return new URLSearchParams(paramsObj).toString();
    }

    public static async _request(method: 'DELETE' | 'GET' | 'POST' | 'PATCH', url: string, data: {auth?: {id: number, token: string}}): Promise<VueHttpResponse>
    {
        return fetch(
            url,
            {
                method,
                headers: {
                    'Accept': `application/json`,
                    'Content-Type': `application/json`
                },
                ...(![`GET`, `DELETE`].includes(method) && {body: JSON.stringify(data)})
            }
        ).then(async (res) =>
        {
            const {headers, ok, status} = res;

            const output = {body: status === 204 ? null : await res.json(), headers, ok, status};

            if (status >= 400)
            {
                console.error(res);
                return Promise.reject(output);
            }

            return Promise.resolve(output);
        });
    }

    public static async delete(url: string, data: object): Promise<VueHttpResponse>
    {
        const params = this._paramsGet(data);

        return this._request(`DELETE`, `${url}${params ? `?${params}` : ``}`, data);
    }

    public static async get(url: string, data: object): Promise<VueHttpResponse>
    {
        const params = this._paramsGet(data);

        return this._request(`GET`, `${url}${params ? `?${params}` : ``}`, data);
    }

    public static async patch(url: string, data: object): Promise<VueHttpResponse>
    {
        return this._request(`PATCH`, url, data);
    }

    public static async post(url: string, data: object): Promise<VueHttpResponse>
    {
        return this._request(`POST`, url, data);
    }
}
