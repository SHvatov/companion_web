<template>
    <b-card no-body>
        <template v-slot:header>
            <h4 class="mb-0">Timetable for {{current.name}}</h4>
        </template>
        <b-card-body>
            <b-row sm="12" style="margin: 5px 0 30px">
                <b-button block style="width: 96%; margin-left: 2%; margin-right: 2%" v-b-modal.add-lesson
                          variant="success"
                >
                    Add lesson
                </b-button>
                <b-modal @cancel="clearErrors"
                         @ok="addLesson" cancel-variant="danger"
                         id="add-lesson"
                         ok-title="Add new"
                         ok-variant="success"
                         ref="modal"
                         title="Add new lesson"
                >
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :options="days"
                                     :searchable="true"
                                     :value="tempLesson.day"
                                     label="label"
                                     placeholder="Choose day of the week"
                                     tarck-by="value"
                                     v-model="tempLesson.day"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('day')" variant="danger">
                            {{invalidFieldsError['day']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Start time" size="md">
                            <b-form-input :value="tempLesson.startTime" type="time" v-model="tempLesson.startTime"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('startTime')" variant="danger">
                            {{invalidFieldsError['startTime']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Duration" size="md">
                            <b-form-input :value="tempLesson.duration" type="number" v-model="tempLesson.duration"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('duration')" variant="danger">
                            {{invalidFieldsError['duration']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Auditory" size="md">
                            <b-form-input :value="tempLesson.auditory" v-model="tempLesson.auditory"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('auditory')" variant="danger">
                            {{invalidFieldsError['auditory']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <b-input-group prepend="Location" size="md">
                            <b-form-input :value="tempLesson.location" v-model="tempLesson.location"/>
                        </b-input-group>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('location')" variant="danger">
                            {{invalidFieldsError['location']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :options="current.subjects"
                                     :searchable="true"
                                     :value="tempLesson.subject"
                                     label="name"
                                     placeholder="Choose subject"
                                     track-by="id"
                                     v-model="tempLesson.subject"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('subject')" variant="danger">
                            {{invalidFieldsError['subject']}}
                        </b-alert>
                    </div>
                    <div class="edit-container">
                        <multiselect :clear-on-select="false" :close-on-select="true"
                                     :multiple="true"
                                     :options="groups"
                                     :searchable="true"
                                     :value="tempLesson.groups"
                                     label="number"
                                     placeholder="Choose groups"
                                     track-by="id"
                                     v-model="tempLesson.groups"/>
                        <b-alert show v-if="invalidFieldsError.hasOwnProperty('groups')" variant="danger">
                            {{invalidFieldsError['groups']}}
                        </b-alert>
                    </div>
                    <b-alert show v-if="addError !== ''" variant="danger">
                        {{addError}}
                    </b-alert>
                </b-modal>
            </b-row>
            <b-row>
                <b-col sm="2" v-bind:key="d.value" v-for="d in days">
                    <b-card no-body>
                        <template v-slot:header>
                            <h6 class="mb-0">
                                {{d.label}}
                            </h6>
                        </template>
                        <b-card-body>
                            <b-row v-bind:key="l.id" v-for="l in sortedLessons">
                                <lesson-view :current="l"
                                             :on-delete="onDelete"
                                             v-if="l.day === parseInt(d.value)"/>
                            </b-row>
                        </b-card-body>
                    </b-card>
                </b-col>
            </b-row>
        </b-card-body>
    </b-card>
</template>

<script>
	import {API_SERVER_PATH} from "@/utils/constants";
	import axios from "axios";
	import LessonView from "@/components/deanery/timetable/LessonView";

	export default {
		name: "TimetableView",
		components: {LessonView},
		props: {
			current: Object,
			groups: Array,
			onAdd: Function,
			onDelete: Function
		},
		computed: {
			sortedLessons() {
				function compare(a, b) {
					return a.startTime - b.startTime;
				}

				return Object.values(this.current.lessons).sort(compare);
			}
		},
		data() {
			return {
				days: [
					{label: 'Monday', value: '1'},
					{label: 'Tuesday', value: '2'},
					{label: 'Wednesday', value: '3'},
					{label: 'Thursday', value: '4'},
					{label: 'Friday', value: '5'},
					{label: 'Saturday', value: '6'},
				],
				tempLesson: {
					day: {},
					startTime: '',
					duration: '',
					auditory: '',
					location: '',
					subject: {},
					professor: '',
					groups: []
				},
				invalidFieldsError: {},
				addError: ''
			}
		},
		methods: {
			addLesson: function (event) {
				event.preventDefault();

				let time = this.tempLesson.startTime.split(':'),
					timeInt = -1000;
				if (time.length === 2) {
					timeInt = parseInt(time[0]) * 3600 + parseInt(time[1]) * 60;
				}

				let temp = Object.assign({}, this.tempLesson, {
					day: this.tempLesson.day.value,
					professor: this.current.id,
					startTime: timeInt,
					subject: this.tempLesson.subject.id,
					groups: this.tempLesson.groups.map(g => g.id),
					duration: parseInt(this.tempLesson.duration) * 60
				});

				axios.post(API_SERVER_PATH + `/lesson/add`, temp, {
					headers: {
						'Authorization': 'Bearer ' + this.$store.getters['security/token']
					}
				}).then(() => {
					this.clearErrors();
					this.clearBuffer();
					this.onAdd();
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
				this.addError = '';
			},
			clearBuffer: function () {
				this.tempLesson = {
					day: '1',
					start: '',
					duration: '',
					auditory: '',
					location: '',
					subject: {},
					professor: '',
					groups: []
				}
			}
		}
	}
</script>

<style scoped>
    .edit-container {
        margin: 10px;
        padding: 10px;
    }
</style>
