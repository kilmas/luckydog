<template>
  <b-navbar toggleable="lg" type="dark" variant="info">
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-navbar-brand href="/#">Luckydog</b-navbar-brand>
    <b-navbar-brand> <span class="fa fa-share" v-clipboard:copy="copyData" v-clipboard:success="onCopy" v-clipboard:error="onError"> </span></b-navbar-brand>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item @click.prevent="showRule">Rule</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">CN</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-form v-if="!account.name">
          <b-button size="sm" class="my-2 my-sm-0" @click="login">Login</b-button>
        </b-nav-form>
        <b-nav-form v-if="account.name">
          <b-button size="sm" class="my-2 my-sm-0" variant="primary" @click="addShow">{{ (myGameList[0] && myGameList[0].status) === '0' ? '设置商品' : '我也要拼团+' }}</b-button>
        </b-nav-form>
        <b-nav-item-dropdown right v-if="account.name">
          <!-- Using button-content slot -->
          <template slot="button-content">
            <em>{{ account.name ? account.name : '' }}</em>
          </template>
          <b-dropdown-item @click.prevent="signout">Signout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
import Vue from 'vue'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)

export default {
  props: {
    account: {
      default: {}
    },
    addShow: {
      default: () => {}
    },
    showRule: {
      default: () => {}
    },
    copyData: {
      default: ""
    },
    onCopy: {
      default: () => {}
    },
    onError: {
      default: () => {}
    },
    login: {
      default: () => {}
    },
    signout: {
      default: () => {}
    },
    myGameList: {
      default: []
    }
  },
  computed: {},
}
</script>
<style lang="scss" scoped></style>
