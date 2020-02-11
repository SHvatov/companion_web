<template>
    <div class="subject-bubble">
        <b-row>
            <b-col sm="5">
                <div class="text-center">
                    {{current.name}}
                </div>
            </b-col>
            <b-col sm="5">
                <div class="text-center">
                    {{current.type}}
                </div>
            </b-col>
            <b-col sm="1">
                <b-button v-b-modal="'edit-subject-' + current.id" variant="primary">
                    Edit
                </b-button>
                <b-modal :id="'edit-subject-' + current.id" @cancel="clearErrors"
                         @ok="editSubject" cancel-title="Cancel"
                         cancel-variant="danger" centered
                         ok-title="Save" ok-variant="success"
                         ref="modal"
                         title="Edit existing subject"
                >
                    <div class="edit-container">
                        <b-input-group prepend="Name" size="md">
                            <b-form-input :value="current.name" v-model="editedSubjectName"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('name')" variant="danger">
                            {{invalidFieldsError['name']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-form-select :value="selectedSubjectType" class="mb-3" name="Select type"
                                       size="md"
                                       v-model="selectedSubjectType"
                        >
                            <option value="LECTURE">Lecture</option>
                            <option value="PRACTICE">Practice</option>
                        </b-form-select>
                    </div>
                    <b-alert show v-if="editError !== ''" variant="danger">
                        {{editError}}
                    </b-alert>
                </b-modal>
            </b-col>
            <b-col sm="1">
                <b-button v-b-modal="'delete-subject-' + current.id" variant="danger">
                    Delete
                </b-button>
                <b-modal :id="'delete-subject-' + current.id" @cancel="clearErrors"
                         @ok="deleteSubject" cancel-variant="success"
                         centered ok-variant="danger"
                         ref="modal"
                         title="Are you sure?"
                >
                    Are you sure that you want to delete this subject?<br>
                    This will cause the deletion of all the lessons, that are
                    associated with this subject.
                    <b-alert show v-if="deleteError !== ''" variant="danger">
                        {{deleteError}}
                    </b-alert>
                </b-modal>
            </b-col>
        </b-row>
    </div>
</template>

<script>
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "Subject",
		data() {
			return {
				selectedSubjectType: this.current.type,
				editedSubjectName: this.current.name,
				invalidFieldsError: {},
				editError: '',
				deleteError: ''
			};
		},
		props: {
			current: Object,
			onDelete: Function,
			onEdit: Function,
		},
		methods: {
			deleteSubject: function (event) {
				event.preventDefault();
				axios.delete(API_SERVER_PATH + `/subject/${this.current.id}/delete`, {
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
			editSubject: function (event) {
				event.preventDefault();
				axios.put(API_SERVER_PATH + `/subject/${this.current.id}/update`, {
					id: this.current.id,
					name: this.editedSubjectName,
					type: this.selectedSubjectType
				}, {
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
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.editError = '';
				this.deleteError = '';
			}
		}
	}
</script>

<style scoped>
    .subject-bubble {
        background-color: whitesmoke;
        font-size: 28px;
        padding: 10px;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
