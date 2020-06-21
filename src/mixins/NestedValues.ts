import {Component} from 'vue-property-decorator';
import {mixins}    from 'vue-class-component';
import MainMixin   from '@/mixins/Main';

@Component({
    name: `NestedValuesMixin`
})
export default class NestedValuesMixin extends mixins(MainMixin)
{
    public tableName!: string;

    get nestedValues()
    {
        return (this.$store.state[this.tableName]?.nestedProps || []).map((nestedProp) =>
        {
            return this[nestedProp];
        });
    }
}
