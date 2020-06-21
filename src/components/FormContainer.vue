<template functional>
    <div class="form-container">
        <p v-if="parent.text.instructions" class="instructions" v-html="parent.text.instructions"/>
        <form :action="parent.urlFullGet()" method="post" @submit.prevent="parent.submitOn">
            <template v-for="([elementName, element]) in parent.elementsEntries">
                <label v-if="element.labelTop" :key="`${elementName}-labelTop`" class="label-top" v-html="`${element.labelTop}:`"/>
                <div :key="`${elementName}-element`" class="element" :class="{[`error-show`]: element.errorShow}">
                    <label :for="parent.idGet({elementName})" v-html="`${new parent.$String(parent.texts.dictionary[elementName]).capitalize()}:${element.required ? `*` : ``}`"/>
                    <input :key="`${elementName}-input`" :id="parent.idGet({elementName})" :autocomplete="element.autocomplete"
                           :minlength="element.length.min" :maxlength="element.length.max" :style="{color: element.color}" :type="element.input" :value="element.value"
                           @blur="parent.blurOn({element})" @focus="parent.focusOn({element})" @input="parent.propertiesUpdate({element, props: {value: $event.target.value}})">
                    <div v-if="element.errorShow" class="input-alert" v-html="parent.alertHtmlGet({...element, targetType: element.name})"></div>
                </div>
            </template>
            <p class="required-fields-legend" v-html="parent.texts.form.requiredFields"/>
            <button class="bordered-button" v-html="parent.text.submit || parent.texts.form.submit"/>
        </form>
    </div>
</template>

<script lang="ts">
    export default {
        name: `FormContainer`
    };
</script>

<style lang="stylus" scoped>
    .instructions
        margin-bottom 30px

    form
        box-sizing border-box
        display inline-block
        margin auto
        width auto

        @media (min-width 1024px)
            padding-horizontal 15px

        @media (max-width 599px)
            max-width 500px
            width 100%

        .label-top
            display inline-block
            margin-vertical 20px

    .element
        display grid
        grid-template-areas "label input"
        grid-template-columns auto 400px

        &:last-child
            padding-bottom 0

        @media (max-width 599px)
            grid-template-areas "label" "input"
            grid-template-columns repeat(2, 100%)
            padding-bottom 5px
            text-align left

        label
            grid-area label
            padding-right .5em
            text-align right

            @media (max-width 599px)
                text-align left

        input
            grid-area input
            margin-bottom 20px
            width 100%

    .text-container
        width 100%

        @media (max-width 1023px)
            box-sizing border-box

        @media (max-width 599px)
            max-width 400px

    .input-alert
        left calc(100% + 1.15em + 1px)
        padding-horizontal .4em .75em
        z 1

        @media (max-width 1023px)
            bottom auto
            left 100px
            right auto
            top (2.3 * 1.5) em

        @media (max-width 599px)
            left 0
            top (2.3 * 2.5) em

        &:after
            border-right 1.15em solid $errorFontColor
            left calc(-1.15em - 1px)

            @media (max-width 1023px)
                border-bottom-color $errorFontColor
                border-top 0
                border-vertical 1.15em transparent
                bottom auto
                left 10px
                top calc(-1.15em - 1px)

    .required-fields-legend
        margin-top 10px
        width 100%

    button
        margin-top 1em

        &:hover
            font-color $sectionGray
</style>
