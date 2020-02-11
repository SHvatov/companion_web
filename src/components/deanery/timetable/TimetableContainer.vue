<template>
    <div class="timetable-container">
        <b-row style="margin: 20px;">
            <multiselect :clear-on-select="false" :close-on-select="true"
                         :options="Object.values(professors)"
                         :searchable="true"
                         label="name"
                         placeholder="Choose professor"
                         track-by="id"
                         v-model="selected"/>
        </b-row>
        <b-row>
            <b-alert show v-if="fetchError !== ''" variant="danger">
                {{fetchError}}
            </b-alert>
        </b-row>
        <timetable-view :current="professors[selected.id]"
                        :groups="groups"
                        :on-add="fetchProfessors"
                        :on-delete="fetchProfessors"
                        v-if="selected != null"/>
        <h3 class="text-center" style="margin: 20px" v-else>
            Select the professor from the selector on the top of the page.
        </h3>
    </div>
</template>

<script>
	import axios from 'axios';
	import {API_SERVER_PATH} from "@/utils/constants";
	import TimetableView from "@/components/deanery/timetable/TimetableView";

	export default {
		name: "TimetableContainer",
		components: {TimetableView},
		data() {
			return {
				selected: null,
				professors: {},
				groups: [],
				fetchError: ''
			}
		},
		methods: {
			fetchGroups: function () {
				axios.get(API_SERVER_PATH + `/group/list`, {
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
			fetchLessons: function (professorId) {
				axios.get(API_SERVER_PATH + `/professor/${professorId}/lessons`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.professors = Object.assign({}, this.professors, {
						[professorId]: {
							id: this.professors[professorId].id,
							name: this.professors[professorId].name,
							subjects: this.professors[professorId].subjects,
							lessons: response.data
						}
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			fetchUser: function (professorId) {
				axios.get(API_SERVER_PATH + `/professor/${professorId}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.professors = Object.assign({}, this.professors, {
						[professorId]: {
							id: this.professors[professorId].id,
							name: response.data['firstName'] + ' ' + response.data['secondName'],
							subjects: this.professors[professorId].subjects,
							lessons: this.professors[professorId].lessons
						}
					});
					this.professors = Object.assign({}, this.professors, {});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			fetchSubjects: function (professorId) {
				axios.get(API_SERVER_PATH + `/professor/${professorId}/subjects`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.professors = Object.assign({}, this.professors, {
						[professorId]: {
							id: this.professors[professorId].id,
							name: this.professors[professorId].name,
							subjects: response.data.map(s => {
								return {
									id: s.id,
									name: `${s.name} - ${s.type}`,
								};
							}),
							lessons: this.professors[professorId].lessons
						}
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			fetchProfessors: function () {
				axios.get(API_SERVER_PATH + `/professor/list`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.professors = {};
					for (let p of response.data) {
						Object.assign(this.professors, {
							[p.id]: {
								id: p.id,
								name: '',
								subjects: [],
								lessons: []
							}
						});
						this.fetchSubjects(p.id);
						this.fetchUser(p.id);
						this.fetchLessons(p.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.fetchError = '';
			}
		},
		mounted() {
			this.fetchProfessors();
			this.fetchGroups();
		}
	}
</script>

<style scoped>
    .timetable-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }
</style>
