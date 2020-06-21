<template>
    <div v-if="!categoriesActive && params.division && params.season" class="categories-select">
        <router-link v-for="(category, categoryId) in $store.state.categories.value" :key="categoryId" class="box" :class="new $String(category.name).urlTo()"
                     :to="redirectGet(category.name)" @click.native="$store.dispatch(`categoriesActiveSet`, categoryId)">
            <origin v-if="category.name.includes(`pc`)"/>
            <font-awesome-icon v-else :icon="[`fab`, {ps4: `playstation`, xboxOne: `xbox`}[category.name.replace(`Fut`, ``)]]"/>
            <p v-html="texts.categories[category.name]"/>
        </router-link>
    </div>
</template>

<script lang="ts">
    import {mixins}           from 'vue-class-component';
    import {Component, Watch} from 'vue-property-decorator';
    import Origin             from '../components/svg/Origin.vue';
    import MainMixin          from '../mixins/Main';

    @Component({
        components: {
            Origin
        },
        name: `CategoriesSelect`
    })
    export default class CategoriesSelect extends mixins(MainMixin)
    {
        public async redirectCheck(): Promise<void>
        {
            if (await this.$store.dispatch(`categoriesActiveCalc`))
            {
                this.$router.push(this.redirectGet(this.$store.state.categories.value[this.categoriesActive].name)).catch((err) =>
                {
                    console.error(err);
                });
            }
        }

        public redirectGet(categoryName: string): {
            name: string,
            params: { [s: string]: string }
        }
        {
            return {name: `leagueRegistration`, params: {...this.params, category: new this.$String(categoryName).urlTo()}};
        }

        public get params(): { [s: string]: string }
        {
            return this.$store.getters.params;
        }

        @Watch('$store.state.categories.value')
        public async '$store.state.categories.valueChangeOn'(): Promise<void>
        {
            await this.redirectCheck();
        }

        public async created(): Promise<void>
        {
            await this.redirectCheck();
        }
    }
</script>

<style lang="stylus" scoped>
    .categories-select
        display grid
        grid-auto-flow column
        grid-template-columns repeat(3, minmax(0, 1fr))
        grid-template-rows repeat(2, minmax(0, 1fr))
        height 100%
        width 100%

        @media (max-width 767px)
            grid-auto-flow row
            grid-template-columns repeat(2, minmax(0, 1fr))
            grid-template-rows repeat(3, minmax(0, 1fr))

    .box
        align-items center
        display flex
        flex-direction column
        height 100%
        justify-content center
        width 100%

        &:hover
            background-color $blue
            font-color #ffffff

            >>> path
                fill #ffffff

        svg
            font-size 140px
            height 140px
            margin-bottom 25px
            transition 0s

            @media (max-width 1023px)
                font-size 110px
                height 110px
                margin-bottom 20px

            @media (max-width 549px)
                font-size 90px
                height 90px

            @media (max-width 399px)
                font-size 70px
                height 70px


            >>> path
                transition .25s

        p
            font-size 36px

            @media (max-width 1023px)
                font-size 30px

            @media (max-width 549px)
                font-size 26px

            @media (max-width 399px)
                font-size 22px

    .ps4, .ps4-fut
        font-color #3884ff

    .xbox-one, .xbox-one-fut
        font-color #4eec4b

    .pc, .pc-fut
        font-color #f67a41
</style>
