import { registerService } from "../services/register.service.js";

class RegisterPage {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.checkAuthStatus();
  }

  initElements() {
    this.usernameInput = document.querySelector(".input-login");
    this.firstPasswordInput = document.querySelector(".input-password");
    this.secondPasswordInput = document.querySelector(".input-repeat-password");
    this.loginBtn = document.querySelector(".btn-login");
    this.registerBtn = document.querySelector(".btn-register");
  }

  bindEvents() {
    this.loginBtn.addEventListener("click", () => this.handleLogin());
    this.registerBtn.addEventListener("click", () => this.handleRegister());

    this.passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleRegister();
      }
    });
  }

  checkAuthStatus() {
    if (registerService.isAuthenticated()) {
      window.location.href = "/html/main.html";
    }
  }

  handleLogin() {
    window.location.href = "/html/login.html";
  }

  async handleRegister() {
    const username = this.usernameInput.value.trim();
    const firstPassword = this.firstPasswordInput.value;
    const secondPassword = this.secondPasswordInput.value;

    if (!this.validation(username, firstPassword, secondPassword)) {
      return;
    }

    try {
      this.loginBtn.disabled = true;

      await registerService.register(username, firstPassword);

      window.location.href = "/html/main.html";
    } catch (error) {
      this.showError("Неверный логин или пароль");
      console.error("Register failed:", error);
    } finally {
      this.loginBtn.textContent = "Войти";
      this.loginBtn.disabled = false;
    }
  }

  validation(username, firstPassword, secondPassword) {
    if (!username || !firstPassword || !secondPassword) {
      this.showError("Пожалуйста, заполните все поля");
      return false;
    } else if (firstPassword !== secondPassword) {
      this.showError("Пароли не совпадают");
      return false;
    } else if (firstPassword.length < 6 || firstPassword.length > 50) {
      this.showError("Длина пароля должна быть от 6 до 50 символов");
      return false;
    } else if (username.length < 3 || username.length > 50) {
      this.showError("Длина логина должна быть от 3 до 50 символов");
      return false;
    }
    return true;
  }

  showError(message) {
    const oldError = document.querySelector(".error-message");
    if (oldError) {
      oldError.remove();
    }

    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.textContent = message;
    errorElement.style.color = "red";
    errorElement.style.marginTop = "5px";
    errorElement.style.textAlign = "center";

    const buttonsContainer = document.querySelector(".form-container");
    buttonsContainer.appendChild(errorElement);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new RegisterPage();
});
