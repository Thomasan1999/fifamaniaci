<template>
    <form v-if="$store.state.userLogged.loggedIn" :action="`https://api.${hostname}/messages`" autocomplete="disabled" method="post" @submit.prevent="submitOn">
        <div :class="{[`error-show`]: element.errorShow && submitted}">
            <input :maxlength="element.length.max" :type="element.input" :value="element.value" @blur="blurOn({element})" @input="inputOn">
        </div>
        <button class="bordered-button" v-html="texts.form.submit"/>
    </form>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import MainMixin         from '@/mixins/Main';
    import FormMixin         from '@/mixins/Form';

    @Component({
        name: `MessagesFormAdd`
    })
    export default class MessagesFormAdd extends mixins(MainMixin, FormMixin)
    {
        @Prop({type: Number}) public readonly addresseeId!: number;
        @Prop({required: true, type: Number}) public readonly tabId!: number;
        @Prop({required: true, type: Object}) public readonly text!: any;

        public inputOn($event: Merge<KeyboardEvent, { target: HTMLInputElement }>): void
        {
            this.propertiesUpdate({element: this.element, props: {value: $event.target.value}});
        }

        public submitOn(): void
        {
            this.submitted = true;

            if (!this.valid)
            {
                this.computedPropertiesUpdate({element: this.element});

                const {alertType, length, validateRegex} = this.element;
                this.alertShow({alertType, length, state: `failed`, targetType: `message`, validateRegex});
                return;
            }

            this.$store.dispatch(`tableUpdate`, {
                categoryId: this.$store.state.categories.active,
                lastUpdate: false,
                res: {
                    body: {
                        [Object.keys(this.$store.state.messages.value[this.categoriesActive][this.tabId]).length + 1000]: {
                            addressee: null,
                            categoryId: this.$store.state.categories.active,
                            created: this.$dayjs().format(),
                            createdById: this.$store.state.userLogged.id,
                            message: this.formData.message
                        }
                    },
                    ok: true
                } as unknown as any,
                tableName: this.tableName,
            }).catch((err) =>
            {
                console.error(err);
            });

            this.submitted = false;

            Object.values(this.elements).forEach((element) =>
            {
                this.propertiesUpdate({element, props: {value: ``}});
            });
        }

        public validityGet({element: {name, required, validateRegex, validLength}}: { element: FormElement }): boolean
        {
            return ((validateRegex.test(this.formData[name]) && this.formData[name]?.trim() && required) || (!this.formData[name] && !required)) && validLength;
        }

        public tableName = `messages`;

        public submitted: boolean = false;

        public get element(): FormElement
        {
            return this.elements.message;
        }

        public created(): void
        {
            this.elements = this.elementsCreate({
                message: {
                    type: `message`
                }
            });
            this.elementsExtra = this.elementsCreate({
                addresseeId: {
                    required: false,
                    value: this.addresseeId === -1 ? undefined : this.addresseeId
                }
            });
        }
    }
</script>

<style lang="stylus" scoped>
    form
        box-sizing border-box
        display flex
        padding 10px
        width 100%

        div
            flex-grow 1

    input
        height 100%
        padding-left 10px
        width 100%

    button
        background-color $blue
        border 0
        width 140px

        @media (max-width 679px)
            width 108px

        @media (max-width 499px)
            width 100px

        @media (max-width 359px)
            width 92px

        &:hover
            background-color $blueHover
            border-color $blueHover
</style>
