<template>
    <b-card class="timetable-elem" no-body>
        <template v-slot:header>
            <h6 class="mb-0">
                <strong>{{subject.name}} - {{subject.type}}</strong>
            </h6>
        </template>

        <b-card-body>
            <b-row>
                <b-col>
                    <strong>Professor: </strong>
                </b-col>
                <b-col>
                    <i>{{professor.firstName + ' ' + professor.secondName}}</i>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <strong>Location: </strong>
                </b-col>
                <b-col>
                    <i>{{lesson.location + ', ' + lesson.auditory}}</i>
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <strong>Groups: </strong>
                </b-col>
                <b-col>
                    <ul v-bind:key="g.id" v-for="g in groups">
                        <li>
                            <i>{{g.number}}</i>
                        </li>
                    </ul>
                </b-col>
            </b-row>
        </b-card-body>

        <template v-slot:footer>
            <h6 class="mb-0">
                <i>{{intToTime(lesson.startTime)}}</i>
                -
                <i>{{intToTime(lesson.startTime + lesson.duration)}}</i>
            </h6>
        </template>
    </b-card>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";

	export default {
		name: "UserLesson",
		props: {
			lesson: Object
		},
		data() {
			return {
				subject: {},
				professor: {},
				groups: []
			}
		},
		methods: {
			intToTime: function (seconds) {
				let hours = Math.floor(seconds / 3600);
				let minutes = Math.floor((seconds - 3600 * hours) / 60);
				return `${hours}:${minutes}` + (minutes === 0 ? '0' : '');
			},
			fetchProfessor: function () {
				axios.get(API_SERVER_PATH + `/lesson/${this.lesson.id}/professor`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					axios.get(API_SERVER_PATH + `/professor/${response.data['id']}/user`, {
						headers: {
							'Authorization': 'Bearer ' + this.$store.getters['security/token']
						}
					}).then((response) => {
						this.professor = response.data;
					})
				})
			},
			fetchSubject: function () {
				axios.get(API_SERVER_PATH + `/lesson/${this.lesson.id}/subject`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.subject = response.data;
				})
			},
			fetchGroups: function () {
				axios.get(API_SERVER_PATH + `/lesson/${this.lesson.id}/groups`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
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
			}
		},
		mounted() {
			this.fetchGroups();
			this.fetchSubject();
			this.fetchProfessor();
		}
	}
</script>

<style scoped>
    .timetable-elem:hover {
        background-color: lightgray;
    }

    .timetable-elem {
        background-color: whitesmoke;
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 5px;
        font-size: 20px;
    }
</style>
