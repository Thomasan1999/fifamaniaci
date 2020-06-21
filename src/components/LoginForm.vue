<template>
    <form class="login-form" :action="urlFullGet()" autocomplete="on" method="get" @submit.prevent="submitOn">
        <div v-for="(element, elementName) in elements" :key="elementName" class="element" :class="{[`error-show`]: element.errorShow}" ref="elements">
            <input :autocomplete="element.autocomplete" :id="idGet({elementName})" :maxlength="element.length.max"
                   :minlength="element.length.min" :placeholder=" new $String(texts.dictionary[elementName]).capitalize()" :type="element.input" :value="element.value"
                   @blur="blurOnCustom({element, $event})" @focus="focusOn({$event})"
                   @input="propertiesUpdate({element, props: {value: $event.target.value, ...(element.type === `password` && {errorShow: false, taken: true})}})">
            <div v-if="element.errorShow" class="input-alert" v-html="alertHtmlGet({...element, targetType: element.name})"></div>
        </div>
        <button class="bordered-button" v-html="texts.form.login.submit"/>
    </form>
</template>

<script lang="ts">
    import {mixins}                   from 'vue-class-component';
    import {Component}                from 'vue-property-decorator';
    import MainMixin                  from '@/mixins/Main';
    import RegistrationLoginFormMixin from '@/mixins/RegistrationLoginForm';
    // eslint-disable-next-line no-unused-vars
    import {VueHttpResponse}          from '@/plugins/VueHttp';

    @Component({
        name: `LoginForm`
    })
    export default class LoginForm extends mixins(MainMixin, RegistrationLoginFormMixin)
    {
        public blurOnCustom({element, $event}: {element: FormElement, $event: FocusEvent}): void
        {
            this.blurOn({element});
            this.$emit(`blur`, $event);
        }

        public focusOn({$event}: {$event: FocusEvent}): void
        {
            this.$emit(`focus`, $event);
        }

        public responseOn(res: VueHttpResponse): void
        {
            if (!res.ok)
            {
                if (res.body.message === `User not found`)
                {
                    this.propertiesUpdate({element: this.elements.email, inputting: false, props: {taken: false}});
                }
                else
                {
                    this.propertiesUpdate({element: this.elements.password, inputting: false, props: {taken: false}});
                }

                return;
            }

            this.$store.dispatch(`login`, res).catch((err) =>
            {
                console.error(err);
                return Promise.reject(err);
            });
        }

        public submitOn(): void
        {
            Object.values(this.elements).forEach((element) =>
            {
                this.propertiesUpdate({element, inputting: false, props: {valid: true}});
            });

            this.formSubmit({categoryInclude: true});
        }

        public validityGet({element: {required, taken, validateRegex, validLength, value}}: {element: FormElement}): boolean
        {
            return (validateRegex.test(value) || (!value && !required)) && taken && validLength;
        }

        public tableName: string = `users`;
        public alertTypesActive: string[] =  [`empty`, `short`, `long`, `invalid`, `notFound`];
        public url: string = `login`;

        public created(): void
        {
            this.elements = this.elementsCreate({
                email: {
                    order: 0,
                    type: `email`
                },
                password: {
                    order: 1,
                    type: `password`
                }
            });
        }
    }
</script>

<style lang="stylus" scoped>
    .login-form
        box-sizing border-box
        padding 0 $navPaddingLeft
        text-align center
        width 100%

    *
        font-size 16px

        @media (max-width 679px)
            font-size 14px

        @media (max-width 499px)
            font-size 13px

        @media (max-width 359px)
            font-size 12px

    button
        font-size 16px
        margin-top 18px

        &:hover
            font-color #2b2b2b

        @media (max-width 767px)
            margin-top 8px

    .element
        padding-vertical 0

        &:first-child
            padding-bottom 12px

            @media (max-width 767px)
                padding-bottom 6px

        input
            width 100%

    .input-alert
        bottom auto
        left calc(100% + 1.15em + 1px)
        padding-horizontal .4em .75em

        @media (max-width 767px)
            bottom auto
            left 0
            right auto
            top calc(100% + 1.15em - 5px)
            z 1

        &:after
            border-right 1.15em solid $errorFontColor
            left calc(-1.15em - 1px)

            @media (max-width 767px)
                border-bottom-color $errorFontColor
                border-top 0
                border-vertical 1.15em transparent
                bottom auto
                left 10px
                top calc(-1.15em - 1px)

    .element
        &.error-show
            input
                +placeholder()
                    font-color #cc0000

        *
            font-size 16px
</style>
