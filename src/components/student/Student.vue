<template>
    <div class="student-container">
        <b-navbar toggleable="lg" type="dark" variant="dark">
            <b-navbar-brand>
                <strong>Companion</strong>
            </b-navbar-brand>

            <b-collapse accordion="" id="nav-collapse" is-nav>
                <strong>
                    <b-navbar-nav fill>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/student/events"
                        >
                            Events
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/student/lessons"
                        >
                            Lessons
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/student/tasks/all"
                        >
                            Tasks
                        </b-nav-item>
                    </b-navbar-nav>
                </strong>
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right>
                        <template v-slot:button-content>
                            <strong>{{user.email}}</strong>
                        </template>
                        <b-dropdown-item disabled>
                            <strong>{{user.firstName + ' ' + user.secondName}}</strong>
                        </b-dropdown-item>
                        <b-dropdown-item to="/">Sign Out</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <b-row>
            <b-alert show v-if="fetchError !== ''" variant="danger">
                {{fetchError}}
            </b-alert>
        </b-row>
        <router-view>
        </router-view>
    </div>
</template>

<script>
	import {mapMutations} from "vuex";
	import {LOGOUT} from "@/store/modules/security";
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "Student",
		data() {
			return {
				user: {},
				fetchError: ''
			}
		},
		methods: {
			...mapMutations('security', {
				logout: LOGOUT
			})
		},
		mounted() {
			axios.get(API_SERVER_PATH + `/student/${this.$store.getters['security/id']}/user`, {
				headers: {
					'Authorization': 'Bearer ' + this.$store.getters['security/token']
				}
			}).then((response) => {
				this.fetchError = '';
				this.user = Object.assign({}, this.user, response.data);
			}).catch((error) => {
				if (error.response) {
					this.fetchError = error.response.data;
				} else if (error.request) {
					this.fetchError = "Server does not respond.";
				}
			})
		},
		beforeDestroy() {
			this.logout();
		}
	}
</script>

<style scoped>
    .student-container {
        background-color: whitesmoke;
        margin: 1% 1%;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 98%;
    }
</style>
