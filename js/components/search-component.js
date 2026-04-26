import { searchService } from "../services/search.service.js";
import PostComponent from "./post-component.js";

class SearchComponent {
  constructor() {
    this.searchInput = document.querySelector(".search-input");
    this.searchQuery = null;
    this.currentTab = "users";
    this.postComponent = null;
    this.init();
  }

  init() {
    if (!this.searchInput) return;

    this.getQueryFromURL();

    if (this.searchQuery) {
      this.searchInput.value = this.searchQuery;
    }

    this.addEventListeners();

    this.divResultSearch = document.querySelector(".result-search");
    this.divResultSearchPosts = document.querySelector(".searched-posts");
    this.divResultSearchUsers = document.querySelector(".searched-users");

    if (this.divResultSearchPosts) {
      this.postComponent = new PostComponent({
        container: this.divResultSearchPosts,
        canDelete: false,
      });
    }

    if (this.isSearchPage() && this.searchQuery) {
      this.performSearch();
    }
  }

  isSearchPage() {
    return window.location.pathname.includes("search.html");
  }

  getQueryFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.searchQuery = urlParams.get("q");
  }

  addEventListeners() {
    if (!this.searchInput) return;

    this.searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleSearch();
      }
    });

    if (this.isSearchPage()) {
      this.setupSearchPage();
    }
  }

  setupSearchPage() {
    const searchButtons = document.querySelectorAll(".search-btn");

    if (searchButtons.length === 0) return;

    searchButtons.forEach((btn) => {
      if (btn.textContent.includes("Пользователи")) {
        this.currentTab = "users";
        btn.classList.add("active");
      }

      btn.addEventListener("click", () => {
        searchButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        this.currentTab = btn.textContent.includes("Пользователи")
          ? "users"
          : "posts";

        if (this.searchQuery) {
          this.loadResults(this.currentTab);
        }
      });
    });
  }

  handleSearch() {
    const query = this.searchInput.value.trim();

    if (!query) {
      if (this.isSearchPage()) {
        this.clearResults();
      }
      return;
    }

    this.searchQuery = query;

    if (!this.isSearchPage()) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    } else {
      window.history.pushState(
        {},
        "",
        `search.html?q=${encodeURIComponent(query)}`,
      );
      this.performSearch();
    }
  }

  async performSearch() {
    if (!this.searchQuery) return;
    try {
      await this.loadResults(this.currentTab);
    } catch (error) {
      console.error("Search failed:", error);
      this.showError("Не удалось выполнить поиск");
    }
  }

  async loadResults(type) {
    if (!this.searchQuery) return;

    try {
      let results;
      if (type === "users") {
        results = await searchService.searchUsers(this.searchQuery);
        this.displayUsers(results);
        this.divResultSearchUsers.style = "display: flex";
      } else {
        results = await searchService.searchPosts(this.searchQuery);
        this.displayPosts(results);
        this.divResultSearchUsers.style = "display: none";
      }
    } catch (error) {
      console.error(`Failed to load ${type}:`, error);
      this.showError(
        `Не удалось загрузить ${type === "users" ? "пользователей" : "посты"}`,
      );
    }
  }

  displayUsers(users) {
    this.divResultSearchPosts.innerHTML = "";
    const usersContainer = document.querySelector(".searched-users");
    if (!usersContainer) return;

    usersContainer.innerHTML = "";

    if (!users || users.length === 0) {
      usersContainer.innerHTML = `
        <div class="no-results">
          <p>Пользователи по запросу "${this.searchQuery}" не найдены</p>
        </div>
      `;
      return;
    }

    usersContainer.innerHTML = users
      .map(
        (user) => `
        <div class="searched-user author">
          <a class="logo-author" href="profile.html?userId=${user.id}">
              <img class="img-author"
              src="http://localhost:3000/public/${user.avatar || "default.png"}" 
              alt="avatar ${user.username}">
          </a>
          <p class="authon-name">${user.username}</p>
        </div>
    `,
      )
      .join("");
  }

  async displayPosts(posts) {
    this.divResultSearchUsers.innerHTML = "";
    const postsContainer = document.querySelector(".searched-posts");
    if (!postsContainer || !this.postComponent) return;

    postsContainer.innerHTML = "";

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="no-results">
          <p>Посты по запросу "${this.searchQuery}" не найдены</p>
        </div>
      `;
      return;
    }

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content,
      username: post.user?.username,
      avatar: post.user?.avatar,
      likes: post.likes || 0,
      comments: post.comments || 0,
    }));

    console.log(formattedPosts);
    this.postComponent.addPosts(formattedPosts);
  }

  clearResults() {
    const resultsContainer = document.querySelector(".results-container");
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
    }
  }

  showError(message) {
    const content = document.querySelector(".content");
    if (!content) return;

    const errorDiv = document.createElement("div");
    errorDiv.className = "search-error";
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      background: #ffe6e6;
      color: #d32f2f;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    `;

    const resultsContainer = document.querySelector(".results-container");
    if (resultsContainer) {
      resultsContainer.innerHTML = "";
      resultsContainer.appendChild(errorDiv);
    } else {
      const searchButtons = document.querySelector(".search-buttons");
      if (searchButtons) {
        searchButtons.insertAdjacentElement("afterend", errorDiv);
      }
    }
  }
}

export default SearchComponent;
