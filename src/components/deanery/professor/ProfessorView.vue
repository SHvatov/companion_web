<template>
    <b-card no-body style="margin: 20px 50px;">
        <b-card-body>
            <b-row>
                <b-col offset="1" sm="2">
                    <b-row><strong>Name: </strong>{{user.firstName + " " + user.secondName}}</b-row>
                    <b-row><strong>Email: </strong>{{user.email}}</b-row>
                </b-col>
                <b-col offset-sm="1" sm="2">
                    <b-row>
                        <strong>Assigned subjects</strong>
                    </b-row>
                    <b-row v-bind:key="s.id" v-for="s in current.subjects">
                        {{s.name}}
                    </b-row>
                </b-col>
                <b-col offset-sm="1" sm="2">
                    <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%"
                              v-b-modal="'edit-professor-' + current.professor.id"
                              variant="primary"
                    >
                        Edit info
                    </b-button>
                    <b-modal :id="'edit-professor-' + current.professor.id"
                             @cancel="clearErrors" @ok="editProfessor"
                             cancel-variant="danger"
                             ok-title="Edit existing"
                             ok-variant="success"
                             ref="modal"
                             title="Edit existing professor"
                    >
                        <div class="edit-container">
                            <b-input-group prepend="First name" size="md">
                                <b-form-input :value="updatedProfessor.firstName" v-model="updatedProfessor.firstName"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('firstName')" variant="danger">
                                {{invalidFieldsError['firstName']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <b-input-group prepend="Second name" size="md">
                                <b-form-input :value="updatedProfessor.secondName"
                                              v-model="updatedProfessor.secondName"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('secondName')" variant="danger">
                                {{invalidFieldsError['secondName']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <b-input-group prepend="Email" size="md">
                                <b-form-input :value="updatedProfessor.email" v-model="updatedProfessor.email"/>
                            </b-input-group>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('email')" variant="danger">
                                {{invalidFieldsError['email']}}
                            </b-alert>
                        </div>
                        <div class="edit-container">
                            <multiselect :clear-on-select="false" :close-on-select="false"
                                         :multiple="true"
                                         :options="subjects" :searchable="true"
                                         :value="updatedProfessor.subjects"
                                         label="name"
                                         placeholder="Choose subjects"
                                         track-by="id"
                                         v-model="updatedProfessor.subjects"/>
                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('subjects')" variant="danger">
                                {{invalidFieldsError['subjects']}}
                            </b-alert>
                        </div>
                        <b-alert show v-if="editError !== ''" variant="danger">
                            {{editError}}
                        </b-alert>
                    </b-modal>
                </b-col>
                <b-col sm="2">
                    <b-button block v-b-modal="'reset-password-' + current.professor.id" variant="danger">
                        Reset password
                    </b-button>
                    <b-modal :id="'reset-password-' + current.professor.id" @cancel="clearErrors"
                             @ok="editPassword" cancel-variant="success"
                             centered ok-variant="danger"
                             ref="modal"
                             title="Are you sure?"
                    >
                        Are you sure that you want to reset the password of this professor?<br>
                        New password will be sent on his email.
                        <b-alert show v-if="editError !== ''" variant="danger">
                            {{editError}}
                        </b-alert>
                    </b-modal>
                </b-col>
                <b-col sm="1">
                    <b-button block v-b-modal="'delete-user-' + current.professor.id" variant="danger">
                        Delete
                    </b-button>
                    <b-modal :id="'delete-user-' + current.professor.id" @cancel="clearErrors"
                             @ok="deleteProfessor" cancel-variant="success"
                             centered ok-variant="danger"
                             ref="modal"
                             title="Are you sure?"
                    >
                        Are you sure that you want to delete this professor?
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
	import {API_SERVER_PATH, ROLE_PROFESSOR} from "@/utils/constants";
	import axios from "axios";

	export default {
		name: "ProfessorView",
		data() {
			return {
				user: {},
				updatedProfessor: {
					id: 0,
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_PROFESSOR,
					subjects: Object.values(this.subjects)
				},
				invalidFieldsError: {},
				fetchError: '',
				editError: '',
				deleteError: ''
			}
		},
		props: {
			current: Object,
			subjects: Array,
			onEdit: Function,
			onDelete: Function
		},
		methods: {
			fetchProfessor: function () {
				axios.get(API_SERVER_PATH + `/professor/${this.current.professor.id}/user`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.user = response.data;
					Object.assign(this.updatedProfessor, this.user, {
						id: this.current.professor.id,
						subjects: this.current.subjects
					});
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			editProfessor: function (event) {
				event.preventDefault();
				Object.assign(this.updatedProfessor, {
					subjects: this.updatedProfessor.subjects.map(s => s.id)
				});

				axios.put(API_SERVER_PATH + `/professor/${this.current.professor.id}/update`, this.updatedProfessor, {
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

				axios.put(API_SERVER_PATH + `/professor/${this.current.professor.id}/updatePassword`, {}, {
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
			deleteProfessor: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/professor/${this.current.professor.id}/delete`, {
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
			this.fetchProfessor();
		}
	}
</script>

<style scoped>
    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
