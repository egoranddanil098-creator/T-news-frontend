import { userService } from "../services/user.service.js";
import { followsService } from "../services/follows.servise.js";
import { authService } from "../services/auth.service.js";
import SearchComponent from "../components/search-component.js";
import PostComponent from "../components/post-component.js";

class ProfilePage {
  constructor() {
    this.initElements();

    this.urlUserId = this.getUserIdFromURL();
    this.currentUserId = userService.getUserId();
    this.isOwnProfile = this.checkIfOwnProfile();

    this.searchComponent = new SearchComponent();
    this.postComponent = new PostComponent({
      container: this.divListPosts,
      canDelete: this.isOwnProfile,
    });

    this.setupProfileElements();
    this.showUserMenu(this.currentUserId);
    this.loadProfileData();
    this.loadPosts();
    this.bindEvents();

    this.isEditingName = false;
    this.isEditingDescription = false;
  }

  initElements() {
    this.fileInput = document.getElementById("fileInput");
    this.changeImgBtn = document.querySelector(".change-img");
    this.editNameBtn = document.querySelector(".edit-name");
    this.editDescriptionBtn = document.querySelector(".edit-description");
    this.subscriptionBtn = document.querySelector(".subscription");
    this.postSendBtn = document.querySelector(".post-send");
    this.divUserLogoBtn = document.querySelector(".user-logo-btn");
    this.divUserInfo = document.querySelector(".user-info");
    this.profileImage = document.getElementById("profileImage");
    this.userName = document.querySelector(".name");
    this.userDescription = document.querySelector(".user-description-text");
    this.divFormPost = document.querySelector(".form-post");
    this.divListPosts = document.querySelector(".list-posts");
    this.postInput = document.querySelector(".post-input");
    this.mainContainer = document.querySelector(".content");
    this.logoutBtn = document.querySelector(".logout-button");
    this.linksContainer = document.querySelector(".links");
    this.userMenuContainer = document.querySelector(".user-menu");
  }

  setupProfileElements() {
    const userId = this.urlUserId || this.currentUserId;

    if (!userId) {
      return;
    }

    if (this.divUserInfo) {
      this.divUserInfo.style.display = "flex";
    }

    if (this.isOwnProfile) {
      this.showOwnProfileElements();
    } else if (this.urlUserId) {
      this.showOtherProfileElements();
    }
  }

  async createPost() {
    let newPost = this.postInput.value;
    if (!newPost.trim()) {
      this.showError("Пост не может быть пустым");
      return;
    }

    try {
      const userId = this.userId;
      await this.postComponent.createPost(userId, newPost);
      this.postInput.value = "";
    } catch (error) {
      this.showError("Ошибка при создании поста");
      console.error("Ошибка создания поста:", error);
    }
  }

  async loadPosts() {
    const userId = this.urlUserId || this.currentUserId;

    if (userId) {
      try {
        await this.postComponent.renderUserPosts(userId, {
          clearContainer: true,
          canDelete: this.isOwnProfile,
        });
      } catch (error) {
        console.error("Ошибка при загрузке постов:", error);
      }
    }
  }

  showOwnProfileElements() {
    if (this.divUserLogoBtn) {
      this.divUserLogoBtn.classList.add("active");
    }

    if (this.editNameBtn) {
      this.editNameBtn.classList.add("active");
    }

    if (this.editDescriptionBtn) {
      this.editDescriptionBtn.classList.add("active");
    }

    if (this.divFormPost) {
      this.divFormPost.classList.add("active");
    }

    if (this.subscriptionBtn) {
      this.subscriptionBtn.style.display = "none";
    }
  }

  showOtherProfileElements() {
    if (this.divUserLogoBtn) {
      this.divUserLogoBtn.style.display = "none";
    }

    if (this.editNameBtn) {
      this.editNameBtn.style.display = "none";
    }

    if (this.editDescriptionBtn) {
      this.editDescriptionBtn.style.display = "none";
    }

    if (this.divFormPost) {
      this.divFormPost.style.display = "none";
    }

    if (this.subscriptionBtn) {
      this.subscriptionBtn.style.display = "block";
      this.divUserInfo.style = "width: 100%";
      this.setTextForSubscriptionBtn();
    }
  }

  showUserMenu(userId) {
    if (userId) {
      this.userMenuContainer.classList.add("active");
    } else {
      this.linksContainer.classList.add("active");
    }
  }

  loadProfileData() {
    const userId = this.urlUserId || this.currentUserId;

    if (userId) {
      this.userId = userId;
      this.setUserData(userId);
    } else {
      console.error("No user ID to load data");
    }
  }

  getUserIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    return userId ? parseInt(userId) : null;
  }

  checkIfOwnProfile() {
    if (!this.currentUserId) return false;
    if (!this.urlUserId) return true;

    return this.currentUserId == this.urlUserId;
  }

  bindEvents() {
    if (this.changeImgBtn && this.divUserLogoBtn.classList.contains("active")) {
      this.changeImgBtn.addEventListener("click", () => {
        this.fileInput.click();
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (event) => {
        this.handleFileSelect(event);
      });
    }

    if (this.editNameBtn && this.editNameBtn.classList.contains("active")) {
      this.editNameBtn.addEventListener("click", () => {
        this.toggleNameEdit();
      });
    }

    if (
      this.editDescriptionBtn &&
      this.editDescriptionBtn.classList.contains("active")
    ) {
      this.editDescriptionBtn.addEventListener("click", () => {
        this.toggleDescriptionEdit();
      });
    }

    if (this.subscriptionBtn && this.subscriptionBtn.style.display !== "none") {
      this.subscriptionBtn.addEventListener("click", () => {
        this.handleSubscription();
      });
    }

    if (this.postSendBtn && this.divFormPost.classList.contains("active")) {
      this.postSendBtn.addEventListener("click", () => {
        this.createPost();
      });
    }

    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", () => {
        authService.logout(this.currentUserId);
      });
    }
  }

  async handleSubscription() {
    if (!this.currentUserId || !this.urlUserId || this.isOwnProfile) {
      return alert("Войдите в систему, чтобы подписаться на пользователя");
    }
    try {
      if (this.subscriptionBtn.textContent === "Подписаться") {
        await followsService.followUser(this.currentUserId, this.urlUserId);
        this.subscriptionBtn.textContent = "Отписаться";
      } else {
        await followsService.unFollowUser(this.currentUserId, this.urlUserId);
        this.subscriptionBtn.textContent = "Подписаться";
      }
    } catch (error) {
      console.error("Subscription error:", error);
    }
  }

  async setTextForSubscriptionBtn() {
    if (!this.currentUserId || !this.urlUserId || this.isOwnProfile) {
      return;
    }
    try {
      const targetUserId = this.urlUserId
        ? this.urlUserId.toString()
        : this.currentUserId.toString();
      const followingList = await followsService.getFollowing(
        this.currentUserId,
      );
      const isFollowing = followingList.some(
        (user) => user.id === targetUserId,
      );
      this.subscriptionBtn.textContent = isFollowing
        ? "Отписаться"
        : "Подписаться";
    } catch (error) {
      console.error(error);
      this.subscriptionBtn.textContent = "Подписаться";
    }
  }

  toggleNameEdit() {
    if (this.isEditingName) {
      this.saveName();
    } else {
      this.startEditName();
    }
  }

  toggleDescriptionEdit() {
    if (this.isEditingDescription) {
      this.saveDescription();
    } else {
      this.startEditDescription();
    }
  }

  startEditName() {
    const currentName = this.userName.textContent;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "name name-input";
    nameInput.value = currentName;
    nameInput.style.cssText = `
          background-color: #00102408;
          border-radius: 12px;
          padding: 5px;
    `;

    this.nameInput = nameInput;
    this.userName.replaceWith(nameInput);
    this.isEditingName = true;
    nameInput.focus();

    nameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.saveName();
      }
    });

    nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.cancelEditName();
      }
    });
  }

  async saveName() {
    const newName = this.nameInput.value.trim();

    if (!newName) {
      alert("Имя не может быть пустым");
      return;
    }

    try {
      await userService.updateUserName(this.userId, newName);

      this.userName.textContent = newName;
      this.nameInput.replaceWith(this.userName);
      this.isEditingName = false;
      this.nameInput = null;
    } catch (error) {
      console.error("Ошибка при сохранении имени:", error);
      alert("Не удалось сохранить имя");
      this.cancelEditName();
    }
  }

  cancelEditName() {
    this.nameInput.replaceWith(this.userName);
    this.isEditingName = false;
    this.nameInput = null;
  }

  startEditDescription() {
    const currentDescription = this.userDescription.textContent;
    const descriptionTextarea = document.createElement("textarea");
    descriptionTextarea.className =
      "user-description-text description-textarea";
    descriptionTextarea.value = currentDescription;
    descriptionTextarea.style = `
      background-color: #00102408;
      border-radius: 12px;
      padding: 5px;
      min-width: 525px;
      height: 128px;
      outline: none;
    `;

    this.descriptionTextarea = descriptionTextarea;
    this.userDescription.replaceWith(descriptionTextarea);
    this.isEditingDescription = true;
    descriptionTextarea.focus();
    descriptionTextarea.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        this.saveDescription();
      }
      if (e.key === "Escape") {
        this.cancelEditDescription();
      }
    });
  }

  async saveDescription() {
    const newDescription = this.descriptionTextarea.value.trim();

    try {
      await userService.updateUserDescription(this.userId, newDescription);

      this.userDescription.textContent = newDescription;
      this.descriptionTextarea.replaceWith(this.userDescription);
      this.isEditingDescription = false;
      this.descriptionTextarea = null;
    } catch (error) {
      console.error("Ошибка при сохранении описания:", error);
      alert("Не удалось сохранить описание");
      this.cancelEditDescription();
    }
  }

  cancelEditDescription() {
    this.descriptionTextarea.replaceWith(this.userDescription);
    this.isEditingDescription = false;
    this.descriptionTextarea = null;
  }

  async setUserData(userId) {
    const data = await userService.getUserData(userId);
    this.profileImage.src = `http://localhost:3000/public/${data.avatar || "default.png"}`;
    this.userName.textContent = data.username;
    this.userDescription.textContent =
      data.bio ||
      "Здесь находится ваше описание, расскажите всем что-нибудь о себе!";
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profileImage.src = e.target.result;
      this.uploadFile(file);
    };
    reader.readAsDataURL(file);
  }

  async uploadFile(file) {
    try {
      await userService.uploadAvatar(this.userId, file);
    } catch (error) {
      console.error("Ошибка:", error);
    }
  }

  showError(message) {
    const old = document.querySelector(".error-message");
    old?.remove();

    const error = document.createElement("div");
    error.className = "error-message";
    error.textContent = message;
    error.style.cssText = `
      color: red;
      background: #ffe6e6;
      padding: 10px;
      margin-top: 10px;
      text-align: center;
      border-radius: 4px;
    `;

    this.divFormPost?.appendChild(error);

    setTimeout(() => error.remove(), 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProfilePage();
});
