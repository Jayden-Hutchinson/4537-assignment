import { $root, ELEMENTS, EVENTS } from "./constants.js";

class SignUp {
    constructor() {
        // Create a form
        const form = $(ELEMENTS.FORM).attr("id", "sign-up-forum");

        // Create input fields
        const nameInput = $(ELEMENTS.INPUT)
            .attr({
                type: "text",
                name: "name",
                placeholder: "Name",
                required: true
            });

        const emailInput = $(ELEMENTS.INPUT)
            .attr({
                type: "email",
                name: "email",
                placeholder: "Email",
                required: true
            });

        const passwordInput = $(ELEMENTS.INPUT)
            .attr({
                type: "password",
                name: "password",
                placeholder: "Password",
                required: true
            });

        // Create submit button
        const submitButton = $(ELEMENTS.BUTTON)
            .attr("type", "submit")
            .text("Sign Up");

        // Append all inputs and button to form
        form.append(nameInput, emailInput, passwordInput, submitButton);

        // Handle submit
        form.on(EVENTS.SUBMIT, function (e) {
            e.preventDefault(); // prevent page reload
            const formData = {
                name: nameInput.val(),
                email: emailInput.val(),
                password: passwordInput.val()
            };
            console.log("Form submitted:", formData);
            alert(`Welcome, ${formData.name}!`);
        });

        // Add the form to the root
        $root.append(form);
    }
}

new SignUp()