import { UI } from "../../lang/en/user.js";
import { HTML } from "../constants.js";
export class ElementFactory {
    static imageForm() {
        const imageForm = $(HTML.ELEMENTS.FORM);
        const imageInput = $(HTML.ELEMENTS.INPUT).attr({ type: HTML.TYPES.FILE });
        const submitButton = $(HTML.ELEMENTS.BUTTON)
            .attr({
                type: HTML.TYPES.SUBMIT,
            })
            .text(UI.TEXT.SUBMIT_BUTTON);
        imageForm.html("Select an image to generate a caption")
        imageForm.append(imageInput, submitButton);
        imageForm.on(HTML.EVENTS.SUBMIT, (event) => {
            event.preventDefault();

            const file = imageInput[0].files[0];
            console.log(file);
        });
        return imageForm
    }

    static logoutButton() {
        return $(HTML.ELEMENTS.BUTTON)
            .addClass("logout-button")
            .text(UI.TEXT.LOGOUT_BUTTON)
            .click(() => {
                localStorage.removeItem("accessToken");
                WindowManager.indexPage();
            });
    }

    static signupButton() {
        return $(HTML.ELEMENTS.BUTTON)
            .text(UI.TEXT.SIGNUP_BUTTON)
            .click(() => {
                WindowManager.signUpPage();
            });
    }

    static loginButton() {
        return $(HTML.ELEMENTS.BUTTON)
            .text(UI.TEXT.LOGIN_BUTTON)
            .click(() => {
                WindowManager.logInPage();
            });
    }
}