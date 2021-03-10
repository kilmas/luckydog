import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
const Luckydog = () => import('../components/Luckydog.vue')
const LuckydogEdit = () => import('../components/LuckydogEdit.vue')
const LuckydogDetail = () => import('../components/LuckydogDetail.vue')

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  // mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  linkActiveClass: 'is-active',
  routes: [
    {
      path: '/',
      components: {
        default: Luckydog
      }
    },
    {
      path: '/edit',
      components: {
        default: LuckydogEdit
      }
    },
    {
      name: 'LuckydogDetail',
      path: '/detail/:id',
      components: {
        default: LuckydogDetail
      }
    }
  ]
})
