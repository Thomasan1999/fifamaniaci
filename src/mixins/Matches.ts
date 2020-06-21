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
            type: `id`
        },
        awayCanceled: {
            html: ``,
            order: 9,
            title: this.canceledTextGet,
            type: `canceled`
        },
        awayGoals: {
            order: 6,
            required: false,
            type: `integer`
        },
        awayTooltip: {
            order: 8,
            type: `tooltip`
        },
        colon: {
            html: `:`,
            order: 5,
            static: true
        },
        delete: {
            html: `\u2715`,
            order: 12,
            visibility: false
        },
        homeId: {
            order: 1,
            type: `id`
        },
        homeCanceled: {
            html: ``,
            order: 2,
            title: this.canceledTextGet,
            type: `canceled`
        },
        homeGoals: {
            order: 4,
            required: false,
            type: `integer`
        },
        homeTooltip: {
            order: 3,
            type: `tooltip`
        },
        overtime: {
            html: this.$store.getters.texts.matches.overtime.localization,
            order: 7,
            title: this.$store.getters.texts.matches.overtime.title
        },
        playedAt: {
            format: {
                default: `d.m.yyyy`,
                [`500`]: `d.m.`
            },
            order: 0,
            tag: `time`,
            type: `date`
        },
        submit: {
            html: `\u2713`,
            order: 11,
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
