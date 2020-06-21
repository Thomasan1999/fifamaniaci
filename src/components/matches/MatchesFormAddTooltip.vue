<template>
    <div class="matches-form-add-tooltip" :class="classGet()">
        <label :for="`${htmlName}-canceled-at`" v-html="canceledText[0]"/>
        <div>
            <input class="tooltip-canceled-at" :id="`${htmlName}-canceled-at`" :max="canceledAt.max" :min="canceledAt.min" :placeholder="canceledAt.min" ref="canceledAt"
                   type="number" :value="canceledAt.value" @input="inputOn({element: canceledAt, $event})">
            <label :for="`${htmlName}-home-goals`" v-html="canceledText[1]"/>
        </div>
        <div>
            <input class="tooltip-home-goals" :id="`${htmlName}-home-goals`" :max="homeGoals.max" :min="homeGoals.min" :placeholder="homeGoals.min" ref="homeGoals" type="number"
                   :value="homeGoals.value" @input="inputOn({element: homeGoals, $event})">
            <label class="tooltip-away-goals" :for="`${htmlName}-away-goals`" v-html="canceledText[2]"/>
            <input class="tooltip-away-goals" :id="`${htmlName}-away-goals`" :max="awayGoals.max" :min="awayGoals.min" :placeholder="awayGoals.min" ref="awayGoals" type="number"
                   :value="awayGoals.value" @input="inputOn({element: awayGoals, $event})">
        </div>
        <div>
            <div class="submit" v-html="'\u2713'" @click="submitOn()" @mousedown.prevent></div>
            <div class="delete" v-html="'\u2715'" @click="deleteOn()" @mousedown.prevent></div>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import {mixins}                 from 'vue-class-component';
    import MainMixin                from '@/mixins/Main';
    import MatchesMixin             from '@/mixins/Matches';
    import FormMixin                from '@/mixins/Form';

    @Component({
        name: `MatchesFormAddTooltip`
    })
    export default class MatchesFormAddTooltip extends mixins(MainMixin, MatchesMixin, FormMixin)
    {
        @Prop({required: true, type: String}) public readonly htmlName!: string;
        @Prop({required: true, type: Object}) public readonly text!: any;
        @Prop({required: true, type: String}) public readonly username!: string;
        @Prop({required: true, type: Boolean}) public readonly visibility!: boolean;

        public canceledAtMaxCalc(): number
        {
            return 90 + (30 * Number(this.fut));
        }

        public classGet(): { reversed: boolean }
        {
            const bottomRowHeight = this.$el ? (this.$el.closest(`section`)?.querySelector(`.bottom-row`) as HTMLElement).offsetHeight : 0;

            return {
                reversed: this.$el && this.$parent.$el.getBoundingClientRect().bottom + (this.$parent.$el as HTMLElement).offsetHeight + bottomRowHeight
                    > this.$store.state.windowHeight
            };
        }

        public deleteOn(): void
        {
            this.propsEmpty();
            this.$emit(`delete`, Object.keys(this.elements));
        }

        public inputOn({element, $event}: { element: FormElement, $event: KeyboardEvent }): void
        {
            this.propertiesUpdate({element, props: {value: ($event.target as HTMLInputElement).value}});
        }

        public keydownOn({key}: KeyboardEvent): void
        {
            if (!Object.values(this.$refs).includes(document.activeElement as HTMLElement))
            {
                return;
            }

            switch (key)
            {
                case `Enter`:
                    this.submitOn();
                    break;
                case `Delete`:
                    this.deleteOn();
                    break;
            }
        }

        public propsEmpty(): void
        {
            Object.values(this.elements).forEach((element) =>
            {
                this.propertiesUpdate({element, props: {value: ``}});
            });
        }

        public submitOn(): void
        {
            this.$emit(`submit`, this.formData);
        }

        public validityGet({element: {name, required, validateRegex}}: { element: FormElement }): boolean
        {
            return (validateRegex.test(this.formData[name]) || (!this.formData[name] && !required));
        }

        public widthCalc(): void
        {
            this.$el.style.whiteSpace = ``;
            this.$el.style.width = ``;
            const {windowWidth} = this.$store.state;
            const $elWidth = this.$el.offsetWidth;
            const {left} = this.$el.getBoundingClientRect();

            if ((left + $elWidth) > windowWidth)
            {
                this.$el.style.width = `calc(100vw - ${`${left}px`})`;
                this.$el.style.whiteSpace = `inherit`;
            }
        }

        public $el!: HTMLElement;

        public get awayGoals(): FormElement
        {
            return this.elements.awayGoals;
        }

        public get canceledAt(): FormElement
        {
            return this.elements.canceledAt;
        }

        public get canceledText(): string[]
        {
            return new this.$String(this.text.canceled).htmlParse({by: this.username}).split(/\${\w+}/);
        }

        public get homeGoals(): FormElement
        {
            return this.elements.homeGoals;
        }

        @Watch('categoriesActive')
        public categoriesActiveChangeOn(): void
        {
            this.elements.canceledAt.max = this.canceledAtMaxCalc();
        }

        @Watch('visibility')
        public visibilityChangeOn(): void
        {
            this.widthCalc();
        }

        @Watch('$store.state.windowWidth')
        public '$store.state.windowWidthChangeOn'(): void
        {
            this.widthCalc();
        }

        public created(): void
        {
            this.elements = this.elementsCreate({
                awayGoals: {min: 0, type: `integer`, value: ``},
                canceledAt: {min: 1, max: 90, type: `integer`, value: ``},
                homeGoals: {min: 0, type: `integer`, value: ``}
            });
            this.elements.canceledAt.max = this.canceledAtMaxCalc();
        }
    }
</script>

<style lang="stylus" scoped>
    .matches-form-add-tooltip
        box-sizing border-box
        left calc(-15.5px - 1.166666666666667em - .2675em)
        padding-horizontal .7em
        position absolute
        top 100%
        white-space nowrap
        z 1

        &.reversed
            bottom 100%
            top auto

            &:after
                border-bottom 0
                border-top .625em
                bottom 0
                top auto
                transform translateY(100%)

        &:after
            border-bottom .625em
            border-vertical .625em transparent
            content: ''
            display block
            height 0
            left (7 / 6) em
            margin auto
            position absolute
            top 0
            transform translateY(-100%)
            width 0

        *
            display inline-block

        & > *
            text-align center

    input
        resize horizontal
        width 22px

        +placeholder()
            font-color rgba(255, 255, 255, .5)

        &.tooltip-canceled-at, &.tooltip-home-goals
            text-align right

        &.tooltip-away-goals
            text-align left

    label
        width auto

        &.tooltip-away-goals
            text-align center
            width 8px

    .submit
        padding-horizontal 5px

    .delete
        padding-left 5px
        padding-right 0

    .submit, .delete
        width auto

        &:hover
            font-color $tableLight
</style>
