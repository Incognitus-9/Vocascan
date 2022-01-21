import { defineState } from "redux-localstore";

import { SET_LANGUAGE } from "../Actions/index.js";

const defaultState = {
  language: "en",
};

const initialState = defineState(defaultState)("setting");

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload.language,
      };

    default:
      return state;
  }
};

export default loginReducer;
