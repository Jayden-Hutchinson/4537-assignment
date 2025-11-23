import { PAGES } from "../constants.js";

export class WindowManager {
  static indexPage() {
    window.location.href = PAGES.INDEX;
  }

  static signUpPage() {
    window.location.href = PAGES.SIGNUP;
  }

  static logInPage() {
    window.location.href = PAGES.LOGIN;
  }
}
export class WindowManager {
  static indexPage() {
    window.location.href = '/index.html';
  }

  static signUpPage() {
    window.location.href = '/signup.html';
  }

  static logInPage() {
    window.location.href = '/login.html';
  }
}
