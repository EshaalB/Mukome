document.addEventListener("DOMContentLoaded", () => {
    // Apply saved theme and color
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedColor = localStorage.getItem("color") || "default";

    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.setAttribute("data-color", savedColor);

    const checkbox = document.getElementById("checkbox");
    if (checkbox) {
        checkbox.checked = savedTheme === "dark";
        checkbox.addEventListener("change", () => {
            const newTheme = checkbox.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    const colorSelect = document.getElementById("color-select");
    if (colorSelect) {
        colorSelect.value = savedColor;
        colorSelect.addEventListener("change", (e) => {
            const color = e.target.value;
            document.documentElement.setAttribute("data-color", color);
            localStorage.setItem("color", color);
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    // Theme toggle
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedColor = localStorage.getItem("color") || "default";
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.setAttribute("data-color", savedColor);

    const checkbox = document.getElementById("checkbox");
    if (checkbox) {
        checkbox.checked = savedTheme === "dark";
        checkbox.addEventListener("change", () => {
            const newTheme = checkbox.checked ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }

    const colorSelect = document.getElementById("color-select");
    if (colorSelect) {
        colorSelect.value = savedColor;
        colorSelect.addEventListener("change", (e) => {
            const color = e.target.value;
            document.documentElement.setAttribute("data-color", color);
            localStorage.setItem("color", color);
        });
    }

    // Hamburger toggle
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.querySelector(".sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });

        // Optional: close sidebar on link click (for mobile)
        sidebar.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                sidebar.classList.remove("active");
            });
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("search-bar");
    const resultsContainer = document.getElementById("search-results");

    const pages = [
        { name: "Home", url: "index.html" },
        { name: "Journal", url: "pages/journal.html" },
        { name: "Sleep", url: "pages/sleep.html" },
        { name: "To Do", url: "pages/todolist.html" },
        { name: "Settings", url: "pages/setting.html" }
    ];

    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase().trim();
        resultsContainer.innerHTML = "";

        if (query.length === 0) return;

        const matches = pages.filter(p => p.name.toLowerCase().includes(query));

        matches.forEach(match => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.textContent = match.name;
            div.addEventListener("click", () => {
                window.location.href = match.url;
            });
            resultsContainer.appendChild(div);
        });
    });

    // Handle enter key
    searchBar.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const query = searchBar.value.toLowerCase().trim();
            const match = pages.find(p => p.name.toLowerCase().includes(query));
            if (match) {
                window.location.href = match.url;
            } else {
                resultsContainer.innerHTML = "<div class='search-result-item'>No match found</div>";
            }
        }
    });

    // Hide results when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchBar.contains(e.target) && !resultsContainer.contains(e.target)) {
            resultsContainer.innerHTML = "";
        }
    });
});
