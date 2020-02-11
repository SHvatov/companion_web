import {NOT_AUTHENTICATED} from "@/utils/constants";

export const AUTHENTICATE = "AUTHENTICATE";
export const LOGOUT = "LOGOUT";

const state = {
	id: "",
	userId: "",
	email: "",
	password: "",
	role: NOT_AUTHENTICATED,
	token: ""
};

const getters = {
	role: state => {
		return state.role
	},
	token: state => {
		return state.token
	},
	id: state => {
		return state.id
	},
	userId: state => {
		return state.userId
	}
};

const mutations = {
	[AUTHENTICATE](state, authCredentials) {
		Object.assign(state, authCredentials);
	},

	[LOGOUT](state) {
		Object.assign(state, {
			id: "",
			userId: "",
			email: "",
			password: "",
			role: NOT_AUTHENTICATED,
			token: "",
		});
	}
};

const actions = {};

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
