<template>
    <div class="group-container">
        <b-row style="margin: 10px; padding: 5px;">
            <b-col sm="7">
                <b-button @click="() => {this.isCollapsed = !this.isCollapsed; clearErrors();}" block
                          style="width: 96%; margin-left: 2%; margin-right: 2%"
                          v-b-toggle.collapse-add-group
                          variant="primary"
                >
                    {{isCollapsed ? "Close" : "Add group"}}
                </b-button>
                <b-collapse class="mt2" id="collapse-add-group">
                    <b-card style="margin: 20px;">
                        <b-row>
                            <b-col sm="9">
                                <div>
                                    <b-input-group prepend="Number" size="md">
                                        <b-form-input :value="newGroupNumber"
                                                      placeholder="Format: [0-9]+/[0-9]+"
                                                      v-model="newGroupNumber"/>
                                    </b-input-group>
                                    <b-alert show v-if="invalidFieldsError.hasOwnProperty('number')" variant="danger">
                                        {{invalidFieldsError['number']}}
                                    </b-alert>
                                </div>
                            </b-col>
                            <b-col offset-sm="1" sm="1">
                                <b-button @click="addGroup" variant="success">
                                    Submit
                                </b-button>
                            </b-col>
                        </b-row>
                        <b-row>
                            <b-alert show v-if="addError !== ''" variant="danger">
                                {{addError}}
                            </b-alert>
                        </b-row>
                    </b-card>
                </b-collapse>
            </b-col>
            <b-col sm="5">
                <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%"
                          v-b-modal.add-student variant="primary"
                >
                    Add student
                </b-button>
                <b-modal @cancel="clearErrors"
                         @ok="addStudent" cancel-variant="danger"
                         id="add-student"
                         ok-title="Add new"
                         ok-variant="success"
                         ref="modal"
                         title="Add new student"
                >
                    <div class="edit-container">
                        <b-input-group prepend="First name" size="md">
                            <b-form-input :value="newStudent.firstName" v-model="newStudent.firstName"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('firstName')" variant="danger">
                            {{invalidFieldsError['firstName']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Second name" size="md">
                            <b-form-input :value="newStudent.secondName" v-model="newStudent.secondName"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('secondName')" variant="danger">
                            {{invalidFieldsError['secondName']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Email" size="md">
                            <b-form-input :value="newStudent.email" v-model="newStudent.email"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('email')" variant="danger">
                            {{invalidFieldsError['email']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-form-select :value="newStudent.group" class="mb-3" name="Select group"
                                       size="md"
                                       v-model="newStudent.group"
                        >
                            <option :value="-1">Please select the group from the list</option>
                            <option :value="g.group.id" v-bind:key="g.group.id"
                                    v-for="g in groups">
                                {{g.group.number}}
                            </option>
                        </b-form-select>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('group')" variant="danger">
                            {{invalidFieldsError['group']}}
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
        <group-view :current="g"
                    :on-delete="fetchGroups"
                    v-bind:key="g.group.id"
                    v-for="g in groups"
                    :on-edit="fetchGroups"
                    :other-groups="groups"
        />
    </div>
</template>

<script>
	import {API_SERVER_PATH, ROLE_STUDENT} from "@/utils/constants";
	import axios from "axios";
	import GroupView from "@/components/deanery/groups/GroupView";

	export default {
		name: "GroupsContainer",
		components: {GroupView},
		data() {
			return {
				groups: {},
				isCollapsed: false,
				newGroupNumber: '',
				newStudent: {
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_STUDENT,
					group: -1
				},
				invalidFieldsError: {},
				fetchError: '',
				addError: ''
			}
		},
		methods: {
			fetchStudents: function (groupId) {
				axios.get(API_SERVER_PATH + `/group/${groupId}/students`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.groups = Object.assign({}, this.groups, {
						[groupId]: {
							group: this.groups[groupId].group,
							students: response.data
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
			fetchGroups: function () {
				axios.get(API_SERVER_PATH + `/group/list`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.groups = {};
					for (let g of response.data) {
						Object.assign(this.groups, {
							[g.id]: {
								group: g,
								students: []
							}
						});
						this.fetchStudents(g.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			addGroup: function () {
				axios.post(API_SERVER_PATH + `/group/add`, {
					number: this.newGroupNumber
				}, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.fetchGroups();
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
				})
			},
			addStudent: function (event) {
				event.preventDefault();
				if (this.newStudent.group === -1) {
					this.addError = "Select the group of the student before creating!";
					return;
				}

				axios.post(API_SERVER_PATH + `/student/add`, this.newStudent, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearBuffer();
					this.clearErrors();
					this.fetchGroups();
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
				})
			},
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.fetchError = '';
				this.addError = '';
			},
			clearBuffer: function () {
				this.newStudent = {
					email: '',
					firstName: '',
					secondName: '',
					role: ROLE_STUDENT,
					group: -1
				}
			}
		},
		mounted() {
			this.fetchGroups();
		}
	}
</script>

<style scoped>
    .group-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
