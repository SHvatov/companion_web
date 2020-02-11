<template>
    <div class="login-container">
        <b-form>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <h4>
                        <strong>Login</strong>
                    </h4>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Email">
                        <b-input id="username-input"
                                 type="text"
                                 v-model="email"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col offset="1" sm="10">
                    <b-input-group class="mb-2 mr-sm-2 mb-sm-0" prepend="Password">
                        <b-input id="password-input"
                                 type="password"
                                 v-model="password"
                        />
                    </b-input-group>
                </b-col>
            </b-row>
            <b-row class="login-form-elem">
                <b-col class="text-center">
                    <b-button @click="performLogin"
                              size="lg"
                              type="submit"
                              v-if="!authenticationInProgress"
                              variant="primary"
                    >
                        Login
                    </b-button>
                    <b-spinner label="Spinning" type="grow" v-else variant="primary"/>
                </b-col>
            </b-row>
            <b-row class="login-form-elem" v-if="authenticationError.length > 0">
                <b-col class="text-center" offset="1" sm="10">
                    <b-alert show variant="danger">{{authenticationError}}</b-alert>
                </b-col>
            </b-row>
        </b-form>
    </div>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";
	import {AUTHENTICATE, LOGOUT} from "@/store/modules/security";
	import {mapMutations} from "vuex";
	import {ROLE_DEANERY, ROLE_PROFESSOR, ROLE_STUDENT} from "../utils/constants";

	export default {
		name: "Login",
		data() {
			return {
				email: "",
				password: "",
				authenticationError: "",
				authenticationInProgress: false
			}
		},
		methods: {
			...mapMutations('security', {
				authenticate: AUTHENTICATE,
				logout: LOGOUT
			}),
			performLogin() {
				this.authenticationInProgress = true;
				axios.post(API_SERVER_PATH + "/auth/login", {
					email: this.email,
					password: this.password
				}).then((response) => {
					this.authenticationInProgress = false;
					this.authenticate({
						id: response.data['id'],
						userId: response.data['userId'],
						email: this.email,
						password: this.password,
						role: response.data['role'],
						token: response.data['token'],
					});

					if (response.data['role'] === ROLE_PROFESSOR) {
						this.$router.push('/professor/events');
					} else if (response.data['role'] === ROLE_STUDENT) {
						this.$router.push('/student/events');
					} else if (response.data['role'] === ROLE_DEANERY) {
						this.$router.push('/deanery/events')
					}
				}).catch((error) => {
					this.authenticationInProgress = false;
					if (error.response) {
						this.authenticationError = error.response.data
							+ ". Try again later.";
					} else if (error.request) {
						this.authenticationError = "Server does not respond.";
					}
					this.logout();
				});
			}
		}
	}
</script>

<style scoped>
    .login-container {
        padding: 3% 0;
        margin: 5% 35%;
        background-color: whitesmoke;
        width: 30%;
    }

    .login-form-elem {
        padding: 10px 0 5px 0;
        margin: 10px;
    }
</style>
