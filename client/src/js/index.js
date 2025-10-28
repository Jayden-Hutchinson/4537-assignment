import { $root, ELEMENTS, PAGES } from "./constants"

class Index {
    constructor() {
        const signInButton = $(ELEMENTS.BUTTON).text("Sign In").click(() => {
            this.toPage(PAGES.SIGN_IN)
        });

        const signUpButton = $(ELEMENTS.BUTTON).text("Sign Up").click(() => {
            this.toPage(PAGES.SIGN_UP)
        });

        $root.append(signInButton, signUpButton)
    }

    toPage = (page) => {
        window.location.href = page;
    }

}

new Index();