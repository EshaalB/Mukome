function setupTabSwitching() {
    const tabs = document.querySelectorAll(SELECTORS.tabs);
    const sections = document.querySelectorAll(SELECTORS.sections);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.getAttribute('data-target');
            sections.forEach(section => section.style.display = 'none');

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}
setupTabSwitching();