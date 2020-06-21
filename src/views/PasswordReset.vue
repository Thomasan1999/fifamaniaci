<template>
    <form-section/>
</template>

<script lang="ts">
    import {Component}       from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import FormSectionMixin  from '../mixins/FormSection';
    import FormMixin         from '../mixins/RegistrationLoginForm';
    import MainMixin         from '@/mixins/Main';
    import FormSection       from '@/components/FormSection.vue';
    // eslint-disable-next-line no-unused-vars
    import {VueHttpResponse} from '@/plugins/VueHttp';

    @Component({
        components: {
            FormSection
        },
        name: `PasswordReset`
    })
    export default class PasswordReset extends mixins(MainMixin, FormMixin, FormSectionMixin)
    {
        public responseOn(res: VueHttpResponse): void
        {
            if (!res.ok)
            {
                if (res.body.message === `Password reset token invalid`)
                {
                    this.alertShow({alertType: `passwordResetTokenInvalid`, state: `failed`});
                }
            }
        }

        public tableName: string = `users`;
        public alertTypesActive: string[] = [`empty`, `short`, `long`, `invalid`, `notFound`];
        public url: string = `passwordReset`;

        public created(): void
        {
            this.elements = this.elementsCreate({
                passwordNew: {
                    order: 0,
                    type: `password`
                }
            });

            this.elementsExtra = this.elementsCreate({
                email: {
                    type: `email`,
                    value: this.$route.query.email
                },
                passwordResetToken: {
                    type: `password`,
                    value: this.$route.query.passwordResetToken
                }
            });
        }
    }
</script>

<style lang="stylus" scoped>
</style>
