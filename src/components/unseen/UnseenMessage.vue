<template>
    <div v-if="count" class="unseen-message" :class="[type]">
        <p v-html="htmlGet()"/>
    </div>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import MainMixin         from '@/mixins/Main';

    @Component({
        name: `UnseenMessage`
    })
    export default class UnseenMessage extends mixins(MainMixin)
    {
        @Prop({required: true, type: Number}) public readonly count!: number;
        @Prop({required: true, type: String}) public readonly tableName!: string;
        @Prop({required: true, type: Object}) public readonly text!: any;
        @Prop({required: true, type: String}) public readonly type!: 'general' | 'personal';

        public htmlGet(): string
        {
            const pluralIf: string = new this.$Range(2, 4).includes(this.count) ? this.text[`2-4`] : this.text[`5+`];
            const value: string = this.count === 1 ? this.text[`1`] : pluralIf;
            return new this.$String(value).htmlParse({count: this.count}).toString();
        }
    }
</script>

<style lang="stylus" scoped>
    .unseen-message
        align-items center
        box-shadow $boxShadowBottom
        display flex
        height 2em
        justify-content center
        line-height 2em
        padding-horizontal 10px

        &.general
            background-color $general

        &.personal
            background-color $personal

        &:not(:first-child)
            margin-top 10px
</style>
