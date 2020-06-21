<template>
    <div class="tab-container">
        <template v-for="[tabId, tab] in tabs">
            <a v-if="tab.disabled" :key="tabId" class="tab disabled">
                <p>
                    <span class="tab-name" v-html="new $String(tab.name).htmlParse()"/>
                    <span class="soon" v-html="new $String(text.soon).htmlParse()"/>
                </p>
            </a>
            <router-link v-else :key="tabId" class="tab" :to="{name: tabsNames[tabId], params: $store.getters.params}">
                <p :class="{[`general-count`]: tab.special}">
                    <slot v-if="tab.special" name="special">
                    </slot>
                    <component v-if="tab.component" :is="tab.component.name" v-bind="tab.component.props"/>
                    <span v-else class="tab-name" v-html="new $String(tab.name).htmlParse()"/>
                </p>
                <span v-if="updatable && parseInt(tabId) !== 0" class="tab-delete" v-html="`\u2715`" @click.prevent="tabDelete({tabId})"/>
            </router-link>
        </template>
        <div v-if="updatable && $store.state.userLogged.loggedIn" class="tab-add" :class="{clicked: tabAddClicked}">
            <slot v-if="$scopedSlots.add && tabAddClicked" name="add">
            </slot>
            <p v-else @click="tabAddClickOn">+</p>
        </div>
    </div>
</template>

<script lang="ts">
    import {mixins}           from 'vue-class-component';
    import {Component, Prop}  from 'vue-property-decorator';
    import UsernameContainer  from '@/components/UsernameContainer.vue';
    import MainMixin          from '@/mixins/Main';

    @Component({
        components: {
            UsernameContainer
        },
        name: `TabContainer`
    })
    export default class TabContainer extends mixins(MainMixin)
    {
        @Prop({type: String}) public readonly tableName!: string;
        @Prop({required: true, type: Array}) public readonly tabs!: any[];
        @Prop({required: true, type: [Number, String]}) public readonly tabsActive!: string | number;
        @Prop({required: true, type: Object}) public readonly tabsNames!: {[s: string]: string};
        @Prop({required: true, type: Object}) public readonly text!: any;
        @Prop({
            default: false,
            type: Boolean
        }) public readonly updatable!: boolean;

        public tabAddClickOn(): void
        {
            this.tabAddClicked = true;
            this.$emit(`tab-add-click`);
        }

        public tabDelete({tabId}: {tabId: number}): void
        {
            this.$emit(`delete`, {tabId});
        }

        public tabAddClicked: boolean = false;
    }
</script>

<style lang="stylus" scoped>
    .tab-container
        align-items center
        background linear-gradient(to bottom, $tableDark 40px, $tabGray 40px)
        box-shadow $boxShadowBottom
        box-sizing border-box
        display flex
        flex 0 0 45px
        height 45px
        padding-bottom 5px
        z 2

    .tab
        align-items center
        border-vertical 2px solid $sectionGray
        box-sizing border-box
        cursor pointer
        display flex
        flex-basis 0
        flex-grow 1
        height 100%
        justify-content center
        line-height 1em
        max-width (100 / 3) %
        padding-left 8px
        padding-right 8px
        position relative
        transition .25s

        @media (max-width 1199px)
            max-width 50%

        @media (max-width 599px)
            max-width 100%
            padding-left 3px
            padding-right 3px

        &:hover
            background-color blend(rgba($tableDark, .75), $tabGray);

        &:first-child
            border-left 0

        &:last-child
            border-right 0

        &.router-link-exact-active
            background-color $tabGray

        &:not(.router-link-exact-active)
            pointer-events unset

        p
            align-items center
            display flex
            justify-content center
            position relative

        a
            pointer-events none
            text-decoration none

        >>> .users
            margin-left 5px

    .tab-name
        text-align center

    .soon
        bottom 0
        left 100%
        margin-vertical auto
        position absolute
        top 0
        width 100%

        @media (max-width 1023px)
            bottom auto
            left 0
            line-height 1em
            margin-horizontal auto
            right 0
            text-align center
            top calc(100% + 1px)


    .tab-delete
        cursor pointer
        pointer-events all
        position absolute
        right 10px

        &:hover
            font-color $blue

    .tab-add
        background-color $tableDark
        border-left 2px solid $sectionGray
        height 100%
        line-height 40px
        min-width 40px
        text-align center

        &:hover
            p
                font-color $blue

        &.clicked
            flex-grow 1
            max-width (100 / 3) %

            @media (max-width 1199px)
                max-width 50%

            @media (max-width 599px)
                max-width 100%

        >>> .user-dropdown
            button
                text-align left

        p, input
            background-color transparent
            box-sizing border-box
            font-color #ffffff
            height 100%
            padding-horizontal 10px
            width 100%

        p
            cursor pointer
            font-size 1.875em
</style>
