<template>
    <div>
        <b-card no-body style="margin: 20px;">
            <template v-slot:header>
                <h4 class="mb-0">{{current.group.number}}</h4>
            </template>

            <b-card-body>
                <b-row style="margin: 5px 40px 5px 10px">
                    <b-col sm="10">
                        <b-button @click="() => {this.isCollapsed = !this.isCollapsed; clearErrors();}" block
                                  style="width: 96%; margin-left: 2%; margin-right: 2%"
                                  v-b-toggle="'collapse-edit-group-' + current.group.id"
                                  variant="success"
                        >
                            {{isCollapsed ? "Close" : "Edit number"}}
                        </b-button>
                        <b-collapse :id="'collapse-edit-group-' + current.group.id" class="mt2">
                            <b-card>
                                <b-row>
                                    <b-col sm="9">
                                        <div>
                                            <b-input-group prepend="Name" size="md">
                                                <b-form-input :value="current.group.number"
                                                              v-model="updatedGroupNumber"/>
                                            </b-input-group>
                                            <b-alert show v-if="invalidFieldsError.hasOwnProperty('number')"
                                                     variant="danger">
                                                {{invalidFieldsError['number']}}
                                            </b-alert>
                                        </div>
                                    </b-col>
                                    <b-col sm="2">
                                        <b-button @click="editGroup" variant="success">
                                            Submit
                                        </b-button>
                                    </b-col>
                                </b-row>
                                <b-row>
                                    <b-alert show v-if="editError !== ''" variant="danger">
                                        {{editError}}
                                    </b-alert>
                                </b-row>
                            </b-card>
                        </b-collapse>
                    </b-col>
                    <b-col sm="2">
                        <b-button block v-b-modal="'delete-group-' + current.group.id" variant="danger">
                            Delete
                        </b-button>
                        <b-modal :id="'delete-group-' + current.group.id" @cancel="clearErrors"
                                 @ok="deleteGroup" cancel-variant="success"
                                 centered ok-variant="danger"
                                 ref="modal"
                                 title="Are you sure?"
                        >
                            Are you sure that you want to delete this group?<br>
                            This will cause the deletion of all the students, that are
                            associated with this group.
                            <b-alert show v-if="deleteError !== ''" variant="danger">
                                {{deleteError}}
                            </b-alert>
                        </b-modal>
                    </b-col>
                </b-row>
                <b-row style="margin: 5px;">
                    <b-col sm="12">
                        <b-button @click="clearErrors" block
                                  style="width: 96%; margin-left: 2%; margin-right: 2%"
                                  v-b-toggle="'collapse-list-students-' + current.group.id"
                                  variant="primary"
                        >
                            List students
                        </b-button>
                        <b-collapse :id="'collapse-list-students-' + current.group.id" class="mt2">
                            <student-view :group="current.group.id"
                                          :id="student.id"
                                          :on-delete="onDelete"
                                          :on-edit="onEdit"
                                          :other-groups="otherGroups"
                                          v-bind:key="student.id"
                                          v-for="student in current.students"
                            />
                        </b-collapse>
                    </b-col>
                </b-row>
            </b-card-body>
        </b-card>
    </div>
</template>

<script>
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";
	import StudentView from "@/components/deanery/groups/StudentView";

	export default {
		name: "GroupView",
		components: {StudentView},
		data() {
			return {
				isCollapsed: false,
				updatedGroupNumber: this.current.group.number,
				fetchError: '',
				editError: '',
				deleteError: '',
				invalidFieldsError: {}
			}
		},
		props: {
			current: Object,
			otherGroups: Object,
			onEdit: Function,
			onDelete: Function
		},
		methods: {
			editGroup: function () {
				axios.put(API_SERVER_PATH + `/group/${this.current.group.id}/update`, {
					id: this.current.id,
					number: this.updatedGroupNumber
				}, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.onEdit();
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
			deleteGroup: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/group/${this.current.group.id}/delete`, {
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
		}
	}
</script>

<style scoped>

</style>
