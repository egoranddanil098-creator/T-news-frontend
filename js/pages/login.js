import { authService } from "../services/auth.service.js";

class LoginPage {
  constructor() {
    this.initElements();
    this.bindEvents();
    this.checkAuthStatus();
  }

  initElements() {
    this.usernameInput = document.querySelector(".input-login");
    this.passwordInput = document.querySelector(".input-password");
    this.loginBtn = document.querySelector(".btn-login");
    this.registerBtn = document.querySelector(".btn-register");
  }

  bindEvents() {
    this.loginBtn.addEventListener("click", () => this.handleLogin());
    this.registerBtn.addEventListener("click", () => this.handleRegister());
    this.passwordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleLogin();
      }
    });
  }

  checkAuthStatus() {
    if (authService.isAuthenticated()) {
      window.location.href = "../../../frontend/html/main.html";
    }
  }

  async handleLogin() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;

    if (!username || !password) {
      this.showError("Пожалуйста, заполните все поля");
      return;
    }

    try {
      this.loginBtn.disabled = true;
      await authService.login(username, password);

      window.location.href = "../../../frontend/html/main.html";
    } catch (error) {
      this.showError("Неверный логин или пароль");
      console.error("Login failed:", error);
    } finally {
      this.loginBtn.textContent = "Войти";
      this.loginBtn.disabled = false;
    }
  }

  handleRegister() {
    window.location.href = "../../../frontend/html/register.html";
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
  new LoginPage();
});
