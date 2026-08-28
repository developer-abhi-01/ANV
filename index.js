
const feed = document.getElementById("feed");
const loadMore = document.getElementById("loadMore");
const searchInput = document.getElementById("searchInput");
const profile = document.getElementById("profile");
const themeBTN = document.getElementById("theme");
const themeLnk= document.querySelector(".lnk")


function applyTheme(theme) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = isDark ? "dark" : "light";
    themeBTN.textContent = isDark ? "Light" : "Dark";
    themeBTN.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
}

applyTheme(localStorage.getItem("anvTheme") || "light");

themeBTN.addEventListener("click", () => {

    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("anvTheme", nextTheme);
    applyTheme(nextTheme);
});

const categories = [
    "All", "Design", "Travel", "Nature",
    "Architecture", "Fashion", "Photography"
];

const titles = [
    "Creative Workspace", "Minimal Architecture", "Mountain Escape",
    "Modern Interior", "Street Photography", "Ocean Dreams",
    "Urban Aesthetic", "Creative Ideas", "Golden Hour", "Future Design",
    "Cozy Corner", "Natural Beauty", "Travel Inspiration",
    "Minimal Lifestyle", "Beautiful Places", "Creative Studio",
    "Dream Destination", "Modern Fashion", "Fresh Perspective", "Weekend Vibes"
];

const categoryMap = [
    "Design", "Architecture", "Travel", "Design", "Photography",
    "Nature", "Architecture", "Design", "Nature", "Design",
    "Design", "Nature", "Travel", "Fashion", "Travel",
    "Design", "Travel", "Fashion", "Photography", "Nature"
];

let imageCount = 16;
let currentCategory = "All";
let currentSearch = "";
let loading = false;


function getImageURL(index) {
    const width = 500;
    const heights = [650, 450, 750, 550, 700, 500, 800, 600];
    const height = heights[index % heights.length];

    return `https://picsum.photos/seed/ANV-${index}/${width}/${height}`;
}

function createCard(index) {

    const title = titles[index % titles.length];
    const category = categoryMap[index % categoryMap.length];

    const card = document.createElement("article");

    card.className = "card";
    card.dataset.title = title.toLowerCase();
    card.dataset.category = category.toLowerCase();

    card.innerHTML = `
        <img
            src="${getImageURL(index)}"
            alt="${title}"
            loading="lazy"
        >

        <div class="overlay"></div>

        <button
            class="download"
            data-id="${index}"
            aria-label="Download ${title}"
        >
            <i class="ri-download-cloud-2-line"></i> Download
        </button>

        <div class="info">
            <div>
                <h3>${title}</h3>
                <small>${category}</small>
            </div>

        </div>
    `;

    /* =========================
       IMAGE PREVIEW
    ========================= */

    const cardImage = card.querySelector("img");

    const imagePopup =
        document.getElementById("imagePopup");

    const popupImage =
        document.getElementById("popupImage");

    const imagePopupClose =
        document.getElementById("imagePopupClose");


    /* OPEN IMAGE */

    cardImage.addEventListener("click", (event) => {

        event.stopPropagation();

        popupImage.src = cardImage.src;

        popupImage.alt = cardImage.alt;

        imagePopup.classList.add("active");

    });


    /* CLOSE BUTTON */

    imagePopupClose.addEventListener("click", () => {

        imagePopup.classList.remove("active");

        popupImage.src = "";

    });


    /* CLICK OUTSIDE IMAGE */

    imagePopup.addEventListener("click", (event) => {

        if (event.target === imagePopup) {

            imagePopup.classList.remove("active");

            popupImage.src = "";

        }

    });


    /* ESC KEY */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            imagePopup.classList.contains("active")
        ) {

            imagePopup.classList.remove("active");

            popupImage.src = "";

        }

    });


    const downloadButton = card.querySelector(".download");


    downloadButton.addEventListener("click", async function (event) {

        event.stopPropagation();

        // Check user login
        const currentUser =
            JSON.parse(localStorage.getItem("anvCurrentUser"));

        // User login nahi hai
        if (!currentUser) {

            // Login popup open
            const authOverlay =
                document.getElementById("authOverlay");

            const loginForm =
                document.getElementById("loginForm");

            const signupForm =
                document.getElementById("signupForm");

            const loginError =
                document.getElementById("loginError");

            authOverlay.classList.add("active");

            loginForm.classList.remove("hidden");
            signupForm.classList.add("hidden");

            loginError.textContent =
                "Please login to download this inspiration.";

            return;
        }


        // =========================
        // USER IS LOGGED IN
        // =========================

        const oldText = this.innerHTML;

        this.innerHTML =
            '<i class="ri-loader-4-line"></i> Downloading...';

        try {

            const image = card.querySelector("img");

            const response = await fetch(image.src);

            const blob = await response.blob();

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                `ANV-${index}.jpg`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

            this.innerHTML =
                '<i class="ri-check-line"></i> Downloaded';

            setTimeout(() => {

                this.innerHTML = oldText;

            }, 1500);

        } catch (error) {

            console.error(error);

            this.innerHTML =
                '<i class="ri-external-link-line"></i> Open image';

            setTimeout(() => {

                window.open(
                    card.querySelector("img").src,
                    "_blank"
                );

                this.innerHTML = oldText;

            }, 500);

        }

    });



    return card;
}

function renderFeed() {

    feed.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {

        const card = createCard(i);

        const matchesSearch =
            card.dataset.title.includes(currentSearch.toLowerCase());

        const matchesCategory =
            currentCategory === "All" ||
            card.dataset.category === currentCategory.toLowerCase();

        if (matchesSearch && matchesCategory) {
            feed.appendChild(card);
        }
    }

    checkEmptyFeed();
}

function checkEmptyFeed() {

    const existingMessage =
        document.getElementById("emptyMessage");

    if (existingMessage) existingMessage.remove();

    if (feed.children.length === 0) {

        const message = document.createElement("div");
        message.id = "emptyMessage";

        message.innerHTML = `
            <strong>No inspiration found.</strong>
            <br>
            Try another search or category.
        `;

        feed.appendChild(message);
    }
}

function createCategories() {

    const hero = document.querySelector(".hero");

    const categoryContainer =
        document.createElement("div");

    categoryContainer.className = "categories";

    categories.forEach((category, index) => {

        const button =
            document.createElement("button");

        button.className = "category";
        button.textContent = category;

        if (index === 0) {
            button.classList.add("active");
        }

        button.addEventListener("click", function () {

            document
                .querySelectorAll(".category")
                .forEach(btn => btn.classList.remove("active"));

            this.classList.add("active");

            currentCategory = category;

            renderFeed();
        });

        categoryContainer.appendChild(button);
    });

    hero.insertAdjacentElement(
        "afterend",
        categoryContainer
    );
}

searchInput.addEventListener("input", function () {
    currentSearch = this.value.trim();
    renderFeed();
});

loadMore.addEventListener("click", function () {

    if (loading || imageCount >= 100) return;

    loading = true;
    this.textContent = "Loading...";

    setTimeout(() => {
        imageCount += 12;
        renderFeed();

        loading = false;

        if (imageCount >= 1000) {
            this.textContent = "You've reached the end ✓";
            this.disabled = true;
        } else {
            this.textContent = "Load more inspiration →";
        }
    }, 500);
});

feed.addEventListener("error", function (event) {

    if (event.target.tagName === "IMG") {
        event.target.src = "https://picsum.photos/500/650";
    }

}, true);

let lastAutoLoad = 0;

window.addEventListener("scroll", function () {

    const now = Date.now();

    if (now - lastAutoLoad < 800) return;

    const nearBottom =
        window.innerHeight +
        window.scrollY >=
        document.body.offsetHeight - 700;

    if (nearBottom && !loading && imageCount < 100) {

        lastAutoLoad = now;
        imageCount += 8;
        renderFeed();
    }
});

createCategories();
renderFeed();





let login_Signup = () => {
    /* =========================================
       ANV AUTHENTICATION SYSTEM
       ========================================= */


    /* ELEMENTS */

    const authOverlay = document.getElementById("authOverlay");

    const loginBtn = document.getElementById("loginBtn");

    const closeAuth = document.getElementById("closeAuth");

    const loginForm = document.getElementById("loginForm");

    const signupForm = document.getElementById("signupForm");

    const showSignup = document.getElementById("showSignup");

    const showLogin = document.getElementById("showLogin");

    const profile = document.getElementById("profile");


    /* FORMS */

    const loginFormElement =
        document.getElementById("loginFormElement");

    const signupFormElement =
        document.getElementById("signupFormElement");


    /* ERRORS */

    const loginError =
        document.getElementById("loginError");

    const signupError =
        document.getElementById("signupError");


    /* =========================================
       OPEN LOGIN
       ========================================= */

    loginBtn.addEventListener("click", () => {

        authOverlay.classList.add("active");

        loginForm.classList.remove("hidden");

        signupForm.classList.add("hidden");

        loginError.textContent = "";
        signupError.textContent = "";

    });


    /* =========================================
       CLOSE AUTH
       ========================================= */

    closeAuth.addEventListener("click", () => {

        authOverlay.classList.remove("active");

    });


    /* =========================================
       CLICK OUTSIDE
       ========================================= */

    authOverlay.addEventListener("click", (e) => {

        if (e.target === authOverlay) {

            authOverlay.classList.remove("active");

        }

    });


    /* =========================================
       SHOW SIGNUP
       ========================================= */

    showSignup.addEventListener("click", () => {

        loginForm.classList.add("hidden");

        signupForm.classList.remove("hidden");

        loginError.textContent = "";
        signupError.textContent = "";

    });


    /* =========================================
       SHOW LOGIN
       ========================================= */

    showLogin.addEventListener("click", () => {

        signupForm.classList.add("hidden");

        loginForm.classList.remove("hidden");

        loginError.textContent = "";
        signupError.textContent = "";

    });


    /* =========================================
       SIGNUP
       ========================================= */

    signupFormElement.addEventListener("submit", (e) => {

        e.preventDefault();


        const name =
            document.getElementById("signupName").value.trim();

        const email =
            document.getElementById("signupEmail").value.trim();

        const password =
            document.getElementById("signupPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* NAME VALIDATION */

        if (name.length < 2) {

            signupError.textContent =
                "Please enter a valid name.";

            return;
        }


        /* EMAIL VALIDATION */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            signupError.textContent =
                "Please enter a valid email.";

            return;
        }


        /* PASSWORD VALIDATION */

        if (password.length < 6) {

            signupError.textContent =
                "Password must be at least 6 characters.";

            return;
        }


        /* CONFIRM PASSWORD */

        if (password !== confirmPassword) {

            signupError.textContent =
                "Passwords do not match.";

            return;
        }


        /* GET EXISTING USERS */

        const users =
            JSON.parse(localStorage.getItem("anvUsers")) || [];


        /* CHECK EXISTING EMAIL */

        const existingUser =
            users.find(user => user.email === email);


        if (existingUser) {

            signupError.textContent =
                "An account with this email already exists.";

            return;
        }


        /* CREATE USER */

        const newUser = {

            id: Date.now(),

            name: name,

            email: email,

            password: password

        };


        users.push(newUser);


        /* SAVE USERS */

        localStorage.setItem(
            "anvUsers",
            JSON.stringify(users)
        );


        /* AUTO LOGIN */

        localStorage.setItem(
            "anvCurrentUser",
            JSON.stringify(newUser)
        );


        signupError.textContent = "";

        signupFormElement.reset();

        authOverlay.classList.remove("active");

        updateProfile();


    });


    /* =========================================
       LOGIN
       ========================================= */

    loginFormElement.addEventListener("submit", (e) => {

        e.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;


        const users =
            JSON.parse(localStorage.getItem("anvUsers")) || [];


        /* FIND USER */

        const user = users.find(

            user =>
                user.email === email &&
                user.password === password

        );


        /* WRONG LOGIN */

        if (!user) {

            loginError.textContent =
                "Incorrect email or password.";

            return;
        }


        /* SAVE LOGIN */

        localStorage.setItem(
            "anvCurrentUser",
            JSON.stringify(user)
        );


        loginError.textContent = "";

        loginFormElement.reset();

        authOverlay.classList.remove("active");

        updateProfile();


    });


    /* =========================================
       UPDATE PROFILE
       ========================================= */

    function updateProfile() {

        const currentUser =
            JSON.parse(
                localStorage.getItem("anvCurrentUser")
            );


        if (currentUser) {

            loginBtn.style.display = "none";

            profile.style.display = "flex";

            profile.textContent =
                currentUser.name.charAt(0).toUpperCase();


            profile.title =
                `${currentUser.name} — Click to logout`;

        } else {

            loginBtn.style.display = "block";

            profile.style.display = "none";

        }

    }


    /* =========================================
       LOGOUT
       ========================================= */

    /* =========================
       LOGOUT POPUP
    ========================= */

    const logoutOverlay =
        document.getElementById("logoutOverlay");

    const cancelLogout =
        document.getElementById("cancelLogout");

    const confirmLogout =
        document.getElementById("confirmLogout");


    /* OPEN POPUP */

    profile.addEventListener("click", () => {

        const currentUser =
            JSON.parse(
                localStorage.getItem("anvCurrentUser")
            );

        if (!currentUser) return;

        logoutOverlay.classList.add("active");

    });


    /* CANCEL */

    cancelLogout.addEventListener("click", () => {

        logoutOverlay.classList.remove("active");

    });


    /* CONFIRM LOGOUT */

    confirmLogout.addEventListener("click", () => {

        localStorage.removeItem("anvCurrentUser");

        logoutOverlay.classList.remove("active");

        updateProfile();

    });


    /* CLICK OUTSIDE */

    logoutOverlay.addEventListener("click", (e) => {

        if (e.target === logoutOverlay) {

            logoutOverlay.classList.remove("active");

        }

    });

    /* =========================================
       PASSWORD SHOW / HIDE
       ========================================= */

    document
        .querySelectorAll(".password-toggle")
        .forEach(button => {

            button.addEventListener("click", () => {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                const icon =
                    button.querySelector("i");


                if (input.type === "password") {

                    input.type = "text";

                    icon.className =
                        "ri-eye-off-line";

                } else {

                    input.type = "password";

                    icon.className =
                        "ri-eye-line";

                }

            });

        });


    /* =========================================
       CHECK LOGIN WHEN PAGE LOADS
       ========================================= */

    updateProfile();

}

login_Signup()
