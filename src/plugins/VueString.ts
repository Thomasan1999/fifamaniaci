import NumericRange from 'numeric-range';
import router       from '@/router';
import store        from '@/store';
import VueDate      from '@/plugins/VueDate';
import VueNumber    from '@/plugins/VueNumber';

export default class VueString extends String
{
    constructor(val: any = ``)
    {
        super(val);
    }

    public capitalize(): VueString
    {
        return this.toString() ? new VueString(`${this[0].toUpperCase()}${this.slice(1)}`) : this;
    }

    public caseCamelSplit(): VueString[]
    {
        return this.toString() ? this.split(/(?=[A-Z])/).map((word) =>
        {
            return new VueString(word);
        }) : [];
    }

    public caseCamelTo(): VueString
    {
        return this.toString() ? new VueString(this.replace(/([_|-]\w)/g, (word) =>
        {
            return word[1].toUpperCase();
        })) : this;
    }

    public caseTrainTo(): VueString
    {
        return this.toString() ? new VueString(`${this[0].toLowerCase()}${this.slice(1).replace(/([A-Z][a-z])|([a-z][A-Z]$)/g, (match) =>
        {
            if (match[0].toLowerCase() === match[0])
            {
                return `${match[0]}-${match[1].toLowerCase()}`;
            }

            return `-${match[0].toLowerCase()}${match[1] || ``}`;
        })}`.toLowerCase().replace(/ /g, `-`).replace(/--/g, `-`)) : this;
    }

    public decapitalize(): VueString
    {
        return this.toString() ? new VueString(`${this[0].toLowerCase()}${this.slice(1)}`) : this;
    }

    public diacriticsRemove(): VueString
    {
        return new VueString(this.normalize(`NFD`).replace(/[\u0300-\u036f]/g, ''));
    }

    public htmlParse(variables: { [s: string]: any } = {}): VueString
    {
        const replaceMap: { [s: string]: string } = {
            [`<b>`]: `<strong>`,
            [`</b>`]: `</strong>`,
            [`\n`]: `<br>`
        };

        return new VueString(this.replace(/\${[^}]*}/g, (expressionRaw) =>
        {
            const variableName: string = expressionRaw.replace(/^\${/, ``).replace(/}$/, ``).replace(/env\.([A-Z]|_)+/, (variable) =>
            {
                return process.env[`VUE_APP_FM_${variable.split(`.`)[1]}`] || ``;
            }).replace(/(state|getters)\.([a-zA-Z]|_|\.)+/, (expressionRaw2) =>
            {
                return expressionRaw2.split(`.`).reduce((a, variableProp) =>
                {
                    return a[variableProp];
                }, store).toString();
            });

            const [variableType]: RegExpMatchArray = variableName.match(/^\w+(?=\|)/) || [];

            const result: string = (() =>
            {
                switch (variableType)
                {
                    case `currency`:
                    {
                        const [, variableOtherName]: string[] = variableName.split(`|`);

                        return new VueNumber(typeof variables[variableOtherName] === `undefined` ? variableOtherName : variables[variableOtherName]).currencyFormat;
                    }
                    case `date`:
                    {
                        const [, format, date]: string[] = variableName.split(`|`);

                        const dateExpr: string = variables[date] || date;

                        return Number.isNaN(Date.parse(dateExpr)) ? `` : new VueDate(dateExpr).format(format);
                    }
                    case `dictionary`:
                    {
                        const [, wordKey, type, variableOtherName]: string[] = variableName.split(`|`);
                        const word: {
                            [k in 'n' | 'g' | 'd' | 'a' | 'l' | 'i']: {
                                sg: string,
                                pl: string
                            }
                        } = store.getters.texts.dictionary[wordKey];

                        switch (type)
                        {
                            case `number`:
                            {
                                const pluralIf: string = new NumericRange(2, 4).includes(variables[variableOtherName]) ? word.a.pl : word.g.pl;
                                return variables[variableOtherName] === 1 ? word.a.sg : pluralIf;
                            }
                            default:
                                return;
                        }
                    }
                    case `href`:
                    {
                        const [, type, route, localization, flags]: string[] = variableName.split(`|`);

                        const prefix: string = (() =>
                        {
                            switch (type)
                            {
                                case `mail`:
                                    return `mailto:`;
                                case `tel`:
                                    return `tel:`;
                                default:
                                    return ``;
                            }
                        })();

                        const href: string = (() =>
                        {
                            if (type === `internal` && route)
                            {
                                return `/${router.currentRoute.params.category}/${new VueString(store.state.locales.value[store.state.lang][route].title).urlTo()}`;
                            }

                            return route;
                        })();

                        const target = type === `external` || flags?.split(`,`).includes(`_blank`) ? `target="_blank"` : ``;
                        return `<a href="${prefix}${href}" rel="noopener noreferrer" ${target}>${localization || route}</a>`;
                    }
                    case `number`:
                    {
                        const [, value]: string[] = variableName.split(`|`);

                        return new Intl.NumberFormat(`sk-SK`).format(Number(value));
                    }
                    default:
                    {
                        const variable: any = variables[variableName];

                        if (typeof variable === `number`)
                        {
                            return new Intl.NumberFormat(`sk-SK`).format(variable);
                        }

                        return variable;
                    }
                }
            })();

            if (typeof result === `undefined` && `\${${variableName}}` === expressionRaw)
            {
                return expressionRaw;
            }

            return result || variableName;
        })).replaceArray(Object.keys(replaceMap), Object.values(replaceMap));
    }

    public replaceArray(find: string[] = [], replace: string[] = []): VueString
    {
        return new VueString(find.reduce((a, findString, index) =>
        {
            return a.replace(new RegExp(findString, `g`), replace[index]);
        }, this.toString()));
    }

    public urlTo(): string
    {
        return this.diacriticsRemove().caseTrainTo().decapitalize().toString();
    }
}
