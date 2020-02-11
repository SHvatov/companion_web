<template>
    <div class="professor-container">
        <b-row style="margin: 10px;">
            <b-col>
                <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%" v-b-modal.add-professor
                          variant="success"
                >
                    Add professor
                </b-button>
                <b-modal @cancel="clearErrors"
                         @ok="addProfessor" cancel-variant="danger"
                         id="add-professor"
                         ok-title="Add new"
                         ok-variant="success"
                         ref="modal"
                         title="Add new professor"
                >
                    <div class="edit-container">
                        <b-input-group prepend="First name" size="md">
                            <b-form-input :value="newProfessor.firstName" v-model="newProfessor.firstName"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('firstName')" variant="danger">
                            {{invalidFieldsError['firstName']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Second name" size="md">
                            <b-form-input :value="newProfessor.secondName" v-model="newProfessor.secondName"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('secondName')" variant="danger">
                            {{invalidFieldsError['secondName']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Email" size="md">
                            <b-form-input :value="newProfessor.email" v-model="newProfessor.email"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('email')" variant="danger">
                            {{invalidFieldsError['email']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="false"
                                     :multiple="true" :options="subjects"
                                     :searchable="true"
                                     label="name"
                                     placeholder="Choose subjects"
                                     track-by="id"
                                     v-model="newProfessor.subjects"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('subjects')" variant="danger">
                            {{invalidFieldsError['subjects']}}
                        </b-alert>
                    </div>
                    <b-alert show v-if="addError !== ''" variant="danger">
                        {{addError}}
                    </b-alert>
                </b-modal>
            </b-col>
        </b-row>
        <b-alert show v-if="fetchError !== ''" variant="danger">
            {{fetchError}}
        </b-alert>
        <professor-view :current="p" :on-delete="fetchProfessors"
                        :on-edit="fetchProfessors"
                        :subjects="subjects"
                        v-bind:key="p.professor.id"
                        v-for="p in professors"/>
    </div>
</template>

<script>
	import {API_SERVER_PATH, ROLE_PROFESSOR} from "@/utils/constants";
	import axios from "axios";
	import ProfessorView from "@/components/deanery/professor/ProfessorView";

	export default {
		name: "ProfessorContainer",
		components: {ProfessorView},
		data() {
			return {
				professors: {},
				subjects: [],
				newProfessor: {
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_PROFESSOR,
					subjects: []
				},
				invalidFieldsError: {},
				fetchError: '',
				addError: ''
			}
		},
		methods: {
			fetchSubjects: function (professorId) {
				axios.get(API_SERVER_PATH + `/professor/${professorId}/subjects`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.professors = Object.assign({}, this.professors, {
						[professorId]: {
							professor: this.professors[professorId].professor,
							subjects: response.data.map(s => {
								return {
									id: s.id,
									name: `${s.name} - ${s.type}`
								};
							})
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
								professor: p,
								subjects: []
							}
						});
						this.fetchSubjects(p.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			fetchAllSubjects: function () {
				axios.get(API_SERVER_PATH + `/subject/list`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.subjects = response.data.map(s => {
						return {
							id: s.id,
							name: `${s.name} - ${s.type}`
						};
					})
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			addProfessor: function (event) {
				event.preventDefault();
				Object.assign(this.newProfessor, {
					subjects: this.newProfessor.subjects.map(s => s.id)
				});

				axios.post(API_SERVER_PATH + `/professor/add`, this.newProfessor, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.clearBuffer();
					this.fetchProfessors();
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
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.fetchError = '';
				this.addError = '';
			},
			clearBuffer: function () {
				this.newProfessor = {
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_PROFESSOR,
					subjects: []
				}
			}
		},
		mounted() {
			this.fetchAllSubjects();
			this.fetchProfessors();
		}
	}
</script>

<style scoped>
    .professor-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
