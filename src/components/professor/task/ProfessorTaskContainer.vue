<template>
    <div class="task-container">
        <b-row>
            <b-col>
                <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%"
                          v-b-modal.add-task
                          variant="primary"
                >
                    Add task
                </b-button>
                <b-modal @cancel="clearErrors"
                         @ok="addTask" cancel-variant="danger"
                         id="add-task"
                         ok-title="Add new"
                         ok-variant="success"
                         ref="modal"
                         title="Add new task"
                >
                    <div class="edit-container">
                        <b-input-group prepend="Title" size="md">
                            <b-form-input :value="newTask.title" v-model="newTask.title"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('title')" variant="danger">
                            {{invalidFieldsError['title']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-form-textarea
                                :value="newTask.description"
                                id="textarea-auto-height"
                                max-rows="8"
                                placeholder="Input you description here"
                                rows="3"
                                v-model="newTask.description"
                        />
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('description')" variant="danger">
                            {{invalidFieldsError['description']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <datetime :value="newTask.dueDate" format="YYYY-MM-DD H:i:s"
                                  v-model="newTask.dueDate"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('dueDate')" variant="danger">
                            {{invalidFieldsError['dueDate']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :options="TASK_TYPES"
                                     :preselect-first="true"
                                     :searchable="true"
                                     label="name"
                                     placeholder="Choose type"
                                     track-by="value"
                                     v-model="newTask.type"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('type')" variant="danger">
                            {{invalidFieldsError['type']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :options="TASK_PRIOR"
                                     :preselect-first="true"
                                     :searchable="true"
                                     label="name"
                                     placeholder="Choose priority"
                                     track-by="value"
                                     v-model="newTask.priority"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('priority')" variant="danger">
                            {{invalidFieldsError['priority']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :options="generateSubjectOptions()"
                                     :preselect-first="true"
                                     :searchable="true"
                                     label="name"
                                     placeholder="Choose priority"
                                     track-by="value"
                                     v-model="newTask.subject"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('subject')" variant="danger">
                            {{invalidFieldsError['subject']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false"
                                     :close-on-select="false"
                                     :group-select="true"
                                     :multiple="true"
                                     :options="generateGroupsOptions()"
                                     :searchable="true"
                                     group-label="group"
                                     group-values="students"
                                     label="name"
                                     placeholder="Choose assignees"
                                     track-by="value"
                                     v-model="newTask.assignees"/>
                    </div>
                    <div class="edit-container text-center">
                        <b-alert show v-if="addError !== ''" variant="danger">
                            {{addError}}
                        </b-alert>
                    </div>
                </b-modal>
            </b-col>
        </b-row>
        <b-row>
            <b-col>
                <div class="text-center">
                    <b-alert show v-if="fetchError !== ''" variant="danger">
                        {{fetchError}}
                    </b-alert>
                </div>
            </b-col>
        </b-row>
        <professor-task-card :current="t" :on-delete="fetchTasks"
                             :on-edit="fetchTasks"
                             v-bind:key="t.id"
                             v-for="t in tasksSortedByPriority"
        />
        <b-row>
            <b-col offset-sm="3" sm="6">
                <div class="text-center"
                     style="margin: 10px; background-color: whitesmoke; border-radius: 10px; font-size: 25px; padding: 50px;"
                     v-if="tasksSortedByPriority.length === 0"
                >
                    <strong>No tasks have been created yet</strong>
                </div>
            </b-col>
        </b-row>
    </div>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";
	import datetime from 'vuejs-datetimepicker';
	import ProfessorTaskCard from "@/components/professor/task/ProfessorTaskCard";

	export default {
		name: "ProfessorTaskContainer",
		components: {ProfessorTaskCard, datetime},
		data() {
			return {
				tasks: {},
				subjects: {},
				groups: {},
				newTask: {
					title: null,
					description: null,
					priority: null,
					type: null,
					dueDate: null,
					subject: null,
					professor: this.$store.getters['security/id'],
					assignees: []
				},
				TASK_TYPES: [
					{name: 'Homework', value: 'HOMEWORK'},
					{name: 'Exam', value: 'EXAM'},
					{name: 'Course work', value: 'COURSE_WORK'},
				],
				TASK_PRIOR: [
					{name: 'High', value: 'HIGH'},
					{name: 'Middle', value: 'MIDDLE'},
					{name: 'Low', value: 'LOW'},
				],
				polling: null,
				fetchError: '',
				addError: '',
				invalidFieldsError: {}
			}
		},
		computed: {
			tasksSortedByPriority() {
				return Object.values(this.tasks).sort(function (a, b) {
					return new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime();
				});
			}
		},
		methods: {
			pollData: function () {
				this.polling = setInterval(() => {
					this.fetchTasks();
					this.fetchSubjects();
				}, 30000);
			},
			generateSubjectOptions: function () {
				let options = [];
				for (let s in this.subjects) {
					if (this.subjects.hasOwnProperty(s)) {
						options.push({
							name: this.subjects[s].subject.name + ' - ' + this.subjects[s].subject.type,
							value: this.subjects[s].subject.id
						})
					}
				}
				return options;
			},
			generateGroupsOptions: function () {
				if (this.newTask.subject === null || typeof this.newTask.subject === 'undefined') {
					return [];
				}

				let subjectId = this.newTask.subject.value;
				let subjectGroups = this.subjects[subjectId].groups;

				let options = [];
				for (let g of subjectGroups) {
					let students = [];
					for (let s of this.groups[g.id]) {
						students.push({
							name: s.user.firstName + ' ' + s.user.secondName,
							value: s.id
						})
					}

					options.push({
						group: g.number,
						students
					})
				}
				return options;
			},
			addTask: function (event) {
				event.preventDefault();

				let data = Object.assign({}, this.newTask, {
					dueDate: new Date(this.newTask.dueDate),
					subject: this.newTask.subject.value,
					type: this.newTask.type.value,
					priority: this.newTask.priority.value,
					assignees: this.newTask.assignees.map(a => {
						return a.value
					})
				});

				console.log(data);

				axios.post(API_SERVER_PATH + `/ptask/add`, data, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.clearBuffer();
					this.fetchTasks();
					this.$nextTick(() => {
						this.$refs.modal.hide();
					});
				}).catch((error) => {
					if (error.response) {
						if (typeof error.response.data === 'object') {
							this.invalidFieldsError = error.response.data;
						} else {
							this.addError = error.response.data;
						}
					} else if (error.request) {
						this.addError = "Server does not respond.";
					}
				});
			},
			fetchTaskSubject: function (taskId) {
				axios.get(API_SERVER_PATH + `/ptask/${taskId}/subject`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[taskId]: {
							task: this.tasks[taskId].task,
							subject: response.data,
							notifications: this.tasks[taskId].notifications,
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
			fetchAllNotifications: function (taskId) {
				axios.get(API_SERVER_PATH + `/ptask/${taskId}/notifications/${this.$store.getters['security/userId']}`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.tasks = Object.assign({}, this.tasks, {
						[taskId]: {
							task: this.tasks[taskId].task,
							subject: this.tasks[taskId].subject,
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
			fetchTasks: function () {
				axios.get(API_SERVER_PATH + `/professor/${this.$store.getters['security/id']}/tasks`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					for (let t of response.data) {
						if (this.tasks.hasOwnProperty(t.id)) {
							this.tasks = Object.assign(this.tasks, {
								[t.id]: {
									task: t,
									subject: this.tasks[t.id].subject,
									notifications: this.tasks[t.id].notifications
								}
							});
						} else {
							this.tasks = Object.assign(this.tasks, {
								[t.id]: {
									task: t,
									subject: {},
									notifications: []
								}
							});
						}
						this.fetchAllNotifications(t.id);
						this.fetchTaskSubject(t.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchStudentUser: function (groupId, studentId) {
				axios.get(API_SERVER_PATH + `/student/${studentId}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.clearErrors();

					let modified = this.groups[groupId];
					for (let i = 0; i < modified.length; i++) {
						if (modified[i].id === studentId) {
							modified[i].user = response.data;
							break;
						}
					}

					this.groups = Object.assign({}, this.groups, {
						[groupId]: modified
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchStudents: function (groupId) {
				axios.get(API_SERVER_PATH + `/group/${groupId}/students`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.clearErrors();

					this.groups = Object.assign({}, this.groups, {
						[groupId]: response.data.map(s => {
							return {id: s.id, user: {}}
						})
					});

					for (let s of response.data) {
						this.fetchStudentUser(groupId, s.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchGroups: function (subjectId) {
				axios.get(API_SERVER_PATH + `/subject/${subjectId}/groups`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.fetchError = '';
					this.clearErrors();

					this.subjects = Object.assign({}, this.subjects, {
						[subjectId]: {
							subject: this.subjects[subjectId].subject,
							groups: response.data
						}
					});

					let allGroups = Object.values(this.groups).map(g => {
						return g.id
					});

					for (let s in this.subjects) {
						if (this.subjects.hasOwnProperty(s)) {
							for (let g in this.subjects[s].groups) {
								if (this.subjects[s].groups.hasOwnProperty(g)) {
									if (!allGroups.includes(this.subjects[s].groups[g].id)
										&& typeof this.subjects[s].groups[g].id !== 'undefined') {
										allGroups.push(this.subjects[s].groups[g].id);
									}
								}
							}
						}
					}

					for (let g of allGroups.filter(g => typeof g === 'number')) {
						this.fetchStudents(g);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchSubjects: function () {
				axios.get(API_SERVER_PATH + `/professor/${this.$store.getters['security/id']}/subjects`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subjects = {};
					for (let s of response.data) {
						Object.assign(this.subjects, {
							[s.id]: {
								subject: s,
								groups: {}
							}
						});
						this.fetchGroups(s.id);
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
				this.invalidFieldsError = {};
				this.fetchError = '';
				this.addError = '';
			},
			clearBuffer: function () {
				this.newTask = {
					title: null,
					description: null,
					priority: null,
					type: null,
					dueDate: null,
					subject: null,
					professor: this.$store.getters['security/id'],
					assignees: []
				};
			}
		},
		mounted() {
			this.fetchTasks();
			this.fetchSubjects();
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

    .edit-container {
        margin: 5px;
        padding: 5px;
    }
</style>
