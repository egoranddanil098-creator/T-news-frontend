import { postsService } from "../services/posts.service.js";
import { userService } from "../services/user.service.js";
import { feedService } from "../services/feed.service.js";

const PUBLIC_ASSET_BASE_URL =
  "https://t-news-backend-production.up.railway.app/public/";

class PostComponent {
  constructor(options = {}) {
    this.currentUserId = userService.getUserId();
    this.canDelete = options.canDelete || false;
    this.container = options.container || document.querySelector(".content");
    if (this.container) {
      this.setupEventDelegation();
    }
  }

  setupEventDelegation() {
    this.container.addEventListener("click", (e) => {
      const likeButton = e.target.closest(".likes");
      if (likeButton) {
        e.preventDefault();
        const postElement = likeButton.closest(".card");
        const postId = postElement?.dataset?.postId;
        if (postId) {
          this.handleLike(postId, likeButton);
        }
        return;
      }

      const deleteButton = e.target.closest(".delete-post");
      if (deleteButton) {
        e.preventDefault();
        const postId = deleteButton.dataset.postId;
        if (postId) {
          this.handleDeletePost(postId, deleteButton);
        }
        return;
      }
    });
  }

  createPostElement(post, options = {}) {
    const postElement = document.createElement("article");
    postElement.className = "card";
    postElement.dataset.postId = post.id;

    const canDeleteThisPost = this.canDelete;
    const avatarSrc =
      post.avatar && post.avatar.startsWith("http")
        ? post.avatar
        : `${PUBLIC_ASSET_BASE_URL}${post.avatar || "default.png"}`;

    postElement.innerHTML = `
      <div class="author">
        <a  href="profile.html?userId=${post.userId}"></q><img class="logo-author" src="${avatarSrc}" alt="avatar ${post.username}"></a>
        <p class="authon-name">${post.username}</p>
      </div>
      <div class="post-content">
        <p class="text">${post.content}</p>
        ${
          canDeleteThisPost
            ? `<button class="delete-post" data-post-id="${post.id}">
                  <img src="../img/delete.svg" alt="Удалить">
               </button>`
            : ""
        }
      </div>
      <div class="actions">
        <button class="likes" data-post-id="${post.id}">
          <img src="../img/heart.svg" alt="heart icon">
          <p class="count_likes">${post.likes || 0}</p>
        </button>

        <a href="comments.html?postId=${post.id}" class="comments">
          Комментарии ${post.comments || 0}
        </a>
      </div>
    `;

    return postElement;
  }

  showMessage() {
    const postElement = this.container;
    postElement.innerHTML = `
      <div class="no-results">
        <p>Здесь будут отображаться посты пользователей, на которых вы подписаны</p>
      </div>
    `;
    return postElement;
  }

  addPost(post, options = {}) {
    const postElement = this.createPostElement(post, options);

    const position = options.position || "append";
    if (position === "prepend" && this.container.firstChild) {
      this.container.insertBefore(postElement, this.container.firstChild);
    } else {
      this.container.appendChild(postElement);
    }

    return postElement;
  }

  addPosts(posts, options = {}) {
    posts.map((post) => this.addPost(post, options));
    return posts;
  }

  async handleLike(postId, buttonElement) {
    try {
      const userId = this.currentUserId;
      if (!userId) {
        alert("Войдите в систему, чтобы ставить лайки");
        return;
      }

      const countElement = buttonElement.querySelector(".count_likes");
      const likesCount = Number(countElement.textContent);
      let result = await postsService.likePost(userId, postId);
      if (result.description === "Post already liked") {
        result = await postsService.unlikePost(userId, postId);
        countElement.textContent = Math.max(likesCount - 1, 0);
      } else {
        countElement.textContent = likesCount + 1;
      }
    } catch (error) {
      console.error("Error handling like:", error);
      alert("Не удалось поставить лайк");
    }
  }

  async handleDeletePost(postId, buttonElement) {
    try {
      await postsService.deletePost(postId);
      const postElement = buttonElement.closest(".card");
      if (postElement) {
        postElement.remove();
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Не удалось удалить пост");
    }
  }

  async createPost(userId, content, options = {}) {
    try {
      if (!content.trim()) {
        throw new Error("Пост не может быть пустым");
      }

      const createdPost = await postsService.createPost(userId, content);

      if (options.addToContainer !== false) {
        this.addPost(createdPost, {
          position: "prepend",
          canDelete: true,
        });
      }

      return createdPost;
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  async getUserPosts(userId) {
    try {
      const posts = await postsService.getUserPosts(userId);
      return posts;
    } catch (error) {
      console.error("Error getting user posts:", error);
      throw error;
    }
  }

  async renderUserPosts(userId, options = {}) {
    try {
      const posts = await this.getUserPosts(userId);

      if (options.clearContainer) {
        this.container.innerHTML = "";
      }

      return this.addPosts(posts, {
        canDelete: options.canDelete,
      });
    } catch (error) {
      console.error("Error rendering user posts:", error);
      throw error;
    }
  }

  async getFeed(userId) {
    try {
      const posts = await feedService.getFeed(userId);
      return posts;
    } catch (error) {
      console.error("Error getting user posts:", error);
      throw error;
    }
  }

  async renderFeed(userId, options = {}) {
    try {
      const posts = await this.getFeed(userId);

      if (options.clearContainer) {
        this.container.innerHTML = "";
      }

      if (posts.length > 0) {
        return this.addPosts(posts, {
          canDelete: options.canDelete,
        });
      } else {
        return this.showMessage();
      }
    } catch (error) {
      console.error("Error rendering user posts:", error);
      throw error;
    }
  }

  async getAllPosts() {
    try {
      const posts = await postsService.getAllPosts();
      return posts;
    } catch (error) {
      console.error("Error getting user posts:", error);
      throw error;
    }
  }

  async renderAllPosts(options = {}) {
    try {
      const posts = await this.getAllPosts();
      if (options.clearContainer) {
        this.container.innerHTML = "";
      }

      return this.addPosts(posts, {
        canDelete: options.canDelete,
      });
    } catch (error) {
      console.error("Error rendering user posts:", error);
      throw error;
    }
  }
}

export default PostComponent;
