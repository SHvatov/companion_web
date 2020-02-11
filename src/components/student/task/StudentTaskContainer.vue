<template>
    <div class="task-container">
        <b-row>
            <b-col>
                <div class="text-center">
                    <b-alert show v-if="fetchError !== ''" variant="danger">
                        {{fetchError}}
                    </b-alert>
                </div>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <b-card no-body>
                    <b-tabs align="center" card content-class="mt-2" pills>
                        <b-tab title="Not completed">
                            <b-row v-if="notCompletedTasks.length === 0">
                                <b-col>
                                    <div class="task-empty text-center">
                                        No tasks available
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row v-bind:key="t.stask.id"
                                   v-for="t in notCompletedTasks">
                                <b-col>
                                    <student-task-card :current="t"/>
                                </b-col>
                            </b-row>
                        </b-tab>
                        <b-tab title="Completed">
                            <b-row v-if="completedTasks.length === 0">
                                <b-col>
                                    <div class="task-empty text-center">
                                        No tasks has been completed
                                    </div>
                                </b-col>
                            </b-row>
                            <b-row v-bind:key="t.stask.id"
                                   v-for="t in completedTasks">
                                <b-col>
                                    <student-task-card :current="t"/>
                                </b-col>
                            </b-row>
                        </b-tab>
                    </b-tabs>
                </b-card>
            </b-col>
        </b-row>
    </div>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";
	import StudentTaskCard from "@/components/student/task/StudentTaskCard";

	export default {
		name: "StudentTaskContainer",
		components: {StudentTaskCard},
		data() {
			return {
				tasks: {},
				polling: null,
				fetchError: '',
			}
		},
		computed: {
			completedTasks() {
				return Object.values(this.tasks)
					.filter(t => t.stask.status === 'COMPLETED')
					.sort(function (a, b) {
						return new Date(a.ptask.dueDate).getTime() - new Date(b.ptask.dueDate).getTime();
					});
			},
			notCompletedTasks() {
				return Object.values(this.tasks)
					.filter(t => t.stask.status === 'NOT_COMPLETED')
					.sort(function (a, b) {
						return new Date(a.ptask.dueDate).getTime() - new Date(b.ptask.dueDate).getTime();
					});
			}
		},
		methods: {
			pollData: function () {
				this.polling = setInterval(() => {
					this.fetchStudentTasks();
				}, 10000);
			},
			fetchNotifications: function (staskId) {
				axios.get(API_SERVER_PATH + `/stask/${staskId}/notifications/${this.$store.getters['security/userId']}`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[staskId]: {
							stask: this.tasks[staskId].stask,
							ptask: this.tasks[staskId].ptask,
							subject: this.tasks[staskId].subject,
							professor: this.tasks[staskId].professor,
							notifications: response.data
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
			fetchProfessorUser: function (staskId, professorId) {
				axios.get(API_SERVER_PATH + `/professor/${professorId}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[staskId]: {
							stask: this.tasks[staskId].stask,
							ptask: this.tasks[staskId].ptask,
							subject: this.tasks[staskId].subject,
							professor: {
								id: this.tasks[staskId].professor.id,
								user: response.data
							},
							notifications: this.tasks[staskId].notifications
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
			fetchProfessor: function (staskId) {
				axios.get(API_SERVER_PATH + `/stask/${staskId}/professor`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[staskId]: {
							stask: this.tasks[staskId].stask,
							ptask: this.tasks[staskId].ptask,
							subject: this.tasks[staskId].subject,
							professor: {
								id: response.data.id,
								user: this.tasks[staskId].professor.user
							},
							notifications: this.tasks[staskId].notifications
						}
					});
					this.fetchProfessorUser(staskId, response.data.id);
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchSubject: function (staskId) {
				axios.get(API_SERVER_PATH + `/stask/${staskId}/subject`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[staskId]: {
							stask: this.tasks[staskId].stask,
							ptask: this.tasks[staskId].ptask,
							subject: response.data,
							professor: this.tasks[staskId].professor,
							notifications: this.tasks[staskId].notifications
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
			fetchProfessorTask: function (staskId) {
				axios.get(API_SERVER_PATH + `/stask/${staskId}/professorTask`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[staskId]: {
							stask: this.tasks[staskId].stask,
							ptask: response.data,
							subject: this.tasks[staskId].subject,
							professor: this.tasks[staskId].professor,
							notifications: this.tasks[staskId].notifications
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
			fetchStudentTasks: function () {
				axios.get(API_SERVER_PATH + `/student/${this.$store.getters['security/id']}/tasks`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					for (let t of response.data) {
						if (this.tasks.hasOwnProperty(t.id)) {
							this.tasks = Object.assign(this.tasks, {
								[t.id]: {
									stask: t,
									ptask: this.tasks[t.id].ptask,
									subject: this.tasks[t.id].subject,
									professor: this.tasks[t.id].professor,
									notifications: this.tasks[t.id].notifications
								}
							});
						} else {
							this.tasks = Object.assign(this.tasks, {
								[t.id]: {
									stask: t,
									ptask: {},
									subject: {},
									professor: {},
									notifications: []
								}
							});
						}
						this.fetchProfessorTask(t.id);
						this.fetchProfessor(t.id);
						this.fetchSubject(t.id);
						this.fetchNotifications(t.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			clearErrors: function () {
				this.fetchError = '';
			}
		},
		mounted() {
			this.fetchStudentTasks();
			this.pollData();
		},
		beforeDestroy() {
			clearInterval(this.polling);
		}
	}
</script>

<style scoped>
    .task-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .task-empty {
        margin: 5px;
        padding: 10px;
        font-size: 30px;
        border-radius: 10px;
        background-color: whitesmoke;
    }
</style>
