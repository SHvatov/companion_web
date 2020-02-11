<template>
    <div class="task-container">
        <b-row>
            <b-button @click="back" block>
                Return Back
            </b-button>
        </b-row>
        <b-card class="task-card" no-body>
            <template v-slot:header>
                <h5 class="mb-0">
                    <b-row>
                        <b-col sm="8">
                            <strong>{{task.title}}</strong>
                        </b-col>
                        <b-col sm="2">
                            <b-badge :variant="daysBeforeDeadline > 0 ? 'success' : 'danger'">
                                {{Math.abs(daysBeforeDeadline) + ' days ' + (daysBeforeDeadline > 0 ? 'before' :
                                'after') + ' deadline'}}
                            </b-badge>
                        </b-col>
                    </b-row>
                </h5>
            </template>

            <b-card-body v-if="typeof task.dueDate !== 'undefined'
                                && typeof task.type !== 'undefined'">
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Description</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{task.description}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Due date</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{task.dueDate.slice(0, 19).replace('T', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Priority</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{task.priority}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Type</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{task.type.replace('_', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Attachments</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <b-row v-if="attachments.length === 0">
                            <b-col>
                                <div class="task-card-elem text-center">
                                    <strong>Empty</strong>
                                </div>
                            </b-col>
                        </b-row>
                        <b-row v-bind:key="a.id" v-for="a in attachments">
                            <b-col sm="10">
                                <div class="task-card-elem text-center">
                                    <b-button :href="a.endpointUrl + '/' + a.fileBucket + '/' + a.fileKey">
                                        {{a.fileKey}}
                                    </b-button>
                                </div>
                            </b-col>
                            <b-col sm="2">
                                <div class="task-card-elem text-center">
                                    <b-button block v-b-modal="'delete-attach-' + a.fileKey" variant="danger">
                                        Delete
                                    </b-button>
                                    <b-modal :id="'delete-attach-' + a.fileKey" @cancel="clearErrors"
                                             cancel-variant="danger" centered
                                             @ok="() => removeAttachment(a.id)" ok-variant="success"
                                             ref="modal"
                                             title="Are you sure?"
                                    >
                                        Are you sure that you want to delete this attachment?
                                        <b-alert show v-if="attachmentError !== ''" variant="danger">
                                            {{attachmentError}}
                                        </b-alert>
                                    </b-modal>
                                </div>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col sm="10">
                                <div class="task-card-elem text-center">
                                    <b-form-file
                                            :state="Boolean(newAttachmentFile)"
                                            drop-placeholder="Drop file here..."
                                            placeholder="Choose a file or drop it here..."
                                            v-model="newAttachmentFile"
                                    />
                                </div>
                            </b-col>
                            <b-col sm="2">
                                <div class="task-card-elem text-center">
                                    <b-button @click="addAttachment" v-if="!isUploading" variant="success">
                                        Upload
                                    </b-button>
                                    <b-spinner label="Spinning" v-if="isUploading" variant="success"/>
                                </div>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-col>
                                <div class="text-center">
                                    <b-alert show v-if="attachmentError !== ''" variant="danger">
                                        {{attachmentError}}
                                    </b-alert>
                                </div>
                                <div class="text-center">
                                    <b-alert show v-if="fetchError !== ''" variant="danger">
                                        {{fetchError}}
                                    </b-alert>
                                </div>
                                <div class="text-center">
                                    <b-alert show v-if="deleteError !== ''" variant="danger">
                                        {{deleteError}}
                                    </b-alert>
                                </div>
                            </b-col>
                        </b-row>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col>
                        <div class="task-card-elem text-center">
                            <b-button block v-b-modal.delete-task variant="danger">
                                Delete
                            </b-button>
                            <b-modal @cancel="clearErrors" @ok="deleteTask"
                                     cancel-variant="danger" centered
                                     id="delete-task" ok-variant="success"
                                     ref="modal"
                                     title="Are you sure?"
                            >
                                Are you sure that you want to delete this task?
                                <b-alert show v-if="deleteError !== ''" variant="danger">
                                    {{deleteError}}
                                </b-alert>
                            </b-modal>
                        </div>
                    </b-col>
                </b-row>
            </b-card-body>

            <template v-slot:footer>
                <div>
                    <b-button block v-b-toggle.sub-collapse variant="primary">Sub tasks</b-button>
                    <b-collapse id="sub-collapse" style="margin: 10px 1px">
                        <b-row v-bind:key="sub.task.id" v-for="sub in subTasksSortedById">
                            <b-col>
                                <div class="sub-task-elem">
                                    <b-row>
                                        <b-col sm="2">
                                            <div class="task-card-elem text-center">
                                                <strong><i>Student</i></strong>
                                            </div>
                                        </b-col>
                                        <b-col sm="10">
                                            <div class="task-card-elem text-center">
                                                {{sub.studentUser.firstName + ' ' + sub.studentUser.secondName}}
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col sm="2">
                                            <div class="task-card-elem text-center">
                                                <strong><i>Status</i></strong>
                                            </div>
                                        </b-col>
                                        <b-col sm="10">
                                            <div class="task-card-elem text-center">
                                                {{sub.task.status.replace("_", " ")}}
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col sm="2">
                                            <div class="task-card-elem text-center">
                                                <strong><i>Assessment</i></strong>
                                            </div>
                                        </b-col>
                                        <b-col sm="10">
                                            <div class="task-card-elem text-center">
                                                {{sub.task.assessment.replace("_", " ")}}
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col sm="2">
                                            <div class="task-card-elem text-center">
                                                <strong><i>Notifications</i></strong>
                                            </div>
                                        </b-col>
                                        <b-col sm="5">
                                            <div class="task-card-elem text-center">
                                                {{calculateMessages(sub.task.id) + ' unread messages'}}
                                            </div>
                                        </b-col>
                                        <b-col sm="5">
                                            <div class="task-card-elem text-center">
                                                {{isStatusUpdated(sub.task.id)
                                                ? 'Status has been updated'
                                                : 'Status has not been updated'}}
                                            </div>
                                        </b-col>
                                    </b-row>
                                    <b-row>
                                        <b-col>
                                            <div class="task-card-elem text-center">
                                                <b-button @click="() => gotoSubTask(sub.task.id)" block>
                                                    Go to task
                                                </b-button>
                                            </div>
                                        </b-col>
                                    </b-row>
                                </div>
                            </b-col>
                        </b-row>
                    </b-collapse>
                </div>
            </template>
        </b-card>
    </div>
</template>

<script>
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "ProfessorTaskView",
		data() {
			return {
				taskId: this.$route.params.taskId,
				task: {},
				isUploading: false,
				newAttachmentFile: null,
				subject: {},
				subTasks: [],
				attachments: [],
				polling: null,
				fetchError: '',
				deleteError: '',
				attachmentError: ''
			}
		},
		computed: {
			subTasksSortedById() {
				return Object.values(this.subTasks).sort(function (a, b) {
					return a.task.id - b.task.id;
				});
			},
			daysBeforeDeadline() {
				return Math.round(
					Math.abs(
						(new Date(this.task.dueDate).getTime()
							- new Date().getTime()
						) / (24 * 3600 * 1000)
					)
				);
			}
		},
		methods: {
			calculateMessages(subId) {
				return this.subTasks[subId]
					.notifications
					.filter(n => n.type === 'NEW_MESSAGE').length;
			},
			isStatusUpdated(subId) {
				return this.subTasks[subId]
					.notifications
					.filter(n => n.type === 'TASK_STATUS_UPDATED')
					.length !== 0;
			},
			pollData: function () {
				this.polling = setInterval(() => {
					this.fetchData();
				}, 30000);
			},
			gotoSubTask(id) {
				this.$router.push(`/professor/tasks/${this.taskId}/sub/${id}`);
			},
			back: function () {
				this.$router.go(-1);
			},
			fetchData: function () {
				this.fetchTask();
				this.fetchTaskSubject();
				this.fetchSubTasks();
				this.fetchTaskAttachments();
			},
			deleteTask: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/ptask/${this.taskId}/delete`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.back();
				}).catch((error) => {
					if (error.response) {
						this.deleteError = error.response.data;
					} else if (error.request) {
						this.deleteError = "Server does not respond.";
					}
				});
			},
			addAttachment: function () {
				this.isUploading = true;
				let fileData = new FormData();
				fileData.append("file", this.newAttachmentFile);

				axios.post(API_SERVER_PATH + `/ptask/${this.taskId}/attachment/add`, fileData, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token'],
						'Content-Type': 'multipart/form-data'
					}
				}).then(() => {
					this.clearErrors();
					this.fetchData();
					this.isUploading = false;
				}).catch((error) => {
					if (error.response) {
						this.attachmentError = error.response.data['message'] || error.response.data;
					} else if (error.request) {
						this.attachmentError = "Server does not respond.";
					}
					this.isUploading = false;
				});
			},
			removeAttachment: function (attachmentId) {
				axios.delete(API_SERVER_PATH + `/ptask/${this.taskId}/attachment/${attachmentId}/delete`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.fetchData();
				}).catch((error) => {
					if (error.response) {
						this.attachmentError = error.response.data;
					} else if (error.request) {
						this.attachmentError = "Server does not respond.";
					}
				});
			},
			fetchSubTaskNotifications: function (taskId) {
				axios.get(API_SERVER_PATH + `/stask/${taskId}/notifications/${this.$store.getters['security/userId']}`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subTasks = Object.assign({}, this.subTasks, {
						[taskId]: {
							task: this.subTasks[taskId].task,
							studentId: this.subTasks[taskId].studentId,
							studentUser: this.subTasks[taskId].studentUser,
							notifications: response.data,
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
			fetchSubTaskStudentUser: function (taskId, studentId) {
				axios.get(API_SERVER_PATH + `/student/${studentId}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subTasks = Object.assign({}, this.subTasks, {
						[taskId]: {
							task: this.subTasks[taskId].task,
							studentId: this.subTasks[taskId].studentId,
							studentUser: response.data,
							notifications: this.subTasks[taskId].notifications,
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
			fetchSubTaskStudent: function (taskId) {
				axios.get(API_SERVER_PATH + `/stask/${taskId}/student`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subTasks = Object.assign({}, this.subTasks, {
						[taskId]: {
							task: this.subTasks[taskId].task,
							studentId: response.data.id,
							studentUser: this.subTasks[taskId].studentUser,
							notifications: this.subTasks[taskId].notifications,
						}
					});
					this.fetchSubTaskStudentUser(taskId, response.data.id);
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchSubTasks: function () {
				axios.get(API_SERVER_PATH + `/ptask/${this.taskId}/tasks`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					for (let sub of response.data) {
						if (this.subTasks.hasOwnProperty(sub.id)) {
							this.subTasks = Object.assign(this.subTasks, {
								[sub.id]: {
									task: sub,
									studentId: this.subTasks[sub.id].studentId,
									studentUser: this.subTasks[sub.id].studentUser,
									notifications: this.subTasks[sub.id].notifications,
								}
							});
						} else {
							this.subTasks = Object.assign(this.subTasks, {
								[sub.id]: {
									task: sub,
									studentId: null,
									studentUser: {},
									notifications: [],
								}
							});
						}
						this.fetchSubTaskStudent(sub.id);
						this.fetchSubTaskNotifications(sub.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchTaskAttachments: function () {
				axios.get(API_SERVER_PATH + `/ptask/${this.taskId}/attachments`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.attachments = response.data;
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchTaskSubject: function () {
				axios.get(API_SERVER_PATH + `/ptask/${this.taskId}/subject`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subject = Object.assign({}, response.data);
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				});
			},
			fetchTask: function () {
				axios.get(API_SERVER_PATH + `/ptask/${this.taskId}/get`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.task = Object.assign({}, response.data);
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
				this.deleteError = '';
				this.attachmentError = '';
			}
		},
		mounted() {
			this.fetchData();
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

    .task-card {
        margin: 10px;
        padding: 5px;
    }

    .task-card-elem {
        margin: 5px;
        padding: 10px;
        font-size: 22px;
        border-radius: 10px;
        background-color: whitesmoke;
    }

    .sub-task-elem {
        margin: 5px;
        padding: 10px;
        font-size: 20px;
        border-radius: 10px;
        background-color: white;
    }
</style>
