<template>
    <div>
        <b-card no-body>
            <template v-slot:header>
                <h4 class="mb-0">{{current.event.title}}</h4>
            </template>

            <b-card-body>
                <b-row class="event-view-row">
                    <strong>Dates: </strong>
                    {{new Date(current.event.startDate).toLocaleString()}} - {{new
                    Date(current.event.endDate).toLocaleString()}}
                </b-row>
                <b-row class="event-view-row">
                    <strong>Description:</strong>{{current.event.description}}
                </b-row>
                <b-row class="event-view-row">
                    <strong>Visitors:</strong>{{current.visitors}}
                </b-row>
                <b-row class="event-view-row">
                    <strong>Attachments: </strong>
                    <strong v-if="current.attachments.length === 0">Empty</strong>
                </b-row>
                <b-row class="event-view-row" v-bind:key="a.id" v-for="a in current.attachments">
                    <b-col>
                        <b-link :href="a.endpointUrl + '/' + a.fileBucket + '/' + a.fileKey">
                            {{a.fileKey}}
                        </b-link>
                    </b-col>
                    <b-col>
                        <b-button @click="() => removeAttachment(a.id)" variant="danger">
                            Delete
                        </b-button>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="8">
                        <b-form-file
                                :state="Boolean(newAttachmentFile)"
                                drop-placeholder="Drop file here..."
                                placeholder="Choose a file or drop it here..."
                                v-model="newAttachmentFile"
                        />
                    </b-col>
                    <b-col sm="4">
                        <b-button @click="addAttachment" v-if="!isUploading" variant="success">Upload</b-button>
                        <b-spinner label="Spinning" v-if="isUploading" variant="success"/>
                    </b-col>
                    <b-alert class="text-center" show style="margin: 10px" v-if="attachmentError !== ''"
                             variant="danger">
                        {{attachmentError}}
                    </b-alert>
                </b-row>
            </b-card-body>

            <template v-slot:footer>
                <b-row class="event-view-row">
                    <b-col>
                        <b-button block v-b-modal="'edit-event-' + current.event.id" variant="success">
                            Edit
                        </b-button>
                        <b-modal :id="'edit-event-' + current.event.id"
                                 @cancel="clearErrors" @ok="editEvent"
                                 cancel-variant="danger"
                                 ok-title="Edit"
                                 ok-variant="success"
                                 ref="modal"
                                 title="Edit existing event"
                        >
                            <div class="edit-container">
                                <b-input-group prepend="Title" size="md">
                                    <b-form-input :value="current.event.title" v-model="updatedEvent.title"/>
                                </b-input-group>
                                <b-alert show v-if="invalidFieldsError.hasOwnProperty('title')" variant="danger">
                                    {{invalidFieldsError['title']}}
                                </b-alert>
                            </div>
                            <div class="edit-container">
                                <b-form-textarea
                                        :value="current.event.description"
                                        id="textarea-auto-height"
                                        max-rows="8"
                                        placeholder="Input you description here"
                                        rows="3"
                                        v-model="updatedEvent.description"
                                />
                                <b-alert show v-if="invalidFieldsError.hasOwnProperty('description')" variant="danger">
                                    {{invalidFieldsError['description']}}
                                </b-alert>
                            </div>
                            <div class="edit-container">
                                <datetime :value="updatedEvent.startDate" format="YYYY-MM-DD H:i:s"
                                          v-model="updatedEvent.startDate"/>
                                <b-alert show v-if="invalidFieldsError.hasOwnProperty('startDate')"
                                         variant="danger">
                                    {{invalidFieldsError['startDate']}}
                                </b-alert>
                            </div>
                            <div class="edit-container">
                                <datetime :value="updatedEvent.endDate" format="YYYY-MM-DD H:i:s"
                                          v-model="updatedEvent.endDate"/>
                                <b-alert show v-if="invalidFieldsError.hasOwnProperty('endDate')" variant="danger">
                                    {{invalidFieldsError['endDate']}}
                                </b-alert>
                            </div>
                            <div class="edit-container">
                                <b-form-select :value="updatedEvent.participantType" class="mb-3"
                                               name="Select receivers"
                                               size="md"
                                               v-model="current.event.participantType"
                                >
                                    <option value="ALL">All users</option>
                                    <option value="PROFESSORS">Professors only</option>
                                    <option value="STUDENTS">Students only</option>
                                </b-form-select>
                            </div>
                            <b-alert show v-if="editError !== ''" variant="danger">
                                {{editError}}
                            </b-alert>
                        </b-modal>
                    </b-col>
                    <b-col>
                        <b-button block v-b-modal="'delete-modal-' + current.event.id" variant="danger">
                            Cancel
                        </b-button>
                        <b-modal :id="'delete-modal-' + current.event.id" @cancel="clearErrors"
                                 @ok="deleteEvent" cancel-variant="success"
                                 centered ok-variant="danger"
                                 ref="modal"
                                 title="Are you sure?"
                        >
                            Are you sure that you want to cancel this event?<br>
                            In this case emails will be sent to all participants.
                            <b-alert show v-if="deleteError !== ''" variant="danger">
                                {{deleteError}}
                            </b-alert>
                        </b-modal>
                    </b-col>
                </b-row>
            </template>
        </b-card>
    </div>
</template>

<script>
	import axios from "axios";
	import datetime from 'vuejs-datetimepicker';
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "EventView",
		components: {datetime},
		data() {
			return {
				isUploading: false,
				updatedEvent: {
					id: this.current.event.id,
					title: this.current.event.title,
					description: this.current.event.description,
					startDate: this.current.event.startDate,
					endDate: this.current.event.endDate,
					participantType: this.current.event.participantType
				},
				newAttachmentFile: null,
				invalidFieldsError: {},
				fetchError: '',
				deleteError: '',
				editError: '',
				attachmentError: ''
			}
		},
		props: {
			current: Object,
			onEdit: Function,
			onDelete: Function
		},
		methods: {
			editEvent: function (event) {
				event.preventDefault();
				this.updatedEvent = Object.assign({}, this.updatedEvent, {
					startDate: new Date(this.updatedEvent.startDate),
					endDate: new Date(this.updatedEvent.endDate)
				});

				axios.put(API_SERVER_PATH + `/event/${this.current.event.id}/update`, this.updatedEvent, {
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
			deleteEvent: function (event) {
				event.preventDefault();

				axios.delete(API_SERVER_PATH + `/event/${this.current.event.id}/delete`, {
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
			addAttachment: function () {
				this.isUploading = true;
				let fileData = new FormData();
				fileData.append("file", this.newAttachmentFile);

				axios.post(API_SERVER_PATH + `/event/${this.current.event.id}/attachment/add`, fileData, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token'],
						'Content-Type': 'multipart/form-data'
					}
				}).then(() => {
					this.clearErrors();
					this.isUploading = false;
					this.onEdit();
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
				axios.delete(API_SERVER_PATH + `/event/${this.current.event.id}/attachment/${attachmentId}/delete`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.onEdit();
				}).catch((error) => {
					if (error.response) {
						this.attachmentError = error.response.data;
					} else if (error.request) {
						this.attachmentError = "Server does not respond.";
					}
				});
			},
			clearErrors: function () {
				this.invalidFieldsError = {};
				this.fetchError = '';
				this.editError = '';
				this.deleteError = '';
				this.attachmentError = '';
			}
		}
	}
</script>

<style scoped>
    .event-view-row {
        padding: 5px 2px;
        margin: 5px 2px;
        font-size: 25px;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
