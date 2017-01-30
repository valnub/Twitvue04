import Vue from 'vue'
import Home from './home.vue'
import Routes from './routes.js'
import Framework7 from 'Framework7'
import Framework7Vue from 'Framework7Vue'

document.addEventListener('deviceready', function () {
  
  Vue.use(Framework7Vue);

  new Vue({
    el: '#app',
    render: h => h(Home),
    framework7: {
        root: '#app',
        animateNavBackIcon: true,
        routes: Routes,
        material: true
    }
  });
});