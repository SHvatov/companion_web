<template>
    <div class="event-container">
        <b-row>
            <b-col>
                <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%" v-b-modal.add-event
                          variant="success"
                >
                    Add new event
                </b-button>
                <b-modal @cancel="clearErrors"
                         @ok="addEvent" cancel-variant="danger"
                         id="add-event"
                         ok-title="Add new"
                         ok-variant="success"
                         ref="modal"
                         title="Add new event"
                >
                    <div class="edit-container">
                        <b-input-group prepend="Title" size="md">
                            <b-form-input :value="newEvent.title" v-model="newEvent.title"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('title')" variant="danger">
                            {{invalidFieldsError['title']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-form-textarea
                                :value="newEvent.description"
                                id="textarea-auto-height"
                                max-rows="8"
                                placeholder="Input you description here"
                                rows="3"
                                v-model="newEvent.description"
                        />
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('description')" variant="danger">
                            {{invalidFieldsError['description']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <datetime :value="newEvent.startDate" format="YYYY-MM-DD H:i:s"
                                  v-model="newEvent.startDate"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('startDate')" variant="danger">
                            {{invalidFieldsError['startDate']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <datetime :value="newEvent.endDate" format="YYYY-MM-DD H:i:s"
                                  v-model="newEvent.endDate"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('endDate')" variant="danger">
                            {{invalidFieldsError['endDate']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-form-select :value="newEvent.participantType" class="mb-3" name="Select receivers"
                                       size="md"
                                       v-model="newEvent.participantType"
                        >
                            <option value="ALL">All users</option>
                            <option value="PROFESSORS">Professors only</option>
                            <option value="STUDENTS">Students only</option>
                        </b-form-select>
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
        <div class="event-card" v-bind:key="e.event.id" v-for="e in events">
            <event-view :current="e"
                        :on-delete="fetchEvents"
                        :on-edit="fetchEvents"
            />
        </div>
    </div>
</template>

<script>
	import datetime from 'vuejs-datetimepicker';
	import EventView from "@/components/deanery/events/EventView";
	import axios from "axios";
	import {API_SERVER_PATH} from "@/utils/constants";

	export default {
		name: "EventsContainer",
		components: {EventView, datetime},
		data() {
			return {
				events: {},
				newEvent: {
					title: "",
					description: "",
					startDate: '',
					endDate: '',
					participantType: 'ALL'
				},
				addError: "",
				fetchError: "",
				invalidFieldsError: {}
			}
		},
		methods: {
			fetchAttachments: function (eventId) {
				axios.get(API_SERVER_PATH + `/event/${eventId}/attachments`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.events = Object.assign({}, this.events, {
						[eventId]: {
							event: this.events[eventId].event,
							visitors: this.events[eventId].visitors,
							attachments: response.data
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
			fetchVisitors: function (eventId) {
				axios.get(API_SERVER_PATH + `/event/${eventId}/visitors`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.events = Object.assign({}, this.events, {
						[eventId]: {
							event: this.events[eventId].event,
							attachments: this.events[eventId].attachments,
							visitors: response.data
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
			fetchEvents: function () {
				axios.get(API_SERVER_PATH + `/event/list`, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then((response) => {
					this.clearErrors();
					this.events = {};
					for (let e of response.data) {
						Object.assign(this.events, {
							[e.id]: {
								event: e,
								attachments: [],
								visitors: 0
							}
						});
						this.fetchAttachments(e.id);
						this.fetchVisitors(e.id);
					}
				}).catch((error) => {
					if (error.response) {
						this.fetchError = error.response.data;
					} else if (error.request) {
						this.fetchError = "Server does not respond.";
					}
				})
			},
			addEvent: function (event) {
				event.preventDefault();
				this.clearErrors();

				Object.assign(this.newEvent, {
					startDate: new Date(this.newEvent.startDate),
					endDate: new Date(this.newEvent.endDate)
				});

				axios.post(API_SERVER_PATH + `/event/add`, this.newEvent, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.clearBuffer();
					this.fetchEvents();
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
				this.newEvent = {
					title: "",
					description: "",
					startDate: '',
					endDate: '',
					participantType: 'ALL'
				};
			}
		},
		mounted() {
			this.fetchEvents();
		}
	}
</script>

<style scoped>
    .event-container {
        margin: 20px;
        padding: 20px 20px;
        background-color: white;
    }

    .event-card {
        margin: 5px 10px;
        padding: 5px 10px;
    }

    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
