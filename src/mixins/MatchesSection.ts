import {mixins}    from 'vue-class-component';
import {Component} from 'vue-property-decorator';
import MainMixin   from '@/mixins/Main';

@Component({
    name: `MatchesSectionMixin`
})
export default class MatchesSectionMixin extends mixins(MainMixin)
{
    public restGoalsCalc({canceledAt}: {canceledAt: number}): number
    {
        return Math.ceil((91 - canceledAt) / 10);
    }

    public sideGet(name: string): MatchSide
    {
        return new this.$String(name).caseCamelSplit()[0].split(`_`)[0] as MatchSide;
    }

    public sideOtherGet(side: MatchSide): MatchSide
    {
        return {away: `home`, home: `away`}[side] as MatchSide;
    }

    public sidesGet(elementName: MatchSide): {side: MatchSide, sideOther: MatchSide}
    {
        const side: MatchSide = this.sideGet(elementName);
        return {side, sideOther: this.sideOtherGet(side)};
    }

    public get goalProps(): string[]
    {
        return this.sides.map((side) =>
        {
            return `${side}Goals`;
        });
    }

    public get sides(): MatchSide[]
    {
        return this.$store.state.matches.sides;
    }
}
