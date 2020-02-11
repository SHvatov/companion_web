<template>
    <div>
        <b-card class="task-card" no-body>
            <template v-slot:header>
                <h5 class="mb-0">
                    <b-row>
                        <b-col>
                            <strong>{{current.task.title}}</strong>
                        </b-col>
                        <b-col>
                            <b-badge v-if="messagesNumber !== 0" variant="warning">
                                {{messagesNumber + ' new messages'}}
                            </b-badge>
                        </b-col>
                        <b-col>
                            <b-badge v-if="completedNumber !== 0" variant="success">
                                {{completedNumber + ' more sub tasks are completed'}}
                            </b-badge>
                        </b-col>
                        <b-col>
                            <b-badge
                                    :variant="daysBeforeDeadline >= 3 ? 'success' : (daysBeforeDeadline >= 1 ? 'warning' : 'danger')">
                                {{Math.abs(daysBeforeDeadline) + ' days ' + (daysBeforeDeadline > 0 ? 'before' :
                                'after') + ' deadline'}}
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
                        <div class="task-card-elem text-center">
                            {{current.task.description}}
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
                        <div class="task-card-elem text-center">
                            {{current.task.dueDate.slice(0, 19).replace('T', ' ')}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Priority</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{current.task.priority}}
                        </div>
                    </b-col>
                </b-row>
                <b-row>
                    <b-col sm="2">
                        <div class="task-card-elem text-center">
                            <strong><i>Type</i></strong>
                        </div>
                    </b-col>
                    <b-col sm="10">
                        <div class="task-card-elem text-center">
                            {{current.task.type.replace('_', ' ')}}
                        </div>
                    </b-col>
                </b-row>
            </b-card-body>

            <template v-slot:footer>
                <h6 class="mb-0">
                    <b-button :to="`/professor/tasks/${current.task.id}`" block>
                        <strong>Go to task</strong>
                    </b-button>
                </h6>
            </template>
        </b-card>
    </div>
</template>

<script>
	export default {
		name: "ProfessorTaskCard",
		props: {
			current: Object,
			onEdit: Function,
			onDelete: Function
		},
		computed: {
			messagesNumber() {
				return this.current.notifications.filter(n => {
					return n.type === 'NEW_MESSAGE'
				}).length;
			},
			completedNumber() {
				return this.current.notifications.filter(n => {
					return n.type === 'TASK_STATUS_UPDATED'
				}).length;
			},
			daysBeforeDeadline() {
				return Math.round(
					Math.abs(
						(new Date(this.current.task.dueDate).getTime()
							- new Date().getTime()
						) / (24 * 3600 * 1000)
					)
				);
			}
		}
	}
</script>

<style scoped>
    .task-card {
        margin: 10px;
        padding: 5px;
    }

    .task-card-elem {
        margin: 5px;
        padding: 10px;
        font-size: 22px;
        border-radius: 10px;
        background-color: whitesmoke;
    }
</style>
