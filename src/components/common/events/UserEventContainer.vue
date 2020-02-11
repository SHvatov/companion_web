<template>
    <div class="event-container">
        <b-row>
            <b-col>
                <div class="text-center timer-container">
                    <strong>Last updated: {{lastUpdated / 60000}} minutes ago</strong>
                </div>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-button @click="fetchEvents" block>
                    Update events list
                </b-button>
            </b-col>
        </b-row>
        <b-row v-bind:key="e.event.id" v-for="e in eventsSortedByDate">
            <b-col>
                <div>
                    <user-event-view :current="e"
                                     :fetch-function="fetchEvents"
                                     :user-id="userId"/>
                </div>
            </b-col>
        </b-row>
        <b-row v-if="Object.keys(events).length === 0">
            <b-col>
                <div class="event-not-found text-center">
                    <strong>No events for you were found.</strong>
                </div>
            </b-col>
        </b-row>

        <b-row class="text-centered">
            <b-alert show v-if="fetchError !== ''" variant="danger">
                {{fetchError}}
            </b-alert>
        </b-row>
    </div>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";
	import UserEventView from "@/components/common/events/UserEventView";

	export default {
		name: "UserEventContainer",
		components: {UserEventView},
		props: {
			userId: Number
		},
		data() {
			return {
				fetchError: "",
				events: {},
				polling: null,
				timer: null,
				lastUpdated: 0
			}
		},
		computed: {
			eventsSortedByDate() {
				return Object.values(this.events).sort(function (a, b) {
					return new Date(a.event.startDate).getTime() - new Date(b.event.endDate).getTime();
				});
			}
		},
		methods: {
			pollData: function () {
				this.polling = setInterval(() => {
					this.fetchEvents();
				}, 600000);
			},
			startTimer: function () {
				this.timer = setInterval(() => {
					this.lastUpdated += 60000;
				}, 60000)
			},
			fetchStatus: function (eventId) {
				axios.get(API_SERVER_PATH + `/event/${eventId}/is_participating/${this.userId}`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.lastUpdated = 0;
					this.events = Object.assign({}, this.events, {
						[eventId]: {
							event: this.events[eventId].event,
							visitors: this.events[eventId].visitors,
							attachments: this.events[eventId].attachments,
							status: response.data
						}
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchAttachments: function (eventId) {
				axios.get(API_SERVER_PATH + `/event/${eventId}/attachments`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.events = Object.assign({}, this.events, {
						[eventId]: {
							event: this.events[eventId].event,
							visitors: this.events[eventId].visitors,
							attachments: response.data,
							status: this.events[eventId].status
						}
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchVisitors: function (eventId) {
				axios.get(API_SERVER_PATH + `/event/${eventId}/visitors`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.events = Object.assign({}, this.events, {
						[eventId]: {
							event: this.events[eventId].event,
							visitors: response.data,
							attachments: this.events[eventId].attachments,
							status: this.events[eventId].status
						}
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchEvents: function () {
				axios.get(API_SERVER_PATH + `/event/${this.userId}/suitable`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.events = {};
					for (let e of response.data) {
						Object.assign(this.events, {
							[e.id]: {
								event: e,
								attachments: [],
								visitors: 0,
								status: false
							}
						});
						this.fetchAttachments(e.id);
						this.fetchVisitors(e.id);
						this.fetchStatus(e.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
		},
		mounted() {
			this.fetchEvents();
			this.pollData();
			this.startTimer();
		},
		beforeDestroy() {
			clearInterval(this.polling);
			clearInterval(this.timer);
		}
	}
</script>

<style scoped>
    .event-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .timer-container {
        margin: 10px;
        padding: 10px;
        background-color: whitesmoke;
        border-radius: 10px;
    }

    .event-not-found {
        margin: 5px;
        padding: 10px;
        font-size: 30px;
        border-radius: 10px;
        background-color: whitesmoke;
    }
</style>
