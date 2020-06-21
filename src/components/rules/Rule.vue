<template>
    <div v-if="visible && text.title" class="rule">
        <component v-if="text.title" :is="`h${text.level + 1}`" :key="`${keyClone}-title`" class="h" v-html="new $String(text.title).htmlParse()"/>
        <rule :key-clone="`${keyClone}-text`" :text="text.text"/>
    </div>
    <rule v-else-if="visible && text.categories" :key="`${keyClone}-0`" class="rule" :key-clone="`${keyClone}-0`" :text="text.text"/>
    <component v-else-if="visible && text instanceof Array" :is="topLevel ? `div`: `ul`" class="rule">
        <rule v-for="(item, itemIndex) in text" :key="`${keyClone}-${itemIndex}`" :key-clone="`${keyClone}-${itemIndex}`" :text="item"/>
    </component>
    <p v-else-if="visible && topLevel" class="rule" :style="{marginTop: keyClone.split(`-`)[1] === `0` ? `0` : `1.9em`}" v-html="new $String(text.text || text).htmlParse()"/>
    <li v-else-if="visible" class="rule" v-html="new $String(text).htmlParse()"/>
</template>

<script lang="ts">
    import {mixins}          from 'vue-class-component';
    import {Component, Prop} from 'vue-property-decorator';
    import MainMixin         from '@/mixins/Main';

    @Component({
        name: `Rule`
    })
    export default class Rule extends mixins(MainMixin)
    {
        @Prop({required: true, type: String}) public readonly keyClone!: string;
        @Prop({required: true, type: [Array, Object, String]}) public readonly text!: string[] | string | { [s: string]: string };

        public get topLevel(): boolean
        {
            return this.keyClone.split(`-`).length <= 2;
        }

        public get visible(): boolean
        {
            // @ts-ignore
            return !(this.text.categories && !this.text.categories.some((categoryAllowed) =>
            {
                // @ts-ignore
                return Object.entries(this.$store.state.categories.value).find(([, category]) =>
                {
                    // @ts-ignore
                    return category.name === categoryAllowed;
                })[0] === this.categoriesActive;
                // @ts-ignore
            })) && !(this.text.condition && !this.text.condition(this));
        }
    }
</script>

<style lang="stylus" scoped>
    .rule
        font-color #bbbbbb
        line-height 1.9
        text-align left

        @media (max-width 679px)
            font-size 14px

        @media (max-width 499px)
            font-size 13px

        @media (max-width 359px)
            font-size 12px

    >>> .h
        font-color #ffffff

    >>> h2
        margin-top 25px

    >>> h3
        margin-top 10px

    >>> ul
        margin-left 3em

    >>> a
        font-color #ffffff

    >>> strong
        font-color #ffffff
        font-weight 400
</style>
