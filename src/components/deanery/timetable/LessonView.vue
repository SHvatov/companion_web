<template>
    <b-card no-body style="margin: 5px 5px 10px;">
        <template v-slot:header>
            <h6 class="mb-0">
                {{subject.name}} - {{subject.type}}
            </h6>
        </template>
        <b-card-body>
            <b-row>
                <b-col><strong>Start: </strong></b-col>
                <b-col>{{intToTime(current.startTime)}}</b-col>
            </b-row>
            <b-row>
                <b-col><strong>Duration: </strong></b-col>
                <b-col>{{current.duration / 3600}} h.</b-col>
            </b-row>
            <b-row>
                <b-col><strong>Location: </strong></b-col>
                <b-col>{{current.location}}</b-col>
            </b-row>
            <b-row>
                <b-col><strong>Auditory: </strong></b-col>
                <b-col>{{current.auditory}}</b-col>
            </b-row>
            <b-row>
                <b-col><strong>Groups: </strong></b-col>
                <b-col>
                    <ul v-bind:key="g.id" v-for="g in groups">
                        <li>{{g.number}}</li>
                    </ul>
                </b-col>
            </b-row>
            <b-row>
                <b-button block v-b-modal="'delete-lesson-' + current.id" variant="danger">
                    Delete
                </b-button>
                <b-modal :id="'delete-lesson-' + current.id" @cancel="clearErrors"
                         @ok="deleteLesson" cancel-variant="success"
                         centered ok-variant="danger"
                         ref="modal"
                         title="Are you sure?"
                >
                    Are you sure that you want to delete this lesson?
                    <b-alert show v-if="deleteError !== ''" variant="danger">
                        {{deleteError}}
                    </b-alert>
                </b-modal>
            </b-row>
            <b-row>
                <b-alert show v-if="fetchError !== ''" variant="danger">
                    {{fetchError}}
                </b-alert>
            </b-row>
        </b-card-body>
    </b-card>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";

	export default {
		name: "LessonView",
		props: {
			current: Object,
			onDelete: Function
		},
		data() {
			return {
				subject: '',
				groups: [],
				fetchError: '',
				deleteError: ''
			}
		},
		methods: {
			intToTime: function (seconds) {
				let hours = Math.floor(seconds / 3600);
				let minutes = Math.floor((seconds - 3600 * hours) / 60);
				return `${hours}:${minutes}` + (minutes === 0 ? '0' : '');
			},
			fetchSubject: function () {
				axios.get(API_SERVER_PATH + `/lesson/${this.current.id}/subject`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subject = response.data;
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			fetchGroups: function () {
				axios.get(API_SERVER_PATH + `/lesson/${this.current.id}/groups`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.groups.splice(0, this.groups.length);
					for (let g of response.data) {
						this.groups.push(g);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			deleteLesson: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/lesson/${this.current.id}/delete`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.onDelete();
					this.$nextTick(() => {
						this.$refs.modal.hide();
					});
				}).catch((error) => {
					if (error.response) {
						this.deleteError = error.response.data;
					} else if (error.request) {
						this.deleteError = "Server does not respond.";
					}
				});
			},
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.fetchError = '';
				this.deleteError = '';
			}
		},
		mounted() {
			this.fetchSubject();
			this.fetchGroups();
		}
	}
</script>

<style scoped>

</style>
