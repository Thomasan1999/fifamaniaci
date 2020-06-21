<template>
    <form-section/>
</template>

<script lang="ts">
    import {Component}      from 'vue-property-decorator';
    import {mixins}         from 'vue-class-component';
    import FormSectionMixin from '@/mixins/FormSection';
    import FormSection      from '@/components/FormSection.vue';
    import MainMixin        from '@/mixins/Main';

    @Component({
        components: {
            FormSection
        },
        name: `PasswordResetEmail`
    })
    export default class PasswordResetEmail extends mixins(MainMixin, FormSectionMixin)
    {
        public validityGet({element: {required, taken, validateRegex, validLength, value}}: {element: FormElement}): boolean
        {
            return (validateRegex.test(value) || (!value && !required)) && taken && validLength;
        }

        public tableName: string = `users`;
        public alertTypesActive: string[] = [`empty`, `short`, `long`, `invalid`, `notFound`];
        public url: string = `passwordResetEmail`;

        public created(): void
        {
            this.elements = this.elementsCreate({
                email: {
                    order: 0,
                    type: `email`
                }
            });
        }
    }
</script>

<style lang="stylus" scoped>
</style>
