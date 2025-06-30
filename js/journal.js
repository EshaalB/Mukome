// ========== Constants and Global Variables ==========
const SELECTORS = {
    monthYear: '.monthYear',
    dayDate: '.dayDate',
    tabs: '.tabs button',
    sections: 'section',
    textarea: '.wrapper textarea',
    clockIcon: '.fa-clock',
    timestampBox: '.timestamp-box',
    indentBtn: '#indent-btn',
    journalTextarea: 'textarea',
    uploadImageBtn: '#uploadImageBtn',
    imageUploadInput: '#imageUploadInput',
    journalSection: '#journal',
    openStickerModalBtn: '#openStickerModalBtn',
    stickerModal: '#stickerModal',
    closeStickerModal: '.close-sticker-modal',
    stickerOptions: '.sticker-option',
    moodSelectors: '.mood-selectors',
    moodTitle: '.moodTitle',
    logEntryBtn: '#logEntryBtn',
    burnBtn: '#burnBtn',
    tearBtn: '#tearBtn',
    rantTextarea: '#rant textarea',
    calendarSection: '#calender',
    calendarMonthYear: '#calendarMonthYear',
    prevMonthBtn: '#prevMonthBtn',
    nextMonthBtn: '#nextMonthBtn',
    calendarGrid: '#calendarGrid',
    analyzeMoodBtn: '#analyzeMoodBtn',
    moodAnalysisResult: '#moodAnalysisResult',
    calendarAnalysisContainer: '#calendarAnalysisContainer'
};

const MOODS = [
    { emoji: "😊", label: "Happy" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😠", label: "Angry" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😃", label: "Excited" },
    { emoji: "😔", label: "Depressed" },
    { emoji: "😍", label: "In Love" },
    { emoji: "🤯", label: "Overwhelmed" }
];

let alignState = "left";
let currentElement = null;
let offset = { x: 0, y: 0 };
let isDragging = false;
let isResizing = false;
let isRotating = false;
let startAngle = 0;
let startMouseAngle = 0;
let currentDate = new Date();

// ========== Helper Functions ==========
function getLocalDateKey(date) {
    const adjustedDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return adjustedDate.toISOString().split('T')[0];
}

// ========== JOURNAL PAGE  Features ==========
function setupJournalPage() {
    setupDateDisplay();
    setupTabSwitching();
    setupTextareaAutoGrow();
    setupTimestamp();
    setupTextAlignment();
    initMoodSelector();
    setupImageUpload();
    setupStickerModal();
    document.getElementById(SELECTORS.logEntryBtn.slice(1)).addEventListener("click", saveJournalEntry);
    loadSavedJournalEntry();

    // Global event listeners
    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.classList.contains("draggable-image")) {
            toggleFixedState(e.target);
        }
    });
}

function setupDateDisplay() {
    const monthYearElement = document.querySelector(SELECTORS.monthYear);
    const dayDateElement = document.querySelector(SELECTORS.dayDate);

    monthYearElement.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    dayDateElement.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
}

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
                if (targetId === 'calender') {
                    setupCalendar();
                }
            }
        });
    });

    // Activate default tab
    document.querySelector('.tabs button.active')?.click();
}

function setupTextareaAutoGrow() {
    const textarea = document.querySelector(SELECTORS.textarea);
    textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    });
}

function setupTimestamp() {
    document.querySelector(SELECTORS.clockIcon).addEventListener('click', () => {
        const timestampBox = document.querySelector(SELECTORS.timestampBox);
        const now = new Date();
        const hours = now.getHours() % 12 || 12;
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        timestampBox.textContent = `${hours}:${minutes} ${ampm}`;
    });
}

function setupTextAlignment() {
    const indentBtn = document.getElementById(SELECTORS.indentBtn.slice(1));
    const indentIcon = indentBtn.querySelector("i");
    const journalTextarea = document.querySelector(SELECTORS.journalTextarea);

    indentBtn.addEventListener("click", () => {
        const text = journalTextarea.value;
        const lines = text.split("\n");

        if (alignState === "left") {
            journalTextarea.style.textAlign = "center";
            indentIcon.className = "fas fa-align-center";
            alignState = "center";
            journalTextarea.value = lines.map(line => line.padStart(line.length + 20, " ")).join("\n");
        } else if (alignState === "center") {
            journalTextarea.style.textAlign = "right";
            indentIcon.className = "fas fa-align-right";
            alignState = "right";
            journalTextarea.value = lines.map(line => line.padStart(line.length + 40, " ")).join("\n");
        } else {
            journalTextarea.style.textAlign = "left";
            indentIcon.className = "fas fa-align-left";
            alignState = "left";
            journalTextarea.value = lines.map(line => line.trimStart()).join("\n");
        }
    });
}

function initMoodSelector() {
    const moodContainer = document.querySelector(SELECTORS.moodSelectors);
    moodContainer.innerHTML = '';

    MOODS.forEach(mood => {
        const button = document.createElement('button');
        button.innerHTML = mood.emoji;
        button.title = mood.label;
        button.addEventListener('click', () => {
            moodContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.querySelector(SELECTORS.moodTitle).textContent = mood.label;
        });
        moodContainer.appendChild(button);
    });
}

function setupImageUpload() {
    const uploadImageBtn = document.getElementById(SELECTORS.uploadImageBtn.slice(1));
    const imageUploadInput = document.getElementById(SELECTORS.imageUploadInput.slice(1));

    uploadImageBtn.addEventListener("click", () => imageUploadInput.click());
    imageUploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => createImageElement(event.target.result);
        reader.readAsDataURL(file);
    });
}

function setupStickerModal() {
    const openStickerModalBtn = document.getElementById(SELECTORS.openStickerModalBtn.slice(1));
    const stickerModal = document.getElementById(SELECTORS.stickerModal.slice(1));
    const closeStickerModal = document.querySelector(SELECTORS.closeStickerModal);
    const stickerOptions = document.querySelectorAll(SELECTORS.stickerOptions);

    openStickerModalBtn.addEventListener("click", () => stickerModal.classList.remove("hidden"));
    closeStickerModal.addEventListener("click", () => stickerModal.classList.add("hidden"));
    stickerOptions.forEach(sticker => {
        sticker.addEventListener("click", () => {
            createImageElement(sticker.src, true);
            stickerModal.classList.add("hidden");
        });
    });
}

function createImageElement(src, isSticker = false) {
    const container = document.createElement("div");
    container.className = "draggable-image";
    container.style.top = "100px";
    container.style.left = "100px";
    container.dataset.isSticker = isSticker;
    container.dataset.locked = "false";

    const img = document.createElement("img");
    img.src = src;
    img.alt = isSticker ? "Sticker" : "Uploaded Image";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "control-icon delete-icon";
    deleteBtn.innerHTML = "<i class='fas fa-times'></i>";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        container.remove();
    });

    const rotateHandle = document.createElement("span");
    rotateHandle.className = "control-icon rotate-icon";
    rotateHandle.innerHTML = "<i class='fas fa-sync-alt'></i>";
    rotateHandle.title = "Rotate";
    rotateHandle.addEventListener("mousedown", startRotate);

    const resizeHandle = document.createElement("span");
    resizeHandle.className = "control-icon resize-icon";
    resizeHandle.title = "Resize";
    resizeHandle.addEventListener("mousedown", startResize);

    const lockBtn = document.createElement("span");
    lockBtn.className = "control-icon lock-icon";
    lockBtn.innerHTML = "<i class='fas fa-lock-open'></i>";
    lockBtn.title = "Lock/Unlock";
    lockBtn.addEventListener("click", () => toggleFixedState(container, lockBtn));

    img.addEventListener("click", () => {
        if (container.dataset.locked === "true") {
            container.querySelectorAll(".control-icon").forEach(icon => icon.style.display = "block");
        }
    });

    container.append(img, deleteBtn, rotateHandle, resizeHandle, lockBtn);
    document.getElementById(SELECTORS.journalSection.slice(1)).appendChild(container);
    positionElementCenter(container);
    makeElementDraggable(container);
    container.focus();
}

function positionElementCenter(element) {
    const journalRect = document.getElementById(SELECTORS.journalSection.slice(1)).getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    element.style.left = `${(journalRect.width - elementRect.width) / 2}px`;
    element.style.top = `${(journalRect.height - elementRect.height) / 3}px`;
}

function toggleFixedState(container, lockBtn) {
    const isLocked = container.classList.toggle("fixed");
    const controlIcons = container.querySelectorAll(".control-icon");

    if (isLocked) {
        controlIcons.forEach(icon => icon.style.display = "none");
        container.dataset.locked = "true";
        const img = container.querySelector("img");
        img.style.pointerEvents = "auto";
        img.addEventListener("click", showControlsOnce);
    } else {
        controlIcons.forEach(icon => icon.style.display = "block");
        container.dataset.locked = "false";
        lockBtn.innerHTML = "<i class='fas fa-lock-open'></i>";
        lockBtn.title = "Lock";
        const img = container.querySelector("img");
        img.removeEventListener("click", showControlsOnce);
    }
}

function showControlsOnce(e) {
    const container = e.target.closest(".draggable-image");
    if (!container || container.dataset.locked !== "true") return;

    const controlIcons = container.querySelectorAll(".control-icon");
    controlIcons.forEach(icon => icon.style.display = "block");

    setTimeout(() => {
        document.addEventListener("click", function hideAgain(ev) {
            if (!container.contains(ev.target)) {
                controlIcons.forEach(icon => icon.style.display = "none");
                document.removeEventListener("click", hideAgain);
            }
        });
    }, 100);
}

function makeElementDraggable(element) {
    element.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("control-icon") || element.classList.contains("fixed")) return;
        isDragging = true;
        currentElement = element;
        offset = {
            x: e.clientX - element.getBoundingClientRect().left,
            y: e.clientY - element.getBoundingClientRect().top
        };
        element.style.zIndex = "100";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging || !currentElement || currentElement.classList.contains("fixed")) return;
        const bounds = document.getElementById(SELECTORS.journalSection.slice(1)).getBoundingClientRect();
        const maxX = bounds.width - currentElement.offsetWidth;
        const maxY = bounds.height - currentElement.offsetHeight;
        currentElement.style.left = `${Math.min(maxX, Math.max(0, e.clientX - bounds.left - offset.x))}px`;
        currentElement.style.top = `${Math.min(maxY, Math.max(0, e.clientY - bounds.top - offset.y))}px`;
    });

    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            currentElement.style.zIndex = "1";
            currentElement = null;
        }
    });
}

function startRotate(e) {
    e.preventDefault();
    e.stopPropagation();
    if (currentElement?.classList.contains("fixed")) return;

    isRotating = true;
    currentElement = e.target.closest(".draggable-image");
    const rect = currentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    startAngle = currentElement.style.transform ? parseInt(currentElement.style.transform.match(/-?\d+/)[0]) || 0 : 0;
    startMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    document.addEventListener("mousemove", rotateElement);
    document.addEventListener("mouseup", stopRotate);
}

function rotateElement(e) {
    if (!isRotating || !currentElement || currentElement.classList.contains("fixed")) return;
    const rect = currentElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const angleDiff = mouseAngle - startMouseAngle;
    currentElement.style.transform = `rotate(${startAngle + angleDiff * (180 / Math.PI)}deg)`;
}

function stopRotate() {
    isRotating = false;
    document.removeEventListener("mousemove", rotateElement);
    document.removeEventListener("mouseup", stopRotate);
}

function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    if (currentElement?.classList.contains("fixed")) return;

    isResizing = true;
    currentElement = e.target.closest(".draggable-image");
    const rect = currentElement.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    const isSticker = currentElement.dataset.isSticker === "true";
    const aspectRatio = isSticker ? startWidth / startHeight : 0;

    document.addEventListener("mousemove", (e) => resizeElement(e, aspectRatio));
    document.addEventListener("mouseup", stopResize);
}

function resizeElement(e, aspectRatio) {
    if (!isResizing || !currentElement || currentElement.classList.contains("fixed")) return;
    const minSize = 50;
    const journalRect = document.getElementById(SELECTORS.journalSection.slice(1)).getBoundingClientRect();
    const newWidth = Math.max(minSize, e.clientX - currentElement.getBoundingClientRect().left);
    const newHeight = aspectRatio ? newWidth / aspectRatio : Math.max(minSize, e.clientY - currentElement.getBoundingClientRect().top);
    const maxWidth = journalRect.width - currentElement.offsetLeft;
    const maxHeight = journalRect.height - currentElement.offsetTop;

    currentElement.style.width = `${Math.min(maxWidth, newWidth)}px`;
    if (!aspectRatio) {
        currentElement.style.height = `${Math.min(maxHeight, newHeight)}px`;
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener("mousemove", resizeElement);
    document.removeEventListener("mouseup", stopResize);
}

function saveJournalEntry() {
    const journalTextarea = document.querySelector('#journal textarea');
    const dateKey = getLocalDateKey(currentDate);

    const entryData = {
        text: journalTextarea?.value.trim(),
        dayDate: currentDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' }),
        monthYear: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        timestamp: document.querySelector(SELECTORS.timestampBox)?.textContent,
        mood: document.querySelector(SELECTORS.moodTitle)?.textContent,
        images: Array.from(document.querySelectorAll('.draggable-image')).map(item => {
            const img = item.querySelector("img");
            return img ? {
                src: img.src,
                left: item.style.left,
                top: item.style.top,
                width: item.style.width || "",
                height: item.style.height || "",
                transform: item.style.transform || "",
                isSticker: item.dataset.isSticker === "true"
            } : null;
        }).filter(Boolean)
    };

    if (!entryData.text) {
        Swal.fire({
            icon: 'warning',
            title: 'Empty Entry!',
            text: 'Please write something before saving.',
            confirmButtonColor: 'var(--primary-color)'
        });
        return;
    }

    localStorage.setItem("mukomeJournalEntry", JSON.stringify(entryData));
    localStorage.setItem(`mukomeJournal_${dateKey}`, JSON.stringify(entryData));

    Swal.fire({
        icon: 'success',
        title: 'Entry Saved!',
        text: 'Your journal log has been saved successfully.',
        confirmButtonColor: 'var(--primary-color)',
        background: '#fff8ec'
    });

    setupDateDisplay();
    document.querySelector(`[data-target="calender"]`).click();
}

function createRestoredImageElement(imgData) {
    const container = document.createElement("div");
    container.className = "draggable-image";
    container.style.left = imgData.left;
    container.style.top = imgData.top;
    container.style.width = imgData.width;
    container.style.height = imgData.height;
    container.style.transform = imgData.transform;
    container.dataset.isSticker = imgData.isSticker;
    container.dataset.locked = "false";

    const img = document.createElement("img");
    img.src = imgData.src;
    img.alt = imgData.isSticker ? "Sticker" : "Uploaded Image";
    img.style.maxWidth = "100%";
    img.style.maxHeight = "100%";

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "control-icon delete-icon";
    deleteBtn.innerHTML = "<i class='fas fa-times'></i>";
    deleteBtn.title = "Delete";
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        container.remove();
    });

    const rotateHandle = document.createElement("span");
    rotateHandle.className = "control-icon rotate-icon";
    rotateHandle.innerHTML = "<i class='fas fa-sync-alt'></i>";
    rotateHandle.title = "Rotate";
    rotateHandle.addEventListener("mousedown", startRotate);

    const resizeHandle = document.createElement("span");
    resizeHandle.className = "control-icon resize-icon";
    resizeHandle.title = "Resize";
    resizeHandle.addEventListener("mousedown", startResize);

    const lockBtn = document.createElement("span");
    lockBtn.className = "control-icon lock-icon";
    lockBtn.innerHTML = "<i class='fas fa-lock-open'></i>";
    lockBtn.title = "Lock/Unlock";
    lockBtn.addEventListener("click", () => toggleFixedState(container, lockBtn));

    img.addEventListener("click", () => {
        if (container.dataset.locked === "true") {
            container.querySelectorAll(".control-icon").forEach(icon => icon.style.display = "block");
        }
    });

    container.append(img, deleteBtn, rotateHandle, resizeHandle, lockBtn);
    document.getElementById(SELECTORS.journalSection.slice(1)).appendChild(container);
    makeElementDraggable(container);
}

function loadSavedJournalEntry() {
    const saved = localStorage.getItem("mukomeJournalEntry");
    if (!saved) return;

    const data = JSON.parse(saved);
    const journalTextarea = document.querySelector('#journal textarea');
    if (journalTextarea && data.text) journalTextarea.value = data.text;
    if (data.dayDate) document.querySelector(SELECTORS.dayDate).textContent = data.dayDate;
    if (data.monthYear) document.querySelector(SELECTORS.monthYear).textContent = data.monthYear;
    if (data.timestamp) document.querySelector(SELECTORS.timestampBox).textContent = data.timestamp;

    if (data.mood) {
        document.querySelector(SELECTORS.moodTitle).textContent = data.mood;
        document.querySelectorAll(`${SELECTORS.moodSelectors} button`).forEach(btn => {
            btn.classList.toggle('active', btn.title === data.mood);
        });
    }

    document.querySelectorAll('.draggable-image').forEach(img => img.remove());
    if (Array.isArray(data.images)) {
        data.images.forEach(createRestoredImageElement);
    }
}

function loadJournalEntryByDate(dateKey) {
    const saved = localStorage.getItem(`mukomeJournal_${dateKey}`);
    if (!saved) return;

    const data = JSON.parse(saved);
    const [year, month, day] = dateKey.split('-').map(Number);
    currentDate = new Date(year, month - 1, day);
    setupDateDisplay();

    const journalTextarea = document.querySelector('#journal textarea');
    if (journalTextarea && data.text) journalTextarea.value = data.text;
    if (data.dayDate) document.querySelector(SELECTORS.dayDate).textContent = data.dayDate;
    if (data.monthYear) document.querySelector(SELECTORS.monthYear).textContent = data.monthYear;
    if (data.timestamp) document.querySelector(SELECTORS.timestampBox).textContent = data.timestamp;

    if (data.mood) {
        document.querySelector(SELECTORS.moodTitle).textContent = data.mood;
        document.querySelectorAll(`${SELECTORS.moodSelectors} button`).forEach(btn => {
            btn.classList.toggle('active', btn.title === data.mood);
        });
    }

    document.querySelectorAll('.draggable-image').forEach(img => img.remove());
    if (Array.isArray(data.images)) {
        data.images.forEach(createRestoredImageElement);
    }

    document.querySelector(`[data-target="journal"]`).click();
}

// ========== CALENDER PAGE FEATURES  ==========
function setupCalendar() {
    const prevMonthBtn = document.querySelector(SELECTORS.prevMonthBtn);
    const nextMonthBtn = document.querySelector(SELECTORS.nextMonthBtn);
    const calendarMonthYear = document.querySelector(SELECTORS.calendarMonthYear);
    const calendarGrid = document.querySelector(SELECTORS.calendarGrid);

    function renderCalendar() {
        calendarMonthYear.textContent = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        calendarGrid.innerHTML = '';

        // Create weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of the month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        // Add empty cells for days before the first day
        for (let i = 0; i < firstDay.getDay(); i++) {
            calendarGrid.appendChild(document.createElement('div'));
        }

        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = getLocalDateKey(date);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;

            // Check for saved entry
            const savedEntry = localStorage.getItem(`mukomeJournal_${dateKey}`);
            if (savedEntry) {
                const entry = JSON.parse(savedEntry);
                const mood = MOODS.find(m => m.label === entry.mood);
                if (mood) {
                    dayElement.innerHTML = `${day}<span class="mood-emoji">${mood.emoji}</span>`;
                    dayElement.classList.add('has-entry');
                    dayElement.addEventListener('click', () => loadJournalEntryByDate(dateKey));
                }
            }

            calendarGrid.appendChild(dayElement);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        setupDateDisplay();
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        setupDateDisplay();
        renderCalendar();
    });

    renderCalendar();
}

function setupMoodAnalysis() {
    const analyzeMoodBtn = document.querySelector(SELECTORS.analyzeMoodBtn);
    const moodAnalysisResult = document.querySelector(SELECTORS.moodAnalysisResult);

    analyzeMoodBtn.addEventListener('click', () => {
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const moodCounts = {};
        const dayOfWeekMoods = {
            'Sunday': {}, 'Monday': {}, 'Tuesday': {}, 'Wednesday': {},
            'Thursday': {}, 'Friday': {}, 'Saturday': {}
        };

        // Initialize mood counts
        MOODS.forEach(mood => {
            moodCounts[mood.label] = 0;
            Object.keys(dayOfWeekMoods).forEach(day => {
                dayOfWeekMoods[day][mood.label] = 0;
            });
        });

        // Count moods for each day in the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const dateKey = getLocalDateKey(date);
            const savedEntry = localStorage.getItem(`mukomeJournal_${dateKey}`);
            if (savedEntry) {
                const entry = JSON.parse(savedEntry);
                if (entry.mood && moodCounts.hasOwnProperty(entry.mood)) {
                    moodCounts[entry.mood]++;
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                    dayOfWeekMoods[dayName][entry.mood]++;
                }
            }
        }

        // Sort moods by frequency
        const sortedMoods = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, count]) => count > 0);

        // Find most common mood
        const mostCommonMood = sortedMoods.length > 0 ? sortedMoods[0] : null;
        const mostCommonMoodEmoji = mostCommonMood
            ? MOODS.find(m => m.label === mostCommonMood[0])?.emoji
            : '🤔';

        // Calculate day-of-week patterns
        const dayPatterns = Object.entries(dayOfWeekMoods).map(([day, moods]) => {
            const total = Object.values(moods).reduce((sum, count) => sum + count, 0);
            if (total === 0) return null;
            const dominantMood = Object.entries(moods)
                .sort((a, b) => b[1] - a[1])[0];
            return {
                day,
                mood: dominantMood[0],
                count: dominantMood[1],
                percentage: total > 0 ? ((dominantMood[1] / total) * 100).toFixed(1) : 0,
                emoji: MOODS.find(m => m.label === dominantMood[0])?.emoji
            };
        }).filter(Boolean);

        // Generate analysis HTML
        let analysisHtml = '<h3>Monthly Mood Analysis</h3>';
        analysisHtml += '<h4>Mood Frequency</h4><ul>';

        if (sortedMoods.length === 0) {
            analysisHtml += '<li>No entries found for this month.</li>';
        } else {
            sortedMoods.forEach(([mood, count]) => {
                const emoji = MOODS.find(m => m.label === mood)?.emoji;
                analysisHtml += `<li>${emoji} ${mood}: ${count} day${count === 1 ? '' : 's'}</li>`;
            });
        }
        analysisHtml += '</ul>';

        analysisHtml += '<h4>Day Patterns</h4><ul>';
        if (dayPatterns.length === 0) {
            analysisHtml += '<li>No mood patterns detected.</li>';
        } else {
            dayPatterns.forEach(pattern => {
                if (pattern.count > 0) {
                    analysisHtml += `<li>${pattern.day} is most likely to be ${pattern.mood} ${pattern.emoji} (${pattern.percentage}%)</li>`;
                }
            });
        }
        analysisHtml += '</ul>';

        analysisHtml += '<h4>Verdict</h4>';
        analysisHtml += mostCommonMood
            ? `<p>Your most common mood this month was ${mostCommonMood[0]} ${mostCommonMoodEmoji}, appearing ${mostCommonMood[1]} time${mostCommonMood[1] === 1 ? '' : 's'}.</p>`
            : '<p>No dominant mood detected this month.</p>';

        moodAnalysisResult.innerHTML = analysisHtml;
        moodAnalysisResult.classList.remove('hidden');
    });
}

// ========== RANT PAGE Features ==========
function setupRantPage() {
    const burnBtn = document.getElementById(SELECTORS.burnBtn.slice(1));
    const tearBtn = document.getElementById(SELECTORS.tearBtn.slice(1));
    const rantTextarea = document.querySelector(SELECTORS.rantTextarea);

    burnBtn.addEventListener("click", () => {
        const flame = document.createElement("img");
        flame.src = "../assets/img/flames.gif";
        flame.className = "burn-effect";
        flame.style.position = "absolute";
        flame.style.top = `${rantTextarea.offsetTop}px`;
        flame.style.left = `${rantTextarea.offsetLeft}px`;
        flame.style.width = `${rantTextarea.offsetWidth}px`;
        flame.style.height = `${rantTextarea.offsetHeight}px`;
        flame.style.zIndex = 10;
        flame.style.pointerEvents = "overlay";
        rantTextarea.parentNode.appendChild(flame);

        gsap.fromTo(flame, { scale: 1, opacity: 1, rotation: -5 }, {
            scale: 1.3,
            rotation: 5,
            duration: 1,
            repeat: 2,
            yoyo: true,
            ease: "sine.inOut"
        });

        gsap.to(rantTextarea, {
            duration: 1.2,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: () => {
                rantTextarea.value = "";
                gsap.set(rantTextarea, { clearProps: "all", opacity: 1 });
                flame.remove();
            }
        });
    });

    tearBtn.addEventListener("click", () => {
        gsap.to(rantTextarea, {
            duration: 0.3,
            x: -10,
            repeat: 3,
            yoyo: true,
            ease: "power1.inOut",
            onComplete: () => {
                gsap.to(rantTextarea, {
                    duration: 1,
                    scaleY: 0,
                    opacity: 0,
                    ease: "expo.in",
                    onComplete: () => {
                        rantTextarea.value = "";
                        gsap.set(rantTextarea, { clearProps: "all" });
                    }
                });
            }
        });
    });
}

// ========== Initialization ==========
function initJournal() {
    setupJournalPage();
    setupMoodAnalysis();
    setupRantPage();
}

window.addEventListener("load", initJournal);