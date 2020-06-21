<template>
    <div v-if="column.required === false && typeof value === `undefined`">
        <span/>
    </div>
    <div v-else-if="column.type === `canceled` && `${row.canceledBy}Canceled` === columnName" :title="column.title(row)">
        <font-awesome-icon :icon="[`fas`, `exclamation-triangle`]"/>
    </div>
    <time v-else-if="column.tag === `time`" :datetime="$dayjs(value).format()" v-html="htmlGet()"/>
    <username-container v-else-if="column.type && column.type.replace(/\[]$/, ``) === `id`" :admin-show="column.adminShow" :connectivity-show="Boolean(column.connectivityShow)"
                        :dnf-show="column.dnfShow && typeof row.dnfAfterWeeks === `number`" :user-id="value"/>
    <div v-else-if="column.children">
        <td-content v-for="(child, index) in value" :key="index" v-bind="{column: column.children, columnName, index, row, rowId, value: child}"/>
    </div>
    <div v-else-if="column.dnfShow && value === `dnf`">
        <span :title="texts.user.dnf.long" v-html="texts.user.dnf.short"/>
    </div>
    <component v-else :is="column.tag || `span`" :class="column.class && column.class[value]" v-html="htmlGet()" :title="titleGet()"/>
</template>

<script lang="ts">
    import {mixins}          from 'vue-class-component';
    import {Component}       from 'vue-property-decorator';
    // eslint-disable-next-line
    import dayjs             from 'dayjs';
    import emoji             from '@/json/emoji';
    import UsernameContainer from '@/components/UsernameContainer.vue';
    import MainMixin         from '@/mixins/Main';
    import TableCellMixin    from '@/mixins/TableCell';
    import TdMixin           from '@/mixins/Td';

    @Component({
        components: {
            UsernameContainer
        },
        name: `TdContent`
    })
    export default class TdContent extends mixins(MainMixin, TableCellMixin, TdMixin)
    {
        public htmlGet(): string
        {
            if (typeof this.column.html === `object`)
            {
                return this.column.html[this.value];
            }

            if (this.column.html && this.value)
            {
                return this.column.html;
            }

            const {column} = this;

            if (typeof column === `undefined` || column.visibility === false)
            {
                return ``;
            }

            const signGet: (value: number) => string = (value: number) =>
            {
                return value > 0 ? `+` : ``;
            };

            const typeArrayIs: boolean = column.type?.slice(-2) === `[]`;
            const valueRaw: string | string[] = typeof this.value === `undefined` ? this.column.default : this.value;

            const valueParse: (value: any, valueIndex?: number) => string = (value: any, valueIndex?: number) =>
            {
                switch (typeArrayIs ? (column.type as string).replace(/\[]$/, ``) : column.type)
                {
                    case `currency`:
                        return new this.$Number(value).currencyFormat;
                    case `date`:
                    {
                        let [, format]: [string, string] | [] = Object.entries(column.format as { [s: string]: string }).find(([windowWidth]) =>
                        {
                            return parseInt(windowWidth) > this.$store.state.windowWidth || windowWidth === `default`;
                        }) || [];

                        if (format && column.minimalist && valueIndex === 0)
                        {
                            const dates: [dayjs.Dayjs, dayjs.Dayjs] = (valueRaw as string[]).map((date) =>
                            {
                                return this.$dayjs(date);
                            }) as [dayjs.Dayjs, dayjs.Dayjs];

                            if (dates[0].year() === dates[1].year())
                            {
                                format = format.replace(/[y]+/g, ``);
                            }

                            if (dates[0].month() === dates[1].month())
                            {
                                format = format.replace(/[m]+/g, ``);
                            }
                        }

                        return new this.$Date(value).format(format || ``);
                    }
                    case `float`:
                    case `integer`:
                    {
                        const sign: string = column.signed ? signGet(value) : ``;
                        const numberFormatted: string = `${sign}${new Intl.NumberFormat(`sk-SK`, {maximumFractionDigits: column.fixed}).format(value)}`;

                        return (!column.required && typeof value !== `number`) ? `` : numberFormatted;
                    }
                    case `index`:
                        return `${new Intl.NumberFormat(`sk-SK`).format(this.index + 1)}.`;
                    case `tooltip`:
                        return ``;
                    default:
                        return column.static ? column.html : `` || (column.type === `message` && value ? this.messageParse(value) : value);
                }
            };

            if (typeArrayIs)
            {
                return (valueRaw as string[]).map(valueParse).join(column.join);
            }

            return valueParse(valueRaw);
        }

        public htmlUnescape(val: string): string
        {
            return val.replace(/&amp;/g, `&`).replace(/&lt;/g, `<`).replace(/&gt;/g, `>`).replace(/&quot;/g, `"`).replace(/&apos;/g, `\``);
        }

        public messageParse(val: string): string
        {
            return val.split(` `).map((word) =>
            {
                const wordParsed: string = this.htmlUnescape(word);
                const wordUnified: string = wordParsed.replace(/0/g, `O`).split(``).filter((char, charIndex) =>
                {
                    return [`-`, `=`].includes(wordParsed[wordParsed.length - 2]) && (charIndex !== wordParsed.length - 2 || charIndex === 0);
                }).join(``);
                const unicode: string = emoji[wordParsed] || emoji[wordUnified] || (wordParsed.match(/^:(.*):$/) ? emoji[wordParsed.replace(/:/g, ``)] : null);
                const redHeart: boolean = unicode === `2764`;

                const unicodeIf: string = unicode ? unicode.split(` `).map((unicodeWord) =>
                {
                    return `${redHeart ? `<span style="color: #e81224">` : ``}${String.fromCodePoint(parseInt(unicodeWord, 16))}${redHeart ? `</span>` : ``}`;
                }).join(``) : word;

                return wordParsed.slice(0, 2) === `\\:` ? word.slice(1) : unicodeIf;
            }).join(` `).replace(/\\(?!\\)/g, ``).replace(/\\\\/g, `\\`);
        }

        public titleGet(): string
        {
            if (this.column.title)
            {
                return typeof this.column.title === `string` ? this.column.title : this.column.title[this.value] || this.value;
            }

            return ``;
        }
    }
</script>

<style lang="stylus" scoped>

</style>
