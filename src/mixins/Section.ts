import {mixins}          from 'vue-class-component';
import {Component, Prop} from 'vue-property-decorator';
import MainMixin         from '@/mixins/Main';

@Component({
    name: `SectionMixin`
})
export default class SectionMixin extends mixins(MainMixin)
{
    @Prop({required: true, type: Object}) text!: any;

    public get active(): boolean
    {
        return this.sectionsActive === new this.$String(this.$options.name as string).decapitalize().toString();
    }
}
