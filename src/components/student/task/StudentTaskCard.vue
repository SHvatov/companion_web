<template>
    <div class="task-card">
        <b-card no-body>
            <template v-slot:header>
                <h5 class="mb-0">
                    <b-row>
                        <b-col sm="7">
                            <strong>{{current.ptask.title}}</strong>
                        </b-col>
                        <b-col sm="2">
                            <b-badge :variant="deadlineBadgeVariant">
                                {{Math.abs(daysBeforeDeadline) + ' days ' + (daysBeforeDeadline > 0 ? 'before' :
                                'after') + ' deadline'}}
                            </b-badge>
                        </b-col>
                        <b-col sm="3">
                            <b-badge v-if="isAssessmentUpdated || calculateMessages > 0" variant="primary">
                                <strong>Task has unchecked notifications!</strong>
                            </b-badge>
                        </b-col>
                    </b-row>
                </h5>
            </template>
            <b-card-body>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Description</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.ptask.description !== 'undefined'">
                            {{current.ptask.description}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Professor</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.professor.user !== 'undefined'">
                            {{current.professor.user.firstName + ' ' + current.professor.user.secondName}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Subject</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.subject.type !== 'undefined'">
                            {{current.subject.name + ' - ' + current.subject.type.replace('_', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Status</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.stask.status !== 'undefined'">
                            {{current.stask.status.replace('_', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Assessment</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.stask.assessment !== 'undefined'">
                            {{current.stask.assessment.replace('_', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Due date</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center"
                             v-if="typeof current.ptask.dueDate !== 'undefined'">
                            {{current.ptask.dueDate.slice(0, 19).replace('T', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Notifications</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="5">
                        <div class="task-card-elem text-center">
                            {{calculateMessages + ' unread messages'}}
                        </div>
                    </b-col>
                    <b-col sm="5">
                        <div class="task-card-elem text-center">
                            {{isAssessmentUpdated ? 'Assessment has been updated' : 'Assessment was not updated'}}
                        </div>
                    </b-col>
                </b-row>
            </b-card-body>

            <template v-slot:footer>
                <div>
                    <b-button @click="gotoTask" block>
                        Open the task
                    </b-button>
                </div>
            </template>
        </b-card>
    </div>
</template>

<script>
	export default {
		name: "StudentTaskCard",
		props: {
			current: Object
		},
		computed: {
			deadlineBadgeVariant() {
				return this.daysBeforeDeadline >= 3 ? 'success' : (this.daysBeforeDeadline >= 1 ? 'warning' : 'danger');
			},
			daysBeforeDeadline() {
				return Math.round(
					Math.abs(
						(new Date(this.current.ptask.dueDate).getTime()
							- new Date().getTime()
						) / (24 * 3600 * 1000)
					)
				);
			},
			calculateMessages() {
				return this.current
					.notifications
					.filter(n => n.type === 'NEW_MESSAGE').length;
			},
			isAssessmentUpdated() {
				return this.current
					.notifications
					.filter(n => n.type === 'TASK_ASSESSMENT_UPDATED')
					.length !== 0;
			},
		},
		methods: {
			gotoTask() {
				this.$router.push(`/student/tasks/${this.current.ptask.id}/${this.current.stask.id}`);
			}
		}
	}
</script>

<style scoped>
    .task-card {
        margin: 10px;
        padding: 10px;
    }

    .task-card-elem {
        margin: 5px;
        padding: 10px;
        font-size: 22px;
        border-radius: 10px;
        background-color: whitesmoke;
    }
</style>
