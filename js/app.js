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
document.addEventListener('DOMContentLoaded', () => {
    // Define available pages for search
    const pages = [
        { name: 'Home', path: '/index.html' },
        { name: 'Journal', path: '/journal.html' },
        { name: 'Tasks', path: '/tasks.html' },
        { name: 'Settings', path: '/settings.html' }
    ];

    const searchBar = document.getElementById('search-bar');
    const searchResults = document.getElementById('search-results');
    let debounceTimeout;

    // Sanitize input to prevent XSS
    const sanitizeInput = (input) => {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    };

    // Show search results
    const showResults = (results) => {
        searchResults.innerHTML = '';
        if (results.length === 0) {
            const noResultItem = document.createElement('div');
            noResultItem.classList.add('search-result-item');
            noResultItem.textContent = 'No results found';
            noResultItem.style.cursor = 'default';
            noResultItem.style.opacity = '0.7';
            searchResults.appendChild(noResultItem);
        } else {
            results.forEach(page => {
                const resultItem = document.createElement('div');
                resultItem.classList.add('search-result-item');
                resultItem.textContent = page.name;
                resultItem.setAttribute('role', 'option');
                resultItem.setAttribute('tabindex', '0');
                resultItem.addEventListener('click', () => {
                    navigateTo(page.path);
                    searchResults.classList.add('hidden');
                    searchBar.value = '';
                });
                resultItem.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        navigateTo(page.path);
                        searchResults.classList.add('hidden');
                        searchBar.value = '';
                    }
                });
                searchResults.appendChild(resultItem);
            });
        }
        searchResults.classList.remove('hidden');
    };

    // Hide search results
    const hideResults = () => {
        searchResults.classList.add('hidden');
        searchResults.innerHTML = '';
    };

    // Navigate to a page
    const navigateTo = (path) => {
        try {
            // Handle different path formats
            const basePath = window.location.origin;
            let fullPath = path;

            // If path is relative, resolve it
            if (path.startsWith('/')) {
                fullPath = basePath + path;
            } else if (!path.startsWith('http')) {
                const currentPath = window.location.pathname;
                const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
                fullPath = basePath + currentDir + '/' + path;
            }

            window.location.href = fullPath;
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    // Debounced search function
    const debounceSearch = (query, delay = 300) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const sanitizedQuery = sanitizeInput(query.trim());
            if (sanitizedQuery.length === 0) {
                hideResults();
                return;
            }

            const filteredPages = pages.filter(page =>
                page.name.toLowerCase().includes(sanitizedQuery.toLowerCase())
            );
            showResults(filteredPages);
        }, delay);
    };

    // Event listeners for search bar
    searchBar.addEventListener('input', (e) => {
        debounceSearch(e.target.value);
    });

    searchBar.addEventListener('focus', () => {
        if (searchBar.value.trim().length > 0) {
            debounceSearch(searchBar.value);
        }
    });

    // Hide results on click outside
    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target) && !searchResults.contains(e.target)) {
            hideResults();
        }
    });

    // Hide results on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideResults();
            searchBar.value = '';
            searchBar.blur();
        }
    });

    // Keyboard navigation for search results
    searchResults.addEventListener('keydown', (e) => {
        const items = searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        const currentItem = document.activeElement;
        const currentIndex = Array.from(items).indexOf(currentItem);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + items.length) % items.length;
            items[prevIndex].focus();
        }
    });
});
