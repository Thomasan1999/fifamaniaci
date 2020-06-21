import {Component} from 'vue-property-decorator';
import Vue         from 'vue';
import locales     from '../../../server/src/locales/sk';

@Component({
    name: `MainMixin`
})
export default class MainMixin extends Vue
{
    public alertHtmlGet({alertType, length, targetType, validateRegex, variables}: {
        length?: { min: number, max: number },
        alertType: string,
        targetType?: string,
        validateRegex?: RegExp,
        variables?: { [s: string]: any }
    }): string
    {
        const valueSource = this.texts.alert[validateRegex ? `field` : `form`][alertType];

        const value: string = (() =>
        {
            if (typeof valueSource === `string`)
            {
                return valueSource;
            }

            if (valueSource[`1`] && length)
            {
                const prop = alertType === `short` ? `min` : `max`;

                if (length[prop] === 1)
                {
                    return valueSource[`1`];
                }

                return new this.$Range(2, 4).includes(length[prop]) ? valueSource[`2-4`] : valueSource[`5+`];
            }

            return valueSource[targetType] || valueSource.default;
        })();

        const {dictionary, grammar} = this.texts;

        const variablesCopy = {...this.$Tomwork.clone(variables), ...this.$Tomwork.clone(length)};

        const localization = dictionary[targetType as string];

        if (localization)
        {
            grammar.cases.forEach((caseName) =>
            {
                grammar.numbers.forEach((numberName) =>
                {
                    variablesCopy[`${caseName}.${numberName}`] = localization[caseName]?.[numberName] || localization;
                });
            });
        }

        return new this.$String(value).htmlParse(variablesCopy).capitalize().toString();
    }

    public alertShow({alertType, length, state = `failed`, targetType, validateRegex, variables}: {
        alertType: string,
        length?: { min: number, max: number },
        state?: AlertState,
        targetType?: string,
        validateRegex?: RegExp,
        variables?: { [s: string]: any }
    })
    {
        this.$root.$emit(`alert-show`, {html: this.alertHtmlGet({alertType, length, targetType, validateRegex, variables}), state});
    }

    public get categoriesActive(): number
    {
        return this.$store.state.categories.active;
    }

    public get dataLoaded(): boolean
    {
        return Boolean(this.$store.state.dataLoaded.value[this.categoriesActive]);
    }

    public get fut(): boolean
    {
        return this.$store.state.categories.value[this.categoriesActive]?.name.includes(`Fut`);
    }

    public get hostname(): string
    {
        return process.env.VUE_APP_FM_HOSTNAME;
    }

    public get sectionsActive(): string
    {
        return this.$store.state.sections.active;
    }

    public get texts(): typeof locales
    {
        return this.$store.getters.texts;
    }

    public keydownOn($event: KeyboardEvent): void
    {
    }

    public created(): void
    {
        if (this.keydownOn)
        {
            window.addEventListener(`keydown`, this.keydownOn);
        }
    }

    public destroyed(): void
    {
        if (this.keydownOn)
        {
            window.removeEventListener(`keydown`, this.keydownOn);
        }
    }
}
