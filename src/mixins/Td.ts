import {Component, Prop} from 'vue-property-decorator';
import {mixins}          from 'vue-class-component';
import MainMixin         from '@/mixins/Main';

@Component({
    name: `TdMixin`
})
export default class TdMixin extends mixins(MainMixin)
{
    @Prop({type: Number}) readonly index!: number;
    @Prop({type: Object}) readonly row!: object;
    @Prop({type: String}) readonly rowId!: string;
    @Prop() readonly value!: any;
}
