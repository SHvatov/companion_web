<template>
    <div class="subject-container">
        <b-row>
            <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%" v-b-modal.add-subject
                      variant="success"
            >
                Add new subject
            </b-button>
            <b-modal @cancel="clearErrors"
                     @ok="addSubject" cancel-variant="danger"
                     id="add-subject"
                     ok-title="Add new"
                     ok-variant="success"
                     ref="modal"
                     title="Add new subject"
            >
                <div class="edit-container">
                    <b-input-group prepend="Name" size="md">
                        <b-form-input :value="newSubjectName" v-model="newSubjectName"/>
                    </b-input-group>
                    <b-alert show v-if="invalidFieldsError.hasOwnProperty('name')" variant="danger">
                        {{invalidFieldsError['name']}}
                    </b-alert>
                </div>
                <div class="edit-container">
                    <b-form-select :value="newSubjectType" class="mb-3" name="Select type"
                                   size="md"
                                   v-model="newSubjectType"
                    >
                        <option value="LECTURE">Lecture</option>
                        <option value="PRACTICE">Practice</option>
                    </b-form-select>
                </div>
                <b-alert show v-if="addError !== ''" variant="danger">
                    {{addError}}
                </b-alert>
            </b-modal>
        </b-row>
        <b-alert show v-if="fetchError !== ''" variant="danger">
            {{fetchError}}
        </b-alert>
        <div class="subject-row" v-bind:key="subject.id"
             v-for="subject in sortedSubjects"
        >
            <subject :current="subject"
                     :on-delete="fetchSubjects"
                     :on-edit="fetchSubjects"
            />
        </div>
    </div>
</template>

<script>
	import Subject from "@/components/deanery/subjects/SubjectView";
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "SubjectsContainer",
		components: {Subject},
		data() {
			return {
				subjects: [],
				newSubjectName: "",
				newSubjectType: "LECTURE",
				invalidFieldsError: {},
				addError: "",
				fetchError: ""
			}
		},
		computed: {
			sortedSubjects() {
				return this.subjects.slice().sort(function (a, b) {
					if (a.name < b.name) {
						return -1;
					}
					if (b.name < a.name) {
						return 1;
					}
					return 0;
				});
			}
		},
		methods: {
			fetchSubjects: function () {
				axios.get(API_SERVER_PATH + `/subject/list`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				})
					.then((response) => {
						this.clearErrors();
						this.subjects = response.data;
					})
					.catch((error) => {
						if (error.response) {
							this.fetchError = error.response.data;
						} else if (error.request) {
							this.fetchError = "Server does not respond.";
						}
					})
			},
			addSubject: function (event) {
				event.preventDefault();

				axios.post(API_SERVER_PATH + `/subject/add`, {
					name: this.newSubjectName,
					type: this.newSubjectType
				}, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				})
					.then(() => {
						this.clearErrors();
						this.fetchSubjects();
						this.$nextTick(() => {
							this.$refs.modal.hide();
						});
					})
					.catch((error) => {
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
				this.addError = "";
				this.invalidFieldsError = {};
				this.fetchError = "";
			}
		},
		mounted() {
			this.fetchSubjects();
		}
	}
</script>

<style scoped>
    .subject-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .subject-row {
        width: 98%;
        margin: 6px 1%;
        padding: 3px;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
