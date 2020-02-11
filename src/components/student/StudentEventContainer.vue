<template>
    <div>
        <user-event-container :user-id="user.id" v-if="user.id"/>
        <b-row class="text-centered" v-else>
            <b-spinner label="Spinning" variant="success"/>
        </b-row>
        <b-row class="text-centered">
            <b-alert show v-if="fetchError !== ''" variant="danger">
                {{fetchError}}
            </b-alert>
        </b-row>
    </div>
</template>

<script>
	import UserEventContainer from "@/components/common/events/UserEventContainer";
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";

	export default {
		name: "StudentEventContainer",
		data() {
			return {
				user: {},
				fetchError: ''
			}
		},
		components: {UserEventContainer},
		mounted() {
			axios.get(API_SERVER_PATH + `/student/${this.$store.getters['security/id']}/user`, {
				headers: {
					'Authorization': 'Bearer ' + this.$store.getters['security/token']
				}
			}).then((response) => {
				this.fetchError = '';
				this.user = response.data;
			}).catch((error) => {
				if (error.response) {
					this.fetchError = error.response.data;
				} else if (error.request) {
					this.fetchError = "Server does not respond.";
				}
			});
		}
	}
</script>

<style scoped>

</style>
