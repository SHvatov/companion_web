<template>
    <div>
        <b-card class="event-card" no-body>
            <template v-slot:header>
                <h4 class="mb-0">
                    <b-row>
                        <b-col>
                            <strong>{{current.event.title}}</strong>
                        </b-col>
                        <b-col>
                            <b-badge pill v-if="eventType === 0" variant="danger">Passed</b-badge>
                            <b-badge pill v-if="eventType === 1" variant="primary">Future</b-badge>
                            <b-badge pill v-else variant="warning">Ongoing</b-badge>
                        </b-col>
                    </b-row>
                </h4>
            </template>

            <b-card-body>
                <b-row>
                    <b-col sm="2">
                        <div class="event-card-elem text-center">
                            <strong><i>Description</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="event-card-elem text-center">
                            {{current.event.description}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="event-card-elem text-center">
                            <strong><i>Dates</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="event-card-elem text-center">
                            {{current.event.startDate.slice(0, 19).replace('T', ' ') + ' - ' +
                            current.event.endDate.slice(0, 19).replace('T', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="event-card-elem text-center">
                            <strong><i>Participants</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="event-card-elem text-center">
                            {{current.event.participantType}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="event-card-elem text-center">
                            <strong><i>Visitors</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="event-card-elem text-center">
                            {{current.visitors ? current.visitors + ' are going to visit' : 'Nobody has signed up yet'}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="event-card-elem text-center">
                            <strong><i>Attachments</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <b-row v-if="current.attachments.length === 0">
                            <b-col>
                                <div class="event-card-elem text-center">
                                    <strong>Empty</strong>
                                </div>
                            </b-col>
                        </b-row>
                        <b-row v-bind:key="a.id" v-for="a in current.attachments">
                            <b-col>
                                <div class="event-card-elem text-center">
                                    <b-link :href="a.endpointUrl + '/' + a.fileBucket + '/' + a.fileKey">
                                        {{a.fileKey}}
                                    </b-link>
                                </div>
                            </b-col>
                        </b-row>
                    </b-col>
                </b-row>
                <b-row class="text-centered" sm="12" v-if="requestError !== ''">
                    <b-col>
                        <div class="text-center">
                            <b-alert show variant="danger">
                                {{requestError}}
                            </b-alert>
                        </div>
                    </b-col>
                </b-row>
            </b-card-body>

            <template v-slot:footer>
                <h6 class="mb-0">
                    <b-button :variant="current.status ? 'danger' : 'success'" @click="participateClick" block>
                        {{current.status ? 'Cancel' : 'Participate'}}
                    </b-button>
                </h6>
            </template>
        </b-card>
    </div>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";

	export default {
		name: "UserEventView",
		props: {
			userId: Number,
			current: Object,
			fetchFunction: Function
		},
		data() {
			return {
				requestError: ''
			}
		},
		computed: {
			eventType: function () {
				let now = new Date();
				if (new Date(this.current.endDate).getTime() < now.getTime()) {
					return 0;
				} else if (new Date(this.current.event.startDate).getTime() > now.getTime()) {
					return 1;
				}
				return 2;
			}
		},
		methods: {
			participateClick: function () {
				if (this.current.status) {
					this.refuse();
				} else {
					this.participate();
				}
			},
			participate: function () {
				axios({
					method: 'put',
					url: API_SERVER_PATH + `/event/${this.current.event.id}/${this.userId}/participate/`,
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.requestError = '';
					this.fetchFunction();
				}).catch((error) => {
					if (error.response) {
						this.requestError = error.response.data;
					} else if (error.request) {
						this.requestError = "Server does not respond.";
					}
				})
			},
			refuse: function () {
				axios({
					method: 'put',
					url: API_SERVER_PATH + `/event/${this.current.event.id}/${this.userId}/refuse/`,
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.requestError = '';
					this.fetchFunction();
				}).catch((error) => {
					if (error.response) {
						this.requestError = error.response.data;
					} else if (error.request) {
						this.requestError = "Server does not respond.";
					}
				})
			}
		}
	}
</script>

<style scoped>
    .event-card {
        margin: 10px;
        padding: 5px;
    }

    .event-card-elem {
        margin: 5px;
        padding: 10px;
        font-size: 22px;
        border-radius: 10px;
        background-color: whitesmoke;
    }
</style>
