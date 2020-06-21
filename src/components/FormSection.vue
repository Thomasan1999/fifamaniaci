<template functional>
    <section v-if="props.sectionIs" class="form-section" :class="new parent.$String(parent.$options.name).urlTo()">
        <div class="text-container">
            <h1 class="title" v-html="new parent.$String(parent.text.title).htmlParse()"/>
            <component :is="props.components.FormContainer"/>
        </div>
    </section>
    <component v-else :is="props.components.FormContainer" :class="new parent.$String(parent.$options.name).urlTo()"/>
</template>

<script lang="ts">
    import FormContainer from '@/components/FormContainer.vue';

    export default {
        name: `FormSection`,
        props: {
            components: {
                type: Object,
                default()
                {
                    return {
                        FormContainer
                    };
                }
            },
            sectionIs: {
                default: true,
                type: Boolean
            }
        }
    };
</script>

<style lang="stylus" scoped>
    .form-section
        align-items center
        flex-direction row
        justify-content center

    .title
        margin-bottom 20px
</style>
