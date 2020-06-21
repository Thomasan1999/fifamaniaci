<template>
    <tr :class="className">
        <template v-for="[columnName, column] in columnsFilteredEntries">
            <component v-if="!column.display || $store.state.windowWidth >= column.display" :key="columnName" :is="`${children}Component`"
                       v-bind="{column, columnName, ...(children === `td` && {index, row, rowId, value: row[columnName]})}"/>
        </template>
    </tr>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import ThComponent       from './ThComponent.vue';
    import TdComponent       from './TdComponent.vue';
    import MainMixin         from '@/mixins/Main';

    @Component({
        components: {
            TdComponent,
            ThComponent
        },
        name: `TrComponent`
    })
    export default class TrComponent extends mixins(MainMixin)
    {
        @Prop({type: String}) public readonly children!: string;
        @Prop({type: Array}) public readonly columnsFilteredEntries!: [string, ColumnValue][];
        @Prop({type: Number}) public readonly index!: number;
        @Prop({type: String}) public readonly rowId!: string;
        @Prop({type: Object}) public readonly row!: {created: Date, dnfAfterWeeks?: boolean, [s: string]: any};

        public get className(): {dnf: boolean}
        {
            return {dnf: typeof this.row?.dnfAfterWeeks === `number`};
        }
    }
</script>

<style lang="stylus" scoped>
    tr
        &.dnf
            font-color #666666
</style>
