<template>
    <router-link v-if="user" class="username-container" :to="{name: `profile`, params: {username: user.username}}">
        <span v-if="connectivityShow" class="connectivity" :class="connectivity" :title="texts.connectivity[connectivity]"/>
        <span v-html="user.username"/>
        <span v-if="adminShow && user.admin" class="admin" v-html="` (${texts.user.admin})`"/>
        <span v-if="dnfShow" class="dnf" :title="texts.user.dnf.long" v-html="` (${texts.user.dnf.short})`"/>
    </router-link>
</template>

<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import {mixins}          from 'vue-class-component';
    import MainMixin         from '@/mixins/Main';

    @Component({
        name: `UsernameContainer`
    })
    export default class UsernameContainer extends mixins(MainMixin)
    {
        @Prop({default: false, type: Boolean}) public readonly adminShow!: boolean;
        @Prop({default: true, type: Boolean}) public readonly connectivityShow!: boolean;
        @Prop({default: false, type: Boolean}) public readonly dnfShow!: boolean;
        @Prop({required: true, type: Number}) public readonly userId!: number;

        public get connectivity(): Connectivity
        {
            return this.user.online?.includes(this.categoriesActive) ? `online` : `offline`;
        }

        public get user(): DeepReadonlyObject<Omit<UserValue, 'id'>>
        {
            const {state} = this.$store;
            const {userLogged} = state;

            return state.users.value[this.userId] || (userLogged.id === this.userId && {username: userLogged.username});
        }
    }
</script>

<style lang="stylus" scoped>
    .username-container
        align-items center
        display inline-flex
        flex-wrap wrap

        &:hover
            font-color lighten($tableLight, 50%)

        *
            transition 0s

        .admin, .dnf
            margin-left 4px
</style>
