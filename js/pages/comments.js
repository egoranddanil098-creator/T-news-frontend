import { postsService } from "../services/posts.service.js";
import { commentsService } from "../services/comments.service.js";
import { userService } from "../services/user.service.js";
import { authService } from "../services/auth.service.js";
import SearchComponent from "../components/search-component.js";

const PUBLIC_ASSET_BASE_URL =
  "https://t-news-backend-production.up.railway.app/public/";

class CommentsPage {
  constructor() {
    this.postId = this.getPostIdFromURL();
    if (!this.postId) {
      window.location.href = "../../../frontend/html/main.html";
      return;
    }

    this.currentUserId = userService.getUserId();
    this.searchComponent = new SearchComponent();

    this.initElements();
    this.bindEvents();
    this.showUserElements(this.currentUserId);
    this.loadPostDetails();
    this.loadComments();
  }

  getPostIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("postId");
  }

  initElements() {
    this.commentsContainer = document.querySelector(".comments-container");
    this.commentsList = document.querySelector(".comments-list");
    this.commentForm = document.querySelector(".add-comments");
    this.commentInput = document.querySelector(".comment-input");
    this.submitBtn = document.querySelector(".comment-send button");
    this.postContainer = document.querySelector(".content");
    this.backBtn = document.querySelector(".back-btn");
    this.linksContainer = document.querySelector(".links");
    this.userMenuContainer = document.querySelector(".user-menu");
    this.logoutBtn = document.querySelector(".logout-button");
  }

  bindEvents() {
    if (this.submitBtn) {
      this.submitBtn.addEventListener("click", (e) =>
        this.handleSubmitComment(e),
      );
    }

    if (this.commentInput) {
      this.commentInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmitComment(e);
        }
      });
    }

    if (this.commentsContainer) {
      this.commentsContainer.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".delete-comment");
        if (deleteBtn) {
          const commentId = deleteBtn.dataset.commentId;
          this.handleDeleteComment(commentId);
        }
      });
    }
    if (this.logoutBtn) {
      this.logoutBtn.addEventListener("click", () => {
        authService.logout(this.currentUserId);
      });
    }
  }

  showUserElements(userId) {
    if (userId) {
      this.userMenuContainer.classList.add("active");
      this.commentForm.classList.add("active");
    } else {
      this.linksContainer.classList.add("active");
    }
  }

  async loadPostDetails() {
    try {
      const post = await postsService.getPostData(this.postId);
      this.currentPost = post; // Сохраняем объект поста
      this.renderPost(post);
    } catch (error) {
      console.error(error);
      this.showError("Не удалось загрузить пост");
    }
  }

  async loadComments() {
    try {
      const comments = await commentsService.getComments(this.postId);
      this.renderComments(comments);
    } catch (error) {
      console.error(error);
      this.showError("Не удалось загрузить комментарии");
    }
  }

  // Проверяем, является ли текущий пользователь хозяином поста
  isPostOwner() {
    if (!this.currentUserId || !this.currentPost) return false;
    return this.currentUserId === this.currentPost.userId;
  }

  renderPost(post) {
    if (!this.postContainer) return;

    const avatarPath =
      post.avatar && post.avatar.startsWith("http")
        ? post.avatar
        : `${PUBLIC_ASSET_BASE_URL}${post.avatar || "default.png"}`;

    const postElement = document.createElement("article");
    postElement.className = "card";

    postElement.innerHTML = `
      <div class="author">
        <img class="logo-author" src="${avatarPath}" alt="${post.username}">
        <p class="authon-name">${post.username}</p>
      </div>
      <p class="text">${post.content}</p>
      <div class="actions">
        <button class="likes">
          <img src="../img/heart.svg" alt="heart icon">
          <p class="count_likes">${post.likes}</p>
        </button>
        <button class="comments">Комментарии ${post.comments}</button>
      </div>
    `;

    // Вставляем пост
    this.postContainer.prepend(postElement);

    // Обработчик лайков
    const likeButton = postElement.querySelector(".likes");
    likeButton.addEventListener("click", () =>
      this.handleLike(post.id, likeButton),
    );
  }

  async handleLike(postId, buttonElement) {
    try {
      const userId = userService.getUserId();
      if (!userId) {
        alert("Войдите в систему, чтобы ставить лайки");
        return;
      }

      const countElement = buttonElement.querySelector(".count_likes");
      const likesCount = Number(countElement.textContent);

      let result = await postsService.likePost(userId, postId);

      if (result.description === "Post already liked") {
        await postsService.unlikePost(userId, postId);
        countElement.textContent = Math.max(likesCount - 1, 0);
      } else {
        countElement.textContent = likesCount + 1;
      }
    } catch (error) {
      console.error(error);
    }
  }

  renderComments(comments) {
    if (!this.commentsList) return;

    this.commentsList.innerHTML = "";

    comments.forEach((comment) => {
      const avatarPath =
        comment.user.avatar && comment.user.avatar.startsWith("http")
          ? comment.user.avatar
          : `${PUBLIC_ASSET_BASE_URL}${comment.user.avatar || "default.png"}`;

      const commentElement = document.createElement("div");
      commentElement.className = "comment";
      commentElement.dataset.commentId = comment.id;

      commentElement.innerHTML = `
        <div class="author">
          <img class="logo-author" src="${avatarPath}" alt="${comment.user.username}">
          <p class="authon-name">${comment.user.username}</p>
        </div>
        <div class="comment-text">
          <p class="text">${this.escapeHtml(comment.content)}</p>
          ${
            this.isPostOwner()
              ? `<button class="delete-comment" data-comment-id="${comment.id}">
                  <img src="../img/delete.svg" alt="Удалить комментарий">
                </button>`
              : ""
          }
        </div>
      `;

      this.commentsList.appendChild(commentElement);
    });
  }

  async handleSubmitComment(e) {
    e.preventDefault();

    const content = this.commentInput.value.trim();
    if (!content) {
      this.showError("Комментарий не может быть пустым");
      return;
    }

    try {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = "Отправка...";

      await commentsService.createComment(
        this.currentUserId,
        this.postId,
        content,
      );

      // Увеличиваем счетчик комментариев
      this.increaseCommentsCount();

      this.commentInput.value = "";
      await this.loadComments();
    } catch (error) {
      console.error(error);
      this.showError("Не удалось отправить комментарий");
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = "Отправить";
    }
  }

  increaseCommentsCount() {
    const commentsButton = document.querySelector(".comments");
    if (commentsButton) {
      const currentText = commentsButton.textContent;
      const match = currentText.match(/\d+/);
      if (match) {
        const currentCount = parseInt(match[0]);
        commentsButton.textContent = `Комментарии ${currentCount + 1}`;
      } else {
        commentsButton.textContent = `Комментарии 1`;
      }
    }
  }

  async handleDeleteComment(commentId) {
    try {
      await commentsService.deleteComment(commentId);

      // Удаляем из DOM
      const commentElement = document.querySelector(
        `[data-comment-id="${commentId}"]`,
      );
      if (commentElement) {
        commentElement.remove();
      }

      // Уменьшаем счетчик комментариев
      this.decreaseCommentsCount();
    } catch (error) {
      console.error(error);
      alert("Не удалось удалить комментарий");
    }
  }

  decreaseCommentsCount() {
    const commentsButton = document.querySelector(".comments");
    if (commentsButton) {
      const currentText = commentsButton.textContent;
      const match = currentText.match(/\d+/);
      if (match) {
        const currentCount = parseInt(match[0]);
        commentsButton.textContent =
          currentCount > 1
            ? `Комментарии ${currentCount - 1}`
            : `Комментарии 0`;
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
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

    this.commentForm?.before(error);

    setTimeout(() => error.remove(), 5000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CommentsPage();
});
