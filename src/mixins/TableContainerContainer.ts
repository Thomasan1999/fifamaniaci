import {Component}  from 'vue-property-decorator';
import {mixins}     from 'vue-class-component';
import NestedValues from '@/mixins/NestedValues';
import MainMixin    from '@/mixins/Main';

@Component({
    name: `TableContainerContainerMixin`
})
export default class TableContainerContainerMixin extends mixins(MainMixin, NestedValues)
{
    public thead!: boolean;
}
