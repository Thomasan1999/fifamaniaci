import {mixins}          from 'vue-class-component';
import {Component}       from 'vue-property-decorator';
import MainMixin         from '@/mixins/Main';

@Component({
    name: `FormMixin`
})
export default class FormMixin extends mixins(MainMixin)
{
    public alertShowSuccessful(): void
    {
        this.alertShow({alertType: `successful`, state: `successful`, targetType: this.$options.name});
    }

    public alertTypeGet({element}: { element: FormElement }): string
    {
        return this.alertTypesActive.find((alertType) =>
        {
            return this.alertTypes[alertType](element);
        }) || ``;
    }

    public blurOn({element}: { element: FormElement }): void
    {
        element.inputting = false;
        element.alertType = this.alertTypeGet({element});
        this.errorShowUpdate({element});
    }

    public computedPropertiesUpdate({element}: { element: FormElement }): void
    {
        this.formDataUpdate({element});
        element.validLength = this.lengthValidityGet({element});
        element.valid = this.validityGet({element});
        element.alertType = this.alertTypeGet({element});
        this.errorShowUpdate({element});
    }

    public errorShowUpdate({element}: { element: FormElement }): void
    {
        element.errorShow = (element.required || !element.emptyIs()) && !element.valid && !element.inputting && !element.checking;
    }

    public formDataUpdate({element}: { element: FormElement }): void
    {
        if (!element.sendable || element.tag === `span`)
        {
            return;
        }

        if ((element.emptyIs() && !element.required) || (element.reference && element.valueDefault === element.value))
        {
            delete this.formData[element.name];
            return;
        }

        const value: any = (() =>
        {
            switch (element.type)
            {
                case `id`:
                case `idUsername`:
                    return element.id || null;
                case `date`:
                    return element.value || this.$dayjs().format();
                case `float`:
                    return parseFloat(element.value) || element.min;
                case `integer`:
                    return parseInt(element.value) || element.min;
                case `boolean`:
                    return element.value;
                default:
                    return element.value === `\u2002` ? null : (element.value || null);
            }
        })();

        this.$set(this.formData, element.name, value);
    }

    public async formSubmit({alertSuccessful = true, categoryInclude = false, auth = false, tableName = this.tableName, url = this.url}: {
        alertSuccessful?: boolean,
        auth?: boolean,
        categoryInclude?: boolean,
        tableName?: string,
        url?: string
    } = {})
    {
        this.validate();

        if (!this.valid)
        {
            this.invalidOn();
            return;
        }

        if (alertSuccessful)
        {
            this.alertShowSuccessful();
        }

        Object.values(this.elements).forEach((element) =>
        {
            this.propertiesUpdate({
                element,
                props: {
                    ...(element.reference ? {valueDefault: element.value} : {value: element.tag === `span` ? element.value : ``})
                }
            });
        });

        // eslint-disable-next-line no-unused-expressions
        this.responseOn?.({body: {}, headers: {}, ok: true, status: 400});

        return {body: {}, headers: {}, ok: true, status: 400};
    }

    public idGet({elementName}: { elementName: string }): string
    {
        return `${new this.$String(this.$options.name as string).caseTrainTo()}-${new this.$String(elementName).caseTrainTo()}${typeof this.id !== `undefined` ? `-${this.id}`
            : ``}`;
    }

    public invalidOn(): void
    {
        this.alertShow({alertType: `invalid`, state: `failed`});
    }

    public lengthValidityGet({element: {length, value}}: { element: FormElement }): boolean
    {
        return new this.$Range(length.min, length.max).includes(value.toString().length);
    }

    public propertiesUpdate({element, inputting = true, props}: { element: FormElement, inputting?: boolean, props: { [s: string]: any } }): void
    {
        Object.entries(props).forEach(([prop, value]) =>
        {
            element.inputting = inputting;
            element[prop] = value;
            this.computedPropertiesUpdate({element});
        });
    }

    public responseOn(res: { headers: {}; body: {}; ok: boolean; status: number }): void
    {
    }

    public submitOn(): void
    {
        this.formSubmit({auth: Boolean(this.auth), categoryInclude: Boolean(this.categoryInclude)}).catch(console.error);
    }

    public urlFullGet({tableName = this.tableName, url = this.url}: {
        tableName?: string,
        url?: string
    } = {}): string
    {
        return `https://api.${this.hostname}/${tableName}${url ? `/${url}` : ``}`;
    }

    // eslint-disable-next-line no-empty-pattern
    public validityGet({}: { element: FormElement }): boolean
    {
        return true;
    }

    public validate(): void
    {
        Object.values(this.elements).forEach((element) =>
        {
            element.inputting = false;
            this.computedPropertiesUpdate({element});
        });
    }

    public alertTypes: { [s: string]: (element: FormElement) => boolean } = {
        empty(element)
        {
            return element.required && element.emptyIs();
        },
        invalid({validateRegex, value})
        {
            return !validateRegex.test(value);
        },
        long({length, value})
        {
            return value.length > length.max;
        },
        notFound({taken})
        {
            return !taken;
        },
        short(element)
        {
            return !(!element.required && element.emptyIs()) && element.value.length < element.length.min;
        },
        taken({taken, type, valueDefault, value})
        {
            return taken && type !== `password` && value !== valueDefault;
        }
    };

    public alertTypesActive: string[] = [`short`, `long`, `invalid`, `empty`];
    public auth!: boolean;
    public categoryInclude!: boolean;
    public elements: { [s: string]: FormElement } = {};
    public elementsExtra: { [s: string]: FormElement } = {};
    public formData: { [s: string]: any } = {};
    public id!: string | number;
    public method: 'post' | 'get' | 'patch' | 'delete' = `post`;
    public tableName!: string;
    public url!: string;

    public get elementsAll()
    {
        return {...this.elements, ...this.elementsExtra};
    }

    public get valid(): boolean
    {
        return !Object.entries(this.elementsAll).filter(([, element]) =>
        {
            return element.required;
        }).some(([elementName, element]) =>
        {
            return !element.valid && elementName !== `password`;
        });
    }

    public elementsCreate(elements: { [s: string]: Partial<FormElement> }): { [s: string]: FormElement }
    {
        const defaults = {
            alertType: ``,
            autocomplete: {
                default: `off`,
                email: `email`,
                password: `password`
            },
            checking: false,
            emptyIs()
            {
                // @ts-ignore
                return this.value === `` || this.value === `\u2002`;
            },
            errorShow: false,
            input: {
                boolean: `checkbox`,
                default: `text`,
                email: `email`,
                float: `number`,
                integer: `number`,
                password: `password`
            },
            inputting: false,
            length: {
                default: {min: 0, max: 128},
                email: {min: 0, max: 64},
                fbLink: {min: 25, max: 256},
                message: {min: 0, max: 1024},
                password: {min: 6, max: 64},
                username: {min: 0, max: 32},
                usernamesInGamePs: {min: 3, max: 16},
                usernamesInGamePc: {min: 4, max: 16},
                usernamesInGameXbox: {min: 3, max: 16}
            },
            prefix: {
                default: ``,
                fbLink: `https://facebook.com/`
            },
            required: true,
            sendable: true,
            tag: `input`,
            taken: {
                default: false,
                password: true
            },
            type: `any`,
            valid: `\${!element.required}`,
            validLength: true,
            validateRegex: {
                id: /^([-]?\d|NaN)+$/,
                idUsername: /^([-]?\d|NaN)+$/,
                alphabetical: /^([a-z]| )+$/i,
                alphabeticalExtended: /^([\u0041-\u005a]|[\u00c0-\u024f]| )+$/i,
                alphanumerical: /^(\w+| )$/i,
                alphanumericalExtended: /^(\d|[\u0041-\u005a]|[\u00c0-\u024f]| )+$/i,
                any: /^(.*)$/,
                boolean: /^(true|false)$/,
                default: /^(.*)$/,
                email: /^(([^<>()\\.,;:\s@"]+(\.[^<>()\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                fbLink: /^((http|https):\/\/)(www\.)?(facebook\.com)(\/)?([^\W_]|\.){5,}$/,
                float: /^([-]?\d[.\d+]?|NaN)+$/,
                hexadecimal: /[0-9a-f]+/i,
                integer: /^([-]?\d|NaN)+$/,
                username: /^(\d|[\u0041-\u005a]|[\u00c0-\u024f]| |_|-)+$/i,
                usernamesInGamePc: /^(\w|-|_)+$/i,
                usernamesInGamePs: /^(\w|-|_)+$/i,
                usernamesInGameXbox: /^(.*)+$/i
            },
            value: {
                boolean: false,
                default: ``
            },
            visibility: true
        };

        Object.entries(elements).forEach(([elementName, element]) =>
        {
            this.$set(element, `name`, elementName);

            Object.entries(defaults).filter(([prop, defaultValue]) =>
            {
                // @ts-ignore
                return !/^\${(.*)}$/.test(defaultValue) && typeof element[prop] === `undefined`;
            }).forEach(([prop, defaultValue]) =>
            {
                if (typeof defaultValue === `object`)
                {
                    this.$set(element, prop, Object.keys(defaultValue).includes(element.type as string) ? defaultValue[element.type as string] : defaultValue.default);
                    return;
                }

                this.$set(element, prop, defaultValue);
            });

            this.formDataUpdate({element: element as FormElement});

            Object.entries(defaults).filter(([, defaultValue]) =>
            {
                // @ts-ignore
                return /^\${(.*)}$/.test(defaultValue);
            }).forEach(([prop, defaultValue]) =>
            {
                const valueNew = (() =>
                {
                    if (prop === `valid`)
                    {
                        return element.required ? this.validityGet({element: element as FormElement}) : true;
                    }

                    // eslint-disable-next-line no-eval
                    return eval((defaultValue as string).replace(`\${`, ``).match(/(.*)(?=})/)?.[0] || ``);
                })();

                this.$set(element, prop, valueNew);
            });
        });

        return elements as { [s: string]: FormElement };
    }
}
