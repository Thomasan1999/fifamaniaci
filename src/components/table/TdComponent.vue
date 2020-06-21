<template>
    <td :class="className" :style="column.style">
        <td-content v-bind="$props"/>
    </td>
</template>

<script lang="ts">
    import {mixins}       from 'vue-class-component';
    import {Component}    from 'vue-property-decorator';
    import TdContent      from '@/components/table/TdContent.vue';
    import TableCellMixin from '@/mixins/TableCell';
    import TdMixin        from '@/mixins/Td';

    @Component({
        components: {
            TdContent
        },
        inheritAttrs: false,
        name: `TdComponent`
    })
    export default class TdComponent extends mixins(TableCellMixin, TdMixin)
    {
        public get className(): { [s: string]: any }
        {
            return {
                [new this.$String(this.columnName).caseTrainTo().toString()]: this.column.visibility !== false,
                [`margin-none`]: this.column.margin === 0,
                [`${this.column.orientation || `left`}-oriented`]: true
            };
        }
    }
</script>

<style lang="stylus" scoped>

</style>
