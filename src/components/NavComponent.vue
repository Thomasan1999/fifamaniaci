<template>
    <nav :class="{visible}" @click="clickOn">
        <loading-container :condition="Boolean(categoriesActive) && (!userLogged.loggedIn || Boolean(userLogged.username))">
            <div class="row-upper">
                <div class="bar-icon-container" @click="barIconClickOn">
                    <bar-icon/>
                </div>
                <logo/>
                <p v-show="$store.getters.touchscreen" class="section-active" v-html="sectionsActive && texts[sectionsActive].title"/>
            </div>
            <div class="content">
                <div class="user-container">
                    <p v-if="userLogged.loggedIn" class="top-row">
                        <username-container :user-id="userLogged.id"/>
                        <span class="money-container">
                        <span v-html="new $String(`\${currency|money}`).htmlParse({money: userLogged.money})"/>
                    </span>
                    </p>
                    <login-form v-else/>
                    <div class="user-link-container">
                        <logout-form v-if="userLogged.loggedIn" class="logout-form"/>
                        <template v-else>
                            <router-link class="forgotten-password" v-html="texts.passwordResetEmail.title" :to="sections.passwordResetEmail.href" @click.native="linkClickOn"/>
                            <router-link v-html="texts.registration.submit" :to="sections.registration.href" @click.native="linkClickOn"/>
                        </template>
                    </div>
                </div>
                <div class="link-container">
                    <select class="categories-select" @change="categoryChangeOn">
                        <option v-for="(category, categoryId) in categories" :key="category.name" :selected="parseInt(categoryId) === categoriesActive"
                                :value="categoryId" v-html="texts.categories[category.name]"/>
                    </select>
                    <router-link v-for="[linkName, link] in links" :key="linkName" :to="sections[linkName].href" @click.native="linkClickOn">
                        <span v-html="texts[linkName].title"/>
                        <span v-if="link.disabled" class="soon" v-html="texts.soon"/>
                        <unseen-box-container v-if="unseen[linkName]" :count="unseen[linkName]"/>
                    </router-link>
                </div>
                <div class="copyright">
                    <footer v-html="texts.copyright">
                    </footer>
                </div>
            </div>
            <div v-if="$store.getters.touchscreen && visible" class="shadow" @click="() => $store.commit(`set`, {props: {navVisible: false}})">
            </div>
        </loading-container>
    </nav>
</template>

<script lang="ts">
    import {mixins}           from 'vue-class-component';
    import {Component, Prop}  from 'vue-property-decorator';
    import BarIcon            from '@/components/svg/BarIcon.vue';
    import LoginForm          from '@/components/LoginForm.vue';
    import Logo               from '@/components/svg/Logo.vue';
    import UnseenBoxContainer from '@/components/unseen/UnseenBoxContainer.vue';
    import LogoutForm         from '@/components/LogoutForm.vue';
    import UsernameContainer  from '@/components/UsernameContainer.vue';
    import MainMixin          from '@/mixins/Main';

    @Component({
        components: {
            UsernameContainer,
            LogoutForm,
            BarIcon,
            LoginForm,
            Logo,
            UnseenBoxContainer
        },
        name: `NavComponent`
    })
    export default class NavComponent extends mixins(MainMixin)
    {
        @Prop({required: true, type: Array}) public readonly links!: any[];
        @Prop({required: true, type: Object}) public readonly sections!: any;

        public barIconClickOn(): void
        {
            this.$store.commit(`set`, {props: {navVisible: !this.visible}});
        }

        public async categoryChangeOn($event: Merge<InputEvent, {target: HTMLSelectElement}>): Promise<void>
        {
            const {dispatch, getters} = this.$store;

            const categoryOldName = this.categories[this.categoriesActive].name;

            const categoryNewName = this.categories[$event.target.value].name;
            const category = new this.$String(categoryNewName).urlTo();

            const name: string = (this.$route.name as string).replace(
                new RegExp(`${new this.$String(categoryOldName).capitalize()}$`, ``),
                new this.$String(categoryNewName).capitalize().toString()
            );

            this.$router.push({
                name: this.$router.resolve({name}).resolved.matched.length > 0 ? name : this.sectionsActive,
                params: {...getters.params, category}
            }).catch((err) =>
            {
                console.error(err);
            });

            await dispatch(`categoriesActiveSet`, parseInt($event.target.value)).catch((err) =>
            {
                console.error(err);
            });
        }

        public clickOn($event: Merge<MouseEvent, {target: HTMLElement}>): void
        {
            if ($event.target.closest(`.categories-select`))
            {
                return;
            }

            this.$store.commit(`set`, {props: {keyMode: `nav`}});
        }

        public async linkClickOn(): Promise<void>
        {
            const {commit, getters} = this.$store;

            if (getters.touchscreen)
            {
                commit(`set`, {props: {navVisible: false}});
            }
        }

        public get categories(): any
        {
            return this.$store.state.categories.value;
        }

        public get unseen(): any
        {
            return this.$store.state.sections.unseen;
        }

        public get userLogged()
        {
            return this.$store.state.userLogged;
        }

        public get visible(): boolean
        {
            return this.$store.state.navVisible;
        }
    }
</script>

<style lang="stylus" scoped>
    $barIconContainerHeight = ($barIconHeight + 30)
    $barIconContainerWidth = ($barIconWidth + 30)

    nav
        background-color $tableDark
        box-shadow $boxShadowRight
        height 100%
        left (-($navWidth))
        position absolute
        transition left .5s
        width $navWidth
        z 3

        @media (max-width 1023px)
            box-shadow $boxShadowBottom
            height $navAppHeightTouchscreen
            left 0
            width 100%

        &.visible
            left 0

            .content
                @media (max-width 1023px)
                    left 0

        & > .loading-container
            background-color inherit
            height 100%

    .bar-icon-container
        background-color $tableLight
        border-color #404040
        border-horizontal 2px
        border-right 2px
        border-bottom-right-radius 3px
        border-top-right-radius 3px
        cursor pointer
        height $barIconContainerHeight
        left 0
        position fixed
        top (($navAppHeight - 48) / 2) px
        width $barIconContainerWidth

        @media (max-width 1023px)
            background-color transparent
            border 0
            height $navAppHeightTouchscreen
            top 0

    .row-upper
        display flex
        height $navAppHeight
        left 0
        position absolute
        top 0
        width 100%
        z 2

        @media (max-width 1023px)
            height $navAppHeightTouchscreen

    .content
        background-color inherit
        display flex
        flex-direction column
        height 100vh
        height: calc(var(--vh, 1vh) * 100);
        position absolute
        transition left .5s
        top 0
        width $navWidth

        @media (max-width 1023px)
            box-shadow $boxShadowBottom
            left (-($navWidthTouchscreen) - $boxShadowBlur)
            width $navWidthTouchscreen

    .shadow
        height 100vh
        height: calc(var(--vh, 1vh) * 100);
        position absolute
        right 0
        top 0
        width 100vw
        z -1

    .categories-select
        display inline-block
        height $navLineHeight
        line-height $navLineHeight
        padding-left $navPaddingLeft

    .link-container
        box-sizing border-box
        display flex
        flex-direction column
        font-size 18px
        height 100%
        justify-content center
        width 100%

        @media (max-width 679px), (max-height 690px)
            font-size 16px

        @media (max-width 499px)
            font-size 14px

        @media (max-width 359px)
            font-size 13px

        @media (max-height 920px)
            flex-grow 1
            height auto

        a
            box-sizing border-box
            display flex
            height $navLineHeight
            line-height $navLineHeight
            padding-left $navPaddingLeft
            position relative

            &:hover:not(.router-link-active):not(.disabled)
                background-color $tableLight

        .router-link-active
            background-color $blue

    .logo
        display block
        height auto
        margin $logoMarginVertical 15px $logoMarginVertical (15px + $barIconContainerWidth)
        width $logoWidth

        @media (max-width 1023px)
            margin $logoMarginVerticalTouchscreen 0 $logoMarginVerticalTouchscreen $barIconContainerWidth

    .money-container
        align-items center
        display inline-flex
        margin-left auto

    .user-link-container
        text-align center

    .user-container
        >>> a
            display block
            text-decoration underline
            transition .25s

            &:hover
                font-color lighten($tableLight, 50%)

        .router-link-active
            font-color $blue

    .forgotten-password
        font-size .8em
        margin-bottom 12px
        margin-top 4px

        @media (max-width 767px)
            margin-bottom 7px

    .logout-form
        margin-top 12px

        @media (max-width 767px)
            margin-top 7px

    .section-active
        background-color $league
        box-shadow $boxShadowBottom
        flex-grow 1
        font-size 18px
        line-height $navAppHeightTouchscreen
        margin-left 15px
        padding-horizontal 15px
        text-align center
        z 1

        @media (max-width 679px)
            font-size 16px

        @media (max-width 499px)
            font-size 14px

        @media (max-width 359px)
            font-size 13px

    .user-container
        display flex
        flex-direction column
        left 0
        margin-top $navAppHeight
        position absolute
        top 0
        width 100%

        @media (max-width 1023px)
            margin-top ($navAppHeightTouchscreen + 10px)

        @media (max-width 767px)
            margin-top ($navAppHeightTouchscreen + 5px)

        @media (max-height 920px)
            position static

        & > p
            margin-horizontal 21px

        .top-row
            align-items center
            display flex

            & > *
                display inline-flex

        >>> .username-container
            justify-content center

    .copyright
        bottom 0
        font-size 15px
        left 0
        line-height 3em
        position absolute
        text-align center
        width 100%

        @media (max-width 679px)
            font-size 13px

        @media (max-width 499px)
            font-size 12px

        @media (max-height 920px)
            position static
</style>
