import {mixins}                     from 'vue-class-component';
import {Component}                  from 'vue-property-decorator';
import MatchesSectionMixin          from '@/mixins/MatchesSection';
import TableContainerContainerMixin from '@/mixins/TableContainerContainer';

@Component({
    name: `MatchesMixin`
})
export default class MatchesMixin extends mixins(TableContainerContainerMixin, MatchesSectionMixin)
{
    public canceledTextGet(match: MatchValue): string
    {
        const variables: {
            at: number,
            by: string
        } = {
            at: match.canceledAt as number,
            by: this.$store.state.users.value[match[`${match.canceledBy}Id`]].username
        };

        this.sides.forEach((side) =>
        {
            variables[`${side}Goals`] = (match[`${side}Goals`] - (side !== match.canceledBy ? this.restGoalsCalc({canceledAt: match.canceledAt as number}) : 0)).toString();
        });

        return new this.$String(this.texts.matches.canceled).htmlParse(variables).toString();
    }

    public tableName: string = `matches`;
    public columns: { [s: string]: ColumnValue } = {
        awayId: {
            order: 10,
            orientation: `left`,
            type: `id`
        },
        awayCanceled: {
            html: ``,
            margin: 0,
            order: 9,
            orientation: `right`,
            title: this.canceledTextGet,
            type: `canceled`
        },
        awayGoals: {
            margin: 0,
            order: 6,
            orientation: `left`,
            required: false,
            type: `integer`
        },
        awayTooltip: {
            margin: 0,
            order: 8,
            orientation: `left`,
            type: `tooltip`
        },
        colon: {
            html: `:`,
            margin: 0,
            order: 5,
            orientation: `center`,
            static: true
        },
        delete: {
            html: `\u2715`,
            order: 12,
            orientation: `right`,
            visibility: false
        },
        homeId: {
            order: 1,
            orientation: `right`,
            type: `id`
        },
        homeCanceled: {
            html: ``,
            margin: 0,
            order: 2,
            orientation: `left`,
            title: this.canceledTextGet,
            type: `canceled`
        },
        homeGoals: {
            margin: 0,
            order: 4,
            orientation: `right`,
            required: false,
            type: `integer`
        },
        homeTooltip: {
            margin: 0,
            order: 3,
            orientation: `left`,
            type: `tooltip`
        },
        overtime: {
            html: this.$store.getters.texts.matches.overtime.localization,
            margin: 0,
            order: 7,
            orientation: `left`,
            title: this.$store.getters.texts.matches.overtime.title
        },
        playedAt: {
            format: {
                default: `d.m.yyyy`,
                [`500`]: `d.m.`
            },
            order: 0,
            orientation: `left`,
            tag: `time`,
            type: `date`
        },
        submit: {
            html: `\u2713`,
            order: 11,
            orientation: `right`,
            visibility: false
        }
    };
    public startTopAt: boolean = false;

    public get sides(): MatchSide[]
    {
        return this.$store.state.matches.sides;
    }

    public get types(): object
    {
        return this.$store.state.matchesTypes.value;
    }
}
