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
