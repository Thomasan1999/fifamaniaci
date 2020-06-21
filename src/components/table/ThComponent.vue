<template>
    <th v-if="$store.getters.touchscreen && texts.table[columnName].short.icon" :class="className" :style="column.style" :title="texts.table[columnName].long">
        <font-awesome-icon :class="texts.table[columnName].short.class" :icon="texts.table[columnName].short.icon"/>
    </th>
    <th v-else :class="className" :style="column.style">
        <span v-html="html"/>
    </th>
</template>

<script lang="ts">
    import {Component}    from 'vue-property-decorator';
    import {mixins}       from 'vue-class-component';
    import TdComponent    from '@/components/table/TdComponent.vue';
    import MainMixin      from '@/mixins/Main';
    import TableCellMixin from '@/mixins/TableCell';

    @Component({
        components: {
            TdComponent,
            ThComponent
        },
        name: `ThComponent`
    })
    export default class ThComponent extends mixins(MainMixin, TableCellMixin)
    {
        public get className(): { [s: string]: any }
        {
            const {column: {head}, column} = this;

            return {
                [new this.$String(this.columnName).caseTrainTo().toString()]: (head || column).visibility !== false
            };
        }

        public get html(): string
        {
            const thHtml: {
                long: string,
                short: string
            } = this.column.head?.html || this.texts.table[this.columnName];

            return new this.$String(this.$store.getters.touchscreen ? thHtml.short : thHtml.long).htmlParse().toString();
        }
    }
</script>

<style lang="stylus" scoped>

</style>
