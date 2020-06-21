<template>
    <div class="user-dropdown" :style="{[reversed ? `bottom` : `top`]: `100%`, flexDirection: `column${reversed ? `-reverse` : ``}`}">
        <button v-for="([userId, user], c) in usersSorted" :key="c" :class="{active: c === userActiveIndex}" v-html="user.username" @blur="blurOn" @click="clickOn({user, userId})">
        </button>
    </div>
</template>

<script lang="ts">
    import {mixins}                 from 'vue-class-component';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import MainMixin                from '@/mixins/Main';

    @Component({
        name: `UserDropdown`
    })
    export default class UserDropdown extends mixins(MainMixin)
    {
        @Prop({required: true, type: String}) public readonly keyMode!: string;
        @Prop({required: true, type: Object}) public readonly users!: { [s: string]: UserValue };

        public blurOn(): void
        {
            this.$emit(`blur`);
        }

        public clickOn({user, userId}: { user: Omit<UserValue, 'id'>, userId: string }): void
        {
            this.$emit(`click`, {[userId]: user});
        }

        public keydownOn({key}: KeyboardEvent): void
        {
            if (this.keyMode !== `input`)
            {
                return;
            }

            switch (key)
            {
                case `ArrowDown`:
                case `ArrowUp`:
                {
                    const shift: number = (key === `ArrowDown` ? 1 : -1) * (this.reversed ? -1 : 1);

                    this.userActiveIndex = new this.$Range(-1, this.usersSorted.length - 1).incorporate(this.userActiveIndex + shift);
                    break;
                }
                case `Enter`:
                {
                    if (this.userActiveIndex === -1)
                    {
                        this.userActiveIndex = 0;
                    }

                    if (this.$Tomwork.emptyIs(this.users))
                    {
                        return;
                    }

                    this.$emit(`click`, {[this.usersSorted[this.userActiveIndex][0]]: this.usersSorted[this.userActiveIndex][1]});
                }
            }
        }

        public reversedCalc(): void
        {
            const bottomRowHeight: number = this.$el ? (this.$el.closest(`section`)?.querySelector(`.bottom-row`) as HTMLElement).offsetHeight : 0;
            const height: number = this.$el ? (parseFloat(window.getComputedStyle(this.$el).getPropertyValue(`line-height`)) * 5) + bottomRowHeight : 0;

            this.reversed = Boolean(this.$parent.$el && this.$store.state.windowHeight - this.$parent.$el.getBoundingClientRect().bottom < height);
        }

        public reversed: boolean = false;
        public userActiveIndex: number = -1;

        public get usersSorted(): [string, Omit<UserValue, 'id'>][]
        {
            return Object.entries(this.users).sort(([, userA], [, userB]) =>
            {
                return userA.username.toLowerCase().localeCompare(userB.username.toLowerCase());
            });
        }

        @Watch('usersSorted')
        public usersSortedChangeOn(): void
        {
            this.reversedCalc();
        }

        mounted()
        {
            this.reversedCalc();
        }
    }
</script>

<style lang="stylus" scoped>
    .user-dropdown
        display flex
        position absolute
        z 1

        button
            background-color $blue
            padding-horizontal 5px

            &.active, &:hover
                background-color $blueHover
</style>
