import Vue from 'vue';
import BootstrapVue from "bootstrap-vue";
import axios from "axios";
import VueAxios from "vue-axios";
import App from './App.vue';
import store from "./store";
import router from "./router";
import {Multiselect} from "vue-multiselect";

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';

// register globally
Vue.component('multiselect', Multiselect);
Vue.use(BootstrapVue);
Vue.use(VueAxios, axios);

new Vue({
	el: "#app",
	store,
	router,
	render: h => h(App),
});
