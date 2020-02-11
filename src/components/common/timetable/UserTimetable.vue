<template>
    <div class="timetable-container">
        <b-row class="text-centered">
            <b-spinner label="Spinning" v-if="isFetching" variant="success"/>
        </b-row>
        <b-row sm="12">
            <b-col class="timetable-header" v-bind:key="d.id" v-for="d in days">
                <strong>{{d.label}}</strong>
            </b-col>
        </b-row>
        <b-row>
            <b-col v-bind:key="d.id" v-for="d in days">
                <div v-bind:key="l.id" v-for="l in sortedLessons">
                    <user-lesson :lesson="l" v-if="parseInt(d.value) === l.day"/>
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
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";
	import UserLesson from "@/components/common/timetable/UserLesson";

	export default {
		name: "UserTimetable",
		components: {UserLesson},
		props: {
			path: String
		},
		data() {
			return {
				lessons: [],
				fetchError: '',
				isFetching: false,
				days: [
					{label: 'Monday', value: '1'},
					{label: 'Tuesday', value: '2'},
					{label: 'Wednesday', value: '3'},
					{label: 'Thursday', value: '4'},
					{label: 'Friday', value: '5'},
					{label: 'Saturday', value: '6'},
				]
			}
		},
		computed: {
			sortedLessons() {
				return Object.values(this.lessons).sort(function (a, b) {
					return a.startTime - b.startTime;
				});
			}
		},
		methods: {
			fetchLessons: function () {
				this.isFetching = true;
				axios.get(API_SERVER_PATH + this.path + `/${this.$store.getters['security/id']}/lessons`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.isFetching = false;
					this.fetchError = '';
					this.lessons = response.data;
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
					this.isFetching = false;
				});
			}
		},
		mounted() {
			this.fetchLessons();
		}
	}
</script>

<style scoped>
    .timetable-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .timetable-header {
        background-color: whitesmoke;
        border-radius: 10px;
        text-align: center;
        margin: 5px 2px 10px;
        padding: 5px 2px;
        font-size: 20px;
    }
</style>
