import { userService } from "../services/user.service.js";
import SearchComponent from "../components/search-component.js";
import PostComponent from "../components/post-component.js";
import { authService } from "../services/auth.service.js";

class MainPage {
  constructor() {
    this.initElements();

    this.currentUserId = userService.getUserId();

    this.searchComponent = new SearchComponent();
    this.postComponent = new PostComponent({
      container: this.mainContainer,
    });

    this.loadPosts(this.currentUserId);
    this.showUserMenu(this.currentUserId);
    this.bindEvents();
  }

  initElements() {
    this.mainContainer = document.querySelector(".content");
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

  async loadPosts(userId) {
    if (userId) {
      try {
        await this.postComponent.renderFeed(userId, {
          clearContainer: true,
        });
      } catch (error) {
        console.error("Ошибка при загрузке постов:", error);
      }
    } else {
      try {
        await this.postComponent.renderAllPosts({
          clearContainer: true,
        });
      } catch (error) {
        console.error("Ошибка при загрузке всех постов:", error);
      }
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
  new MainPage();
});
