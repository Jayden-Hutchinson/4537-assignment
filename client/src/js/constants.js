export const $root = $("#root");

// DEPLOYED URL FOR PRODUCTION
export const SERVER_BASE_URL =
"https://j-hutchinson.com/COMP4537/assignment/server";

// LOCAL URL FOR TESTING
// export const SERVER_BASE_URL =
//   "http://localhost:3000/COMP4537/assignment/server";

// Where the optional proxy runs
export const PROXY_BASE = "http://127.0.0.1:3001";

export const PAGES = {
  INDEX: "index.html",
  LOGIN: "login.html",
  SIGNUP: "signup.html",
};

export const HTML = {
  IDS: {
    SIGNUP_FORM: "sign-up-form",
  },

  NAMES: {
    PASSWORD: "password",
    EMAIL: "email",
  },

  ELEMENTS: {
    BUTTON: "<button>",
    FORM: "<form>",
    INPUT: "<input>",
    IMG: "<img>",
    DIV: "<div>",
    H1: "<h1>",
    H2: "<h2>",
  },

  EVENTS: {
    SUBMIT: "submit",
    CHANGE: "change",
  },

  TYPES: {
    SUBMIT: "submit",
    TEXT: "text",
    EMAIL: "email",
    PASSWORD: "password",
    FILE: "file",
  },

  PLACEHOLDERS: {
    EMAIL: "Email",
    PASSWORD: "Password",
  },
};
