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
