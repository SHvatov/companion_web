<template>
    <b-card no-body style="margin: 20px 30px; padding: 5px">
        <b-card-body>
            <b-row>
                <b-col offset-sm="1" sm="5">
                    <b-row><strong>Name: </strong>{{user.firstName + " " + user.secondName}}</b-row>
                    <b-row><strong>Email: </strong>{{user.email}}</b-row>
                </b-col>
                <b-col offset-sm="1" sm="2">
                    <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%"
                              v-b-modal="'edit-student-' + id"
                              variant="primary"
                    >
                        Edit info
                    </b-button>
                    <b-modal :id="'edit-student-' + id"
                             @cancel="clearErrors" @ok="editStudent"
                             cancel-variant="danger"
                             ok-title="Edit existing"
                             ok-variant="success"
                             ref="modal"
                             title="Edit existing student"
                    >
                        <div class="edit-container">
                            <b-input-group prepend="First name" size="md">
                                <b-form-input :value="updatedStudent.firstName" v-model="updatedStudent.firstName"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('firstName')" variant="danger">
                                {{invalidFieldsError['firstName']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <b-input-group prepend="Second name" size="md">
                                <b-form-input :value="updatedStudent.secondName" v-model="updatedStudent.secondName"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('secondName')" variant="danger">
                                {{invalidFieldsError['secondName']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <b-input-group prepend="Email" size="md">
                                <b-form-input :value="updatedStudent.email" v-model="updatedStudent.email"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('email')" variant="danger">
                                {{invalidFieldsError['email']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <b-form-select :value="updatedStudent.group" class="mb-3" name="Select group"
                                           size="md"
                                           v-model="updatedStudent.group"
                            >
                                <option :value="g.group.id" v-bind:key="g.group.id"
                                        v-for="g in otherGroups">
                                    {{g.group.number}}
                                </option>
                            </b-form-select>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('group')" variant="danger">
                                {{invalidFieldsError['group']}}
                            </b-alert>
                        </div>
                        <b-alert show v-if="editError !== ''" variant="danger">
                            {{editError}}
                        </b-alert>
                    </b-modal>
                </b-col>
                <b-col sm="2">
                    <b-button block v-b-modal="'reset-password-' + id" variant="danger">
                        Reset password
                    </b-button>
                    <b-modal :id="'reset-password-' + id" @cancel="clearErrors"
                             @ok="editPassword" cancel-variant="success"
                             centered ok-variant="danger"
                             ref="modal"
                             title="Are you sure?"
                    >
                        Are you sure that you want to reset the password of this student?<br>
                        New password will be sent on his email.
                        <b-alert show v-if="editError !== ''" variant="danger">
                            {{editError}}
                        </b-alert>
                    </b-modal>
                </b-col>
                <b-col sm="1">
                    <b-button block v-b-modal="'delete-user-' + id" variant="danger">
                        Delete
                    </b-button>
                    <b-modal :id="'delete-user-' + id" @cancel="clearErrors"
                             @ok="deleteStudent" cancel-variant="success"
                             centered ok-variant="danger"
                             ref="modal"
                             title="Are you sure?"
                    >
                        Are you sure that you want to delete this student?
                        <b-alert show v-if="deleteError !== ''" variant="danger">
                            {{deleteError}}
                        </b-alert>
                    </b-modal>
                </b-col>
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
	import axios from "axios";
	import {API_SERVER_PATH, ROLE_STUDENT} from "@/utils/constants";

	export default {
		name: "StudentView",
		props: {
			id: Number,
			group: Number,
			otherGroups: Object,
			onEdit: Function,
			onDelete: Function
		},
		data() {
			return {
				user: {},
				updatedStudent: {
					id: this.id,
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_STUDENT,
					group: this.group
				},
				invalidFieldsError: {},
				fetchError: '',
				editError: '',
				deleteError: ''
			}
		},
		methods: {
			fetchStudent: function () {
				axios.get(API_SERVER_PATH + `/student/${this.id}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.user = response.data;
					Object.assign(this.updatedStudent, this.user, {id: this.id});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			editStudent: function (event) {
				event.preventDefault();

				axios.put(API_SERVER_PATH + `/student/${this.id}/update`, this.updatedStudent, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.onEdit();
					this.$nextTick(() => {
						this.$refs.modal.hide();
					});
				}).catch((error) => {
					if (error.response) {
						if (typeof error.response.data === 'object') {
							this.invalidFieldsError = error.response.data;
						} else {
							this.editError = error.response.data;
						}
					} else if (error.request) {
						this.editError = "Server does not respond.";
					}
				});
			},
			editPassword: function (event) {
				event.preventDefault();

				axios.put(API_SERVER_PATH + `/student/${this.id}/updatePassword`, {}, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.onEdit();
					this.$nextTick(() => {
						this.$refs.modal.hide();
					});
				}).catch((error) => {
					if (error.response) {
						if (typeof error.response.data === 'object') {
							this.invalidFieldsError = error.response.data;
						} else {
							this.editError = error.response.data;
						}
					} else if (error.request) {
						this.editError = "Server does not respond.";
					}
				});
			},
			deleteStudent: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/student/${this.id}/delete`, {
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
				this.editError = '';
				this.deleteError = '';
			}
		},
		mounted() {
			this.fetchStudent();
		}
	}
</script>

<style scoped>
    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
