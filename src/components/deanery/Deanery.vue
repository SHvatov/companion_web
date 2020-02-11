<template>
    <div class="deanery-container">
        <b-navbar toggleable="lg" type="dark" variant="dark">
            <b-navbar-brand>
                <strong>Companion</strong>
            </b-navbar-brand>

            <b-collapse accordion="" id="nav-collapse" is-nav>
                <strong>
                    <b-navbar-nav fill>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/deanery/events"
                        >
                            Events
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/deanery/groups"
                        >
                            Groups
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/deanery/subjects"
                        >
                            Subjects
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/deanery/professors"
                        >
                            Professors
                        </b-nav-item>
                        <b-nav-item exact
                                    exact-active-class="active"
                                    to="/deanery/timetables"
                        >
                            Timetable
                        </b-nav-item>
                    </b-navbar-nav>
                </strong>
                <b-navbar-nav class="ml-auto">
                    <b-nav-item-dropdown right>
                        <template v-slot:button-content>
                            <strong>Deanery User</strong>
                        </template>
                        <b-dropdown-item to="/">Sign Out</b-dropdown-item>
                    </b-nav-item-dropdown>
                </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        <router-view>
        </router-view>
    </div>
</template>

<script>
	import {mapMutations} from "vuex";
	import {LOGOUT} from "@/store/modules/security";

	export default {
		name: "Deanery",
		methods: {
			...mapMutations('security', {
				logout: LOGOUT
			})
		},
		beforeDestroy() {
			this.logout();
		}
	}
</script>

<style scoped>
    .deanery-container {
        background-color: whitesmoke;
        margin: 1% 1%;
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 98%;
    }
</style>
