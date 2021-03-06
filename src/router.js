import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/lost-and-found/:token/:id?',
      name: 'lost-and-found',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "about" */ './views/LostAndFound.vue')
    },
    {
      path:'*',
      component: () => import('./views/Redirect.vue')
    }
  ]
})
