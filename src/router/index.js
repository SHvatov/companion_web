import Vue from "vue";
import VueRouter from "vue-router";
import Login from "@/components/Login";
import Student from "@/components/student/Student";
import Professor from "@/components/professor/Professor";
import Deanery from "@/components/deanery/Deanery";
import store from "@/store";
import {ROLE_DEANERY, ROLE_PROFESSOR, ROLE_STUDENT} from "@/utils/constants";
import EventsContainer from "@/components/deanery/events/EventsContainer";
import SubjectsContainer from "@/components/deanery/subjects/SubjectsContainer";
import GroupsContainer from "@/components/deanery/groups/GroupsContainer";
import ProfessorContainer from "@/components/deanery/professor/ProfessorContainer";
import TimetableContainer from "@/components/deanery/timetable/TimetableContainer";
import ProfessorTimetable from "@/components/professor/ProfessorTimetable";
import ProfessorEventContainer from "@/components/professor/ProfessorEventContainer";
import StudentTimetable from "@/components/student/StudentTimetable";
import StudentEventContainer from "@/components/student/StudentEventContainer";
import TaskContainer from "@/components/common/tasks/TaskContainer";
import ProfessorTaskContainer from "@/components/professor/task/ProfessorTaskContainer";
import ProfessorTaskView from "@/components/professor/task/ProfessorTaskView";
import ProfessorStudentTaskView from "@/components/professor/task/ProfessorStudentTaskView";
import StudentTaskContainer from "@/components/student/task/StudentTaskContainer";
import StudentTaskView from "@/components/student/task/StudentTaskView";

Vue.use(VueRouter);

const router = new VueRouter({
	mode: 'history',
	routes: [
		{path: '/', component: Login},
		{
			path: '/professor', component: Professor,
			children: [
				{
					path: 'lessons',
					component: ProfessorTimetable
				},
				{
					path: 'events',
					component: ProfessorEventContainer
				},
				{
					path: 'tasks',
					component: TaskContainer,
					children: [
						{
							path: 'all',
							component: ProfessorTaskContainer
						},
						{
							path: ':taskId',
							component: ProfessorTaskView
						},
						{
							path: ':taskId/sub/:studentTaskId',
							component: ProfessorStudentTaskView
						}
					]
				}
			]
		},
		{
			path: '/student', component: Student,
			children: [
				{
					path: 'lessons',
					component: StudentTimetable
				},
				{
					path: 'events',
					component: StudentEventContainer
				},
				{
					path: 'tasks',
					component: TaskContainer,
					children: [
						{
							path: 'all',
							component: StudentTaskContainer
						},
						{
							path: ':professorTaskId/:studentTaskId',
							component: StudentTaskView
						}
					]
				}
			]
		},
		{
			path: '/deanery', component: Deanery,
			children: [
				{
					path: 'subjects',
					component: SubjectsContainer
				},
				{
					path: 'events',
					component: EventsContainer
				},
				{
					path: 'groups',
					component: GroupsContainer
				},
				{
					path: 'professors',
					component: ProfessorContainer
				},
				{
					path: 'timetables',
					component: TimetableContainer
				}
			]
		},
	],
});

router.beforeEach((to, from, next) => {
	let role = store.getters['security/role'];
	if (role === ROLE_DEANERY
		|| (role === ROLE_PROFESSOR && to.fullPath.startsWith("/professor"))
		|| (role === ROLE_STUDENT && to.fullPath.startsWith("/student"))
		|| to.fullPath === "/") {
		next();
	} else {
		next(false);
	}
});

export default router;
