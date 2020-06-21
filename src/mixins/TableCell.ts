import {Component, Prop} from 'vue-property-decorator';
import {mixins}          from 'vue-class-component';
import MainMixin         from '@/mixins/Main';

@Component({
    name: `TableCellMixin`
})
export default class TableCellMixin extends mixins(MainMixin)
{
    @Prop({required: true, type: Object}) public readonly column!: ColumnValue;
    @Prop({required: true, type: String}) public readonly columnName!: string;
}
