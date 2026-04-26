import SearchComponent from "../components/search-component.js";
import { userService } from "../services/user.service.js";
import { authService } from "../services/auth.service.js";

class SearchPage {
  constructor() {
    this.currentUserId = userService.getUserId();
    this.searchComponent = new SearchComponent();
    this.initElements();
    this.showUserMenu(this.currentUserId);
    this.bindEvents();
  }

  initElements() {
    this.linksContainer = document.querySelector(".links");
    this.userMenuContainer = document.querySelector(".user-menu");
    this.logoutBtn = document.querySelector(".logout-button");
  }

  showUserMenu(userId) {
    if (userId) {
      this.userMenuContainer.classList.add("active");
    } else {
      this.linksContainer.classList.add("active");
    }
  }

  bindEvents() {
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", () => {
        authService.logout(this.currentUserId);
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SearchPage();
});
