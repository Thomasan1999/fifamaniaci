import {Component, Prop} from 'vue-property-decorator';
import {mixins}          from 'vue-class-component';
import MainMixin         from '@/mixins/Main';
import NestedValuesMixin from '@/mixins/NestedValues';

@Component({
    name: `LeagueSectionMixin`
})
export default class LeagueSectionMixin extends mixins(MainMixin, NestedValuesMixin)
{
    @Prop({required: true, type: Object}) text!: any;
    @Prop({type: Object}) unseen!: object;

    public rowsGet(tableName: string = this.tableName): object
    {
        const {categoryHas, nestedProps, value} = this.$store.state[tableName];

        if (tableName && this.$store.state.dataLoaded.value[this.categoriesActive])
        {
            return new this.$Object(categoryHas ? value[this.categoriesActive] : value).findNested(this.nestedValues.slice(0, nestedProps.length) || []) || {};
        }

        return {};
    }

    public get dataLoaded(): boolean
    {
        return Boolean(new this.$Object(this.$store.state.dataLoaded.value[this.categoriesActive] as unknown as {[s: string]: boolean}).findNested(this.nestedValues));
    }

    public get divisionId(): number
    {
        return this.$store.state.divisions.active;
    }

    public get seasonId(): number
    {
        return this.$store.state.leagueSeasons.active;
    }
}
