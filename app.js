lucide.createIcons();


/* =========================================
   GET ELEMENTS
========================================= */

/* =========================================
   AUTH ELEMENTS
========================================= */

const profileNavButton = document.getElementById("profileNavButton");
const accountProfileButton = document.getElementById("accountProfileButton");
const authAvatarButton = document.getElementById("authAvatarButton");
const authAvatarIcon = document.getElementById("authAvatarIcon");
const authAvatarInitials = document.getElementById("authAvatarInitials");
const authModal = document.getElementById("authModal");
const authBackdrop = document.getElementById("authBackdrop");
const authCloseButton = document.getElementById("authCloseButton");
const signInTab = document.getElementById("signInTab");
const signUpTab = document.getElementById("signUpTab");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const openSignUpButton = document.getElementById("openSignUpButton");
const openSignInButton = document.getElementById("openSignInButton");
const authMessage = document.getElementById("authMessage");
const accountMenu = document.getElementById("accountMenu");
const accountMenuName = document.getElementById("accountMenuName");
const accountMenuEmail = document.getElementById("accountMenuEmail");
const accountMenuAvatar = document.getElementById("accountMenuAvatar");
const logoutButton = document.getElementById("logoutButton");
const AUTH_USER_KEY = "travelBuddyCurrentUser";
const AUTH_ACCOUNTS_KEY = "travelBuddyAccounts";
const SAVED_STORAGE_KEY = "travelBuddySavedPlaces";
const RATINGS_STORAGE_KEY = "travelBuddyPlaceRatings";
const COMMENTS_STORAGE_KEY = "travelBuddyPlaceComments";
const mapNavButton = document.getElementById("mapNavButton");
const mapSection = document.getElementById("mapSection");
const mapShowAllButton = document.getElementById("mapShowAllButton");
const streetMapButton = document.getElementById("streetMapButton");
const satelliteMapButton = document.getElementById("satelliteMapButton");


/* =========================================
MAP DESTINATION COORDINATES
========================================= */

const MAP_COORDINATES = {

    "sohoton-caves": {
        lat: 11.365293,
        lng: 125.164118
    },

    "marabut-marine-park": {
        lat: 11.1076,
        lng: 125.2125
    },

    "pinipisakan-falls": {
        lat: 12.2597,
        lng: 125.0514
    },

    "ulot-river": {
        lat: 11.81405,
        lng: 125.16095
    },

    "san-juanico-bridge": {
        lat: 11.30278,
        lng: 124.97194
    }

};

/* =========================================
   SAMAR MAP BOUNDS
========================================= */

const SAMAR_BOUNDS =
    L.latLngBounds(
        [
            10.75,
            124.20
        ],
        [
            12.75,
            125.75
        ]
    );

const detailsModal =
    document.getElementById("detailsModal");

const detailsModalBackdrop =
    document.getElementById("detailsModalBackdrop");

const detailsCloseButton =
    document.getElementById("detailsCloseButton");

const detailsImage =
    document.getElementById("detailsImage");

const detailsCategory =
    document.getElementById("detailsCategory");

const detailsRating =
    document.getElementById("detailsRating");

const detailsTitle =
    document.getElementById("detailsTitle");

const detailsLocation =
    document.getElementById("detailsLocation");

const detailsDescription =
    document.getElementById("detailsDescription");

const starRating =
    document.getElementById("starRating");

const rateStars =
    document.querySelectorAll(".rate-star");

const yourRatingText =
    document.getElementById("yourRatingText");

const commentInput =
    document.getElementById("commentInput");

const commentSubmitButton =
    document.getElementById("commentSubmitButton");

const commentsList =
    document.getElementById("commentsList");

const commentCount =
    document.getElementById("commentCount");

const savedNavButton =
    document.getElementById("savedNavButton");

const savedSection =
    document.getElementById("savedSection");

const savedGrid =
    document.getElementById("savedGrid");

const savedEmpty =
    document.getElementById("savedEmpty");

const savedCount =
    document.getElementById("savedCount");

const savedNavCount =
    document.getElementById("savedNavCount");

const browseDestinationsButton =
    document.getElementById("browseDestinationsButton");

const favoriteButtons =
    document.querySelectorAll(".favorite-btn");

const exploreNavButton =
    document.getElementById("exploreNavButton");

const searchInput =
    document.getElementById("searchInput");

const homeNavButton =
    document.getElementById("homeNavButton");

const page =
    document.querySelector(".page");

const getStartedButton =
    document.getElementById("getStartedButton");

const filterButton =
    document.getElementById("filterButton");

const filterMenu =
    document.getElementById("filterMenu");

const filterOptions =
    document.querySelectorAll(".filter-option");

const destinationCards =
    document.querySelectorAll(".destination-card");

const seeAllButton =
    document.getElementById("seeAllButton");

let activeDetailsPlaceId = null;
let travelMap = null;
let travelMapMarkers = [];
let streetLayer = null;
let satelliteLayer = null;

/* =========================================
   ACTIVE FILTER
========================================= */

let activeCategory = "All";

function handleAccountAccess() {

    const user =
        getCurrentUser();


    /*
      USER IS NOT LOGGED IN
    */

    if (!user) {

        /*
          ALWAYS OPEN SIGN IN FIRST
        */

        showSignIn();

        openAuthModal();

        return;

    }


    /*
      USER IS LOGGED IN
    */

    accountMenu.hidden =
        !accountMenu.hidden;

}

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                AUTH_USER_KEY
            )
        );

    } catch {

        return null;

    }

}


function saveCurrentUser(user) {

    localStorage.setItem(
        AUTH_USER_KEY,
        JSON.stringify(user)
    );

}


function getAccounts() {

    try {

        const accounts =
            JSON.parse(
                localStorage.getItem(
                    AUTH_ACCOUNTS_KEY
                )
            );

        return Array.isArray(accounts)
            ? accounts
            : [];

    } catch {

        return [];

    }

}


function saveAccounts(accounts) {

    localStorage.setItem(
        AUTH_ACCOUNTS_KEY,
        JSON.stringify(accounts)
    );

}

function getUserInitials(user) {

    if (!user) {
        return "";
    }


    const first =
        user.firstName
            ?.trim()
            .charAt(0)
            .toUpperCase()
        || "";


    const last =
        user.lastName
            ?.trim()
            .charAt(0)
            .toUpperCase()
        || "";


    return `${first}${last}` || "U";

}

function updateAuthUI() {

    const user =
        getCurrentUser();


    if (!user) {

        authAvatarIcon.hidden =
            false;

        authAvatarInitials.hidden =
            true;

        accountMenu.hidden =
            true;

        return;

    }


    const initials =
        getUserInitials(user);


    authAvatarIcon.hidden =
        true;

    authAvatarInitials.hidden =
        false;

    authAvatarInitials.textContent =
        initials;


    accountMenuAvatar.textContent =
        initials;


    accountMenuName.textContent =
        `${user.firstName} ${user.lastName}`;


    accountMenuEmail.textContent =
        user.email;

}

function openAuthModal() {

    authModal.hidden =
        false;

    accountMenu.hidden =
        true;

    document.body.style.overflow =
        "hidden";

}


function closeAuthModal() {

    authModal.hidden =
        true;

    authMessage.hidden =
        true;

    document.body.style.overflow =
        "";

}

authAvatarButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        handleAccountAccess();

    }
);


/* =========================================
   PROFILE NAVIGATION
========================================= */

profileNavButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        const user =
            getCurrentUser();


        /*
          NOT LOGGED IN
          ↓
          OPEN SIGN IN / SIGN UP
        */

        if (!user) {

            showSignIn();

            openAuthModal();

            return;

        }


        /*
          ALREADY LOGGED IN
          ↓
          OPEN ACCOUNT MENU
        */

        accountMenu.hidden =
            !accountMenu.hidden;

    }
);

function showSignIn() {

    signInTab.classList.add(
        "active"
    );

    signUpTab.classList.remove(
        "active"
    );


    signInForm.hidden =
        false;

    signUpForm.hidden =
        true;


    authMessage.hidden =
        true;

}


function showSignUp() {

    signUpTab.classList.add(
        "active"
    );

    signInTab.classList.remove(
        "active"
    );


    signUpForm.hidden =
        false;

    signInForm.hidden =
        true;


    authMessage.hidden =
        true;

}


signInTab?.addEventListener(
    "click",
    showSignIn
);


signUpTab?.addEventListener(
    "click",
    showSignUp
);


openSignUpButton?.addEventListener(
    "click",
    showSignUp
);


openSignInButton?.addEventListener(
    "click",
    showSignIn
);

signUpForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const firstName =
            document
                .getElementById(
                    "signUpFirstName"
                )
                .value
                .trim();


        const lastName =
            document
                .getElementById(
                    "signUpLastName"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "signUpEmail"
                )
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById(
                    "signUpPassword"
                )
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "signUpConfirmPassword"
                )
                .value;


        if (
            password !==
            confirmPassword
        ) {

            authMessage.hidden =
                false;

            authMessage.classList.add(
                "error"
            );

            authMessage.textContent =
                "Passwords do not match.";

            return;

        }


        const accounts =
            getAccounts();


        const accountExists =
            accounts.some(
                account =>
                    account.email === email
            );


        if (accountExists) {

            authMessage.hidden =
                false;

            authMessage.classList.add(
                "error"
            );

            authMessage.textContent =
                "An account with this email already exists.";

            return;

        }


        const newAccount = {

            firstName,
            lastName,
            email,
            password

        };


        accounts.push(
            newAccount
        );


        saveAccounts(
            accounts
        );


        saveCurrentUser({

            firstName,
            lastName,
            email

        });


        authMessage.classList.remove(
            "error"
        );


        updateAuthUI();

        closeAuthModal();

        signUpForm.reset();

    }
);

signInForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const email =
            document
                .getElementById(
                    "signInEmail"
                )
                .value
                .trim()
                .toLowerCase();


        const password =
            document
                .getElementById(
                    "signInPassword"
                )
                .value;


        const accounts =
            getAccounts();


        const account =
            accounts.find(
                item =>
                    item.email === email
                    &&
                    item.password === password
            );


        if (!account) {

            authMessage.hidden =
                false;

            authMessage.classList.add(
                "error"
            );

            authMessage.textContent =
                "Incorrect email or password.";

            return;

        }


        saveCurrentUser({

            firstName:
                account.firstName,

            lastName:
                account.lastName,

            email:
                account.email

        });


        updateAuthUI();

        closeAuthModal();

        signInForm.reset();

    }
);

logoutButton?.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            AUTH_USER_KEY
        );


        accountMenu.hidden =
            true;


        updateAuthUI();

    }
);

authCloseButton?.addEventListener(
    "click",
    closeAuthModal
);


authBackdrop?.addEventListener(
    "click",
    closeAuthModal
);

document.addEventListener(
    "click",
    event => {

        if (
            !accountMenu?.contains(
                event.target
            )
            &&
            !authAvatarButton?.contains(
                event.target
            )
        ) {

            accountMenu.hidden =
                true;

        }

    }
);

document
    .querySelectorAll(
        ".auth-password-toggle"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset
                        .passwordTarget;


                const input =
                    document.getElementById(
                        targetId
                    );


                if (!input) {
                    return;
                }


                input.type =
                    input.type === "password"
                        ? "text"
                        : "password";

            }
        );

    });

function createTravelMapIcon() {

    return L.divIcon({

        className:
            "travel-map-icon",

        html:
            '<div class="travel-map-marker"></div>',

        iconSize:
            [38, 38],

        iconAnchor:
            [19, 38],

        popupAnchor:
            [0, -38]

    });

}

function createMapPopup(
    card
) {

    const placeId =
        card.dataset.id;

    const name =
        card.dataset.name || "";

    const category =
        card.dataset.category || "";

    const image =
        card.querySelector(
            ".card-photo img"
        )?.src || "";

    const location =
        card.querySelector(
            ".place"
        )?.textContent.trim() || "";


    return `

        <div class="map-popup">

            <img
                class="map-popup-image"
                src="${image}"
                alt="${name}"
            >


            <div class="map-popup-body">

                <span class="map-popup-category">
                    ${category}
                </span>


                <h3 class="map-popup-title">
                    ${name}
                </h3>


                <p class="map-popup-location">
                    ${location}
                </p>


                <button
                    class="map-popup-button"
                    type="button"
                    data-map-place-id="${placeId}"
                >
                    View Details
                </button>

            </div>

        </div>

    `;

}

function initializeTravelMap() {

    if (
        typeof L === "undefined"
    ) {

        console.error(
            "Leaflet failed to load."
        );

        return;

    }


    /*
      MAP ALREADY EXISTS
    */

    if (travelMap) {

        setTimeout(
            () => {

                travelMap.invalidateSize();

            },
            100
        );

        return;

    }


    /* =========================================
       CREATE MAP
    ========================================= */

    travelMap =
        L.map(
            "travelMap",
            {
                zoomControl: false,

                minZoom: 8,

                maxZoom: 19,

                maxBounds:
                    SAMAR_BOUNDS,

                maxBoundsViscosity:
                    1.0
            }
        );


    /* =========================================
       STREET MAP
    ========================================= */

    streetLayer =
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        );


    streetLayer.addTo(
        travelMap
    );


    /* =========================================
       SATELLITE MAP
    ========================================= */

    satelliteLayer =
        L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
                maxZoom: 19,

                attribution:
                    "Tiles &copy; Esri"
            }
        );


    /* =========================================
       ZOOM BUTTONS
    ========================================= */

    L.control.zoom({
        position: "topright"
    }).addTo(
        travelMap
    );


    const markerBounds = [];


    /* =========================================
       BUILD DESTINATION MARKERS
    ========================================= */

    destinationCards.forEach(
        card => {

            const placeId =
                card.dataset.id;


            const coordinates =
                MAP_COORDINATES[
                placeId
                ];


            if (!coordinates) {

                return;

            }


            const marker =
                L.marker(
                    [
                        coordinates.lat,
                        coordinates.lng
                    ],
                    {
                        icon:
                            createTravelMapIcon()
                    }
                );


            marker.bindPopup(
                createMapPopup(
                    card
                ),
                {
                    closeButton:
                        false,

                    maxWidth:
                        260
                }
            );


            marker.addTo(
                travelMap
            );


            travelMapMarkers.push(
                marker
            );


            markerBounds.push(
                [
                    coordinates.lat,
                    coordinates.lng
                ]
            );

        }
    );


    /* =========================================
       FOCUS SAMAR
    ========================================= */

    travelMap.fitBounds(
        SAMAR_BOUNDS,
        {
            padding:
                [20, 20]
        }
    );


    /*
      OPTIONAL:
      IF YOU WANT THE DESTINATIONS
      TO BE SLIGHTLY MORE CENTERED
    */

    if (
        markerBounds.length
    ) {

        const destinationBounds =
            L.latLngBounds(
                markerBounds
            );


        travelMap.fitBounds(
            destinationBounds,
            {
                padding:
                    [45, 45],

                maxZoom:
                    10
            }
        );

    }

}

/* =========================================
   MAP NAVIGATION
========================================= */

mapNavButton?.addEventListener(
    "click",
    () => {

        /*
          LEAVE OTHER MODES
        */

        page?.classList.remove(
            "explore-mode"
        );

        page?.classList.remove(
            "saved-mode"
        );


        /*
          ENTER MAP MODE
        */

        page?.classList.add(
            "map-mode"
        );


        /*
          ACTIVE NAV ITEM
        */

        document
            .querySelectorAll(
                ".nav-item"
            )
            .forEach(
                item => {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        mapNavButton.classList.add(
            "active"
        );


        /*
          MOVE TO TOP
        */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /*
          INITIALIZE MAP AFTER
          SECTION BECOMES VISIBLE
        */

        setTimeout(
            () => {

                initializeTravelMap();

            },
            120
        );

    }
);

streetMapButton?.addEventListener(
    "click",
    () => {

        if (
            !travelMap
            ||
            !streetLayer
        ) {

            return;

        }


        if (
            satelliteLayer
            &&
            travelMap.hasLayer(
                satelliteLayer
            )
        ) {

            travelMap.removeLayer(
                satelliteLayer
            );

        }


        if (
            !travelMap.hasLayer(
                streetLayer
            )
        ) {

            streetLayer.addTo(
                travelMap
            );

        }


        streetMapButton
            .classList.add(
                "active"
            );


        satelliteMapButton
            ?.classList.remove(
                "active"
            );

    }
);

satelliteMapButton?.addEventListener(
    "click",
    () => {

        if (
            !travelMap
            ||
            !satelliteLayer
        ) {

            return;

        }


        if (
            streetLayer
            &&
            travelMap.hasLayer(
                streetLayer
            )
        ) {

            travelMap.removeLayer(
                streetLayer
            );

        }


        if (
            !travelMap.hasLayer(
                satelliteLayer
            )
        ) {

            satelliteLayer.addTo(
                travelMap
            );

        }


        satelliteMapButton
            .classList.add(
                "active"
            );


        streetMapButton
            ?.classList.remove(
                "active"
            );

    }
);


/* =========================================
   APPLY SEARCH + FILTER
========================================= */

function applyDestinationFilters() {

    const searchTerm =
        searchInput?.value
            .trim()
            .toLowerCase()
        || "";


    destinationCards.forEach(card => {

        const category =
            card.dataset.category || "";

        const destinationName =
            card.dataset.name
                ?.toLowerCase()
            || "";

        const location =
            card.querySelector(".place")
                ?.textContent
                .toLowerCase()
            || "";

        const description =
            card.querySelector(".description")
                ?.textContent
                .toLowerCase()
            || "";


        const matchesCategory =
            activeCategory === "All"
            ||
            category === activeCategory;


        const matchesSearch =
            searchTerm === ""
            ||
            destinationName.includes(searchTerm)
            ||
            location.includes(searchTerm)
            ||
            description.includes(searchTerm)
            ||
            category
                .toLowerCase()
                .includes(searchTerm);


        const isMatch =
            matchesCategory
            &&
            matchesSearch;


        card.classList.toggle(
            "hidden",
            !isMatch
        );

    });

}

seeAllButton?.addEventListener(
    "click",
    () => {

        page?.classList.remove(
            "map-mode"
        );

        page?.classList.add(
            "explore-mode"
        );


        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


        exploreNavButton?.classList.add(
            "active"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        setTimeout(
            () => {

                searchInput?.focus();

            },
            350
        );

    }
);


/* =========================================
   EXPLORE NAVIGATION
========================================= */

exploreNavButton?.addEventListener(
    "click",
    () => {

        page?.classList.remove(
            "map-mode"
        );

        page?.classList.remove(
            "saved-mode"
        );

        /* HIDE EXPLORE SAMAR HERO */

        page?.classList.add(
            "explore-mode"
        );


        /* UPDATE BOTTOM NAV */

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


        exploreNavButton.classList.add(
            "active"
        );


        /* MOVE TO TOP */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });


        /* FOCUS SEARCH */

        setTimeout(
            () => {

                searchInput?.focus();

            },
            350
        );

    }
);

homeNavButton?.addEventListener(
    "click",
    () => {

        page?.classList.remove(
            "map-mode"
        );

        page?.classList.remove(
            "saved-mode"
        );

        /* SHOW HERO AGAIN */

        page?.classList.remove(
            "explore-mode"
        );


        /* UPDATE NAVIGATION */

        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


        homeNavButton.classList.add(
            "active"
        );


        /* RETURN TO TOP */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================
   GET STARTED BUTTON
========================================= */

getStartedButton?.addEventListener(
    "click",
    () => {

        document
            .querySelector(".featured-section")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


/* =========================================
   OPEN / CLOSE FILTER MENU
========================================= */

filterButton?.addEventListener(
    "click",
    event => {

        event.stopPropagation();


        const isOpen =
            !filterMenu.hidden;


        filterMenu.hidden =
            isOpen;


        filterButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

    }
);


/* =========================================
   FILTER OPTION CLICK
========================================= */

filterOptions.forEach(option => {

    option.addEventListener(
        "click",
        () => {

            activeCategory =
                option.dataset.category;


            filterOptions.forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


            option.classList.add(
                "active"
            );


            applyDestinationFilters();


            filterMenu.hidden =
                true;


            filterButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );

});


/* =========================================
   SEARCH INPUT
========================================= */

searchInput?.addEventListener(
    "input",
    () => {

        applyDestinationFilters();

    }
);


/* =========================================
   CLOSE FILTER WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener(
    "click",
    event => {

        if (
            !filterMenu?.contains(event.target)
            &&
            !filterButton?.contains(event.target)
        ) {

            if (filterMenu) {

                filterMenu.hidden =
                    true;

            }


            filterButton?.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);

function getSavedPlaces() {

    try {

        return JSON.parse(
            localStorage.getItem(
                SAVED_STORAGE_KEY
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveSavedPlaces(savedPlaces) {

    localStorage.setItem(
        SAVED_STORAGE_KEY,
        JSON.stringify(savedPlaces)
    );

}

function updateSavedCount() {

    const savedPlaces =
        getSavedPlaces();


    const total =
        savedPlaces.length;


    savedCount.textContent =
        `${total} saved`;


    savedNavCount.textContent =
        total;


    savedNavCount.hidden =
        total === 0;

}

function updateFavoriteButtons() {

    const savedPlaces =
        getSavedPlaces();


    document
        .querySelectorAll(".favorite-btn")
        .forEach(button => {

            const card =
                button.closest(
                    ".destination-card"
                );


            if (!card) {
                return;
            }


            const placeId =
                card.dataset.id;


            const isSaved =
                savedPlaces.includes(
                    placeId
                );


            button.classList.toggle(
                "saved",
                isSaved
            );


            button.setAttribute(
                "aria-label",

                isSaved
                    ? "Remove saved destination"
                    : "Save destination"
            );

        });

}

function toggleSavedPlace(card) {

    if (!card) {
        return;
    }


    const placeId =
        card.dataset.id;


    if (!placeId) {
        return;
    }


    let savedPlaces =
        getSavedPlaces();


    const isAlreadySaved =
        savedPlaces.includes(
            placeId
        );


    if (isAlreadySaved) {

        savedPlaces =
            savedPlaces.filter(
                id =>
                    id !== placeId
            );

    } else {

        savedPlaces.push(
            placeId
        );

    }


    saveSavedPlaces(
        savedPlaces
    );


    updateFavoriteButtons();

    updateSavedCount();

}

favoriteButtons.forEach(button => {

    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            const card =
                button.closest(
                    ".destination-card"
                );


            toggleSavedPlace(
                card
            );

        }
    );

});

function renderSavedPlaces() {

    const savedPlaces =
        getSavedPlaces();


    savedGrid.innerHTML =
        "";


    savedPlaces.forEach(placeId => {

        const originalCard =
            document.querySelector(
                `.featured-section .destination-card[data-id="${placeId}"]`
            );


        if (!originalCard) {
            return;
        }


        const clonedCard =
            originalCard.cloneNode(true);


        clonedCard.classList.remove(
            "hidden"
        );


        savedGrid.appendChild(
            clonedCard
        );

    });


    savedEmpty.hidden =
        savedPlaces.length !== 0;


    updateSavedCount();


    lucide.createIcons();


    /*
      HEART BUTTONS INSIDE
      THE CLONED SAVED CARDS
    */

    savedGrid
        .querySelectorAll(
            ".favorite-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const card =
                        button.closest(
                            ".destination-card"
                        );


                    toggleSavedPlace(
                        card
                    );


                    renderSavedPlaces();

                }
            );

        });


    updateFavoriteButtons();

}

savedNavButton?.addEventListener(
    "click",
    () => {

        page?.classList.remove(
            "map-mode"
        );

        page?.classList.remove(
            "explore-mode"
        );


        page?.classList.add(
            "saved-mode"
        );


        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


        savedNavButton.classList.add(
            "active"
        );


        renderSavedPlaces();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

browseDestinationsButton?.addEventListener(
    "click",
    () => {

        page?.classList.remove(
            "map-mode"
        );

        page?.classList.remove(
            "saved-mode"
        );


        page?.classList.add(
            "explore-mode"
        );


        document
            .querySelectorAll(".nav-item")
            .forEach(item => {

                item.classList.remove(
                    "active"
                );

            });


        exploreNavButton?.classList.add(
            "active"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);

/* =========================================
   PLACE RATINGS
========================================= */

function getPlaceRatings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                RATINGS_STORAGE_KEY
            )
        ) || {};

    } catch {

        return {};

    }

}


function savePlaceRatings(ratings) {

    localStorage.setItem(
        RATINGS_STORAGE_KEY,
        JSON.stringify(ratings)
    );

}


function getPlaceRating(placeId) {

    const ratings =
        getPlaceRatings();

    return ratings[placeId] || 0;

}


function setPlaceRating(
    placeId,
    rating
) {

    const ratings =
        getPlaceRatings();

    ratings[placeId] =
        rating;

    savePlaceRatings(
        ratings
    );

}

/* =========================================
   PLACE COMMENTS
========================================= */

function getPlaceComments() {

    try {

        return JSON.parse(
            localStorage.getItem(
                COMMENTS_STORAGE_KEY
            )
        ) || {};

    } catch {

        return {};

    }

}


function savePlaceComments(comments) {

    localStorage.setItem(
        COMMENTS_STORAGE_KEY,
        JSON.stringify(comments)
    );

}


function getCommentsForPlace(
    placeId
) {

    const comments =
        getPlaceComments();

    return comments[placeId] || [];

}

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function renderYourRating() {

    if (!activeDetailsPlaceId) {
        return;
    }


    const rating =
        getPlaceRating(
            activeDetailsPlaceId
        );


    rateStars.forEach(star => {

        const starValue =
            Number(
                star.dataset.rating
            );


        star.classList.toggle(
            "active",
            starValue <= rating
        );

    });


    if (rating === 0) {

        yourRatingText.textContent =
            "Not rated";

    } else {

        yourRatingText.textContent =
            `${rating}/5`;

    }

}

rateStars.forEach(star => {

    star.addEventListener(
        "click",
        () => {

            if (!activeDetailsPlaceId) {
                return;
            }


            const rating =
                Number(
                    star.dataset.rating
                );


            setPlaceRating(
                activeDetailsPlaceId,
                rating
            );


            renderYourRating();

        }
    );

});

function renderComments() {

    if (!activeDetailsPlaceId) {
        return;
    }


    const comments =
        getCommentsForPlace(
            activeDetailsPlaceId
        );


    commentsList.innerHTML =
        "";


    commentCount.textContent =
        `${comments.length} ${comments.length === 1
            ? "comment"
            : "comments"
        }`;


    comments
        .slice()
        .reverse()
        .forEach(comment => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "comment-item";


            item.innerHTML = `

                <div
                    class="comment-item-avatar"
                >
                    JR
                </div>


                <div>

                    <div
                        class="comment-bubble"
                    >

                        <span
                            class="comment-author"
                        >
                            JR
                        </span>

                        <p
                            class="comment-text"
                        >
                            ${escapeHTML(comment.text)}
                        </p>

                    </div>

                    <div
                        class="comment-meta"
                    >
                        ${escapeHTML(comment.date)}
                    </div>

                </div>

            `;


            commentsList.appendChild(
                item
            );

        });

}

function submitComment() {

    if (!activeDetailsPlaceId) {
        return;
    }


    const text =
        commentInput.value
            .trim();


    if (!text) {

        commentInput.focus();

        return;

    }


    const allComments =
        getPlaceComments();


    if (
        !allComments[
        activeDetailsPlaceId
        ]
    ) {

        allComments[
            activeDetailsPlaceId
        ] = [];

    }


    allComments[
        activeDetailsPlaceId
    ].push({

        id:
            Date.now(),

        text:
            text,

        date:
            new Date()
                .toLocaleString()

    });


    savePlaceComments(
        allComments
    );


    commentInput.value =
        "";


    renderComments();

}

commentSubmitButton?.addEventListener(
    "click",
    submitComment
);

commentInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter"
            &&
            event.ctrlKey
        ) {

            event.preventDefault();

            submitComment();

        }

    }
);

function openDestinationDetails(
    card
) {

    if (!card) {
        return;
    }


    const placeId =
        card.dataset.id;

    const category =
        card.dataset.category || "";

    const name =
        card.dataset.name || "";

    const image =
        card.querySelector(
            ".card-photo img"
        );

    const location =
        card.querySelector(
            ".place"
        );

    const description =
        card.querySelector(
            ".description"
        );

    const rating =
        card.querySelector(
            ".rating-badge b"
        );


    if (!placeId) {
        return;
    }


    activeDetailsPlaceId =
        placeId;


    detailsImage.src =
        image?.src || "";

    detailsImage.alt =
        name;


    detailsCategory.textContent =
        category;


    detailsTitle.textContent =
        name;


    detailsLocation.textContent =
        location?.textContent
            .trim()
        || "";


    detailsDescription.textContent =
        description?.textContent
            .trim()
        || "";


    detailsRating.textContent =
        rating?.textContent
            .trim()
        || "—";


    commentInput.value =
        "";


    renderYourRating();

    renderComments();


    detailsModal.hidden =
        false;


    document.body.classList.add(
        "details-modal-open"
    );


    lucide.createIcons();

}

mapShowAllButton?.addEventListener(
    "click",
    () => {

        if (!travelMap) {

            return;

        }


        const bounds =
            travelMapMarkers.map(
                marker =>
                    marker.getLatLng()
            );


        if (!bounds.length) {

            travelMap.fitBounds(
                SAMAR_BOUNDS
            );

            return;

        }


        travelMap.fitBounds(
            bounds,
            {
                padding:
                    [45, 45],

                maxZoom:
                    10
            }
        );

    }
);

document.addEventListener(
    "click",
    event => {

        const mapDetailsButton =
            event.target.closest(
                "[data-map-place-id]"
            );


        if (!mapDetailsButton) {
            return;
        }


        const placeId =
            mapDetailsButton.dataset
                .mapPlaceId;


        const card =
            document.querySelector(
                `.featured-section .destination-card[data-id="${placeId}"]`
            );


        if (!card) {
            return;
        }


        travelMap?.closePopup();


        openDestinationDetails(
            card
        );

    }
);

document
    .querySelectorAll(".details-btn")

document.addEventListener(
    "click",
    event => {

        const detailsButton =
            event.target.closest(
                ".details-btn"
            );


        if (!detailsButton) {
            return;
        }


        const card =
            detailsButton.closest(
                ".destination-card"
            );


        openDestinationDetails(
            card
        );

    }
);

function closeDestinationDetails() {

    detailsModal.hidden =
        true;


    document.body.classList.remove(
        "details-modal-open"
    );


    activeDetailsPlaceId =
        null;

}

detailsCloseButton?.addEventListener(
    "click",
    closeDestinationDetails
);

detailsModalBackdrop?.addEventListener(
    "click",
    closeDestinationDetails
);

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
            &&
            !detailsModal.hidden
        ) {

            closeDestinationDetails();

        }

    }
);

updateFavoriteButtons();
updateAuthUI();
updateSavedCount();

/* =========================================
   MAP RESPONSIVE RESIZE FIX
========================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            travelMap
            &&
            page?.classList.contains(
                "map-mode"
            )
        ) {

            setTimeout(
                () => {

                    travelMap.invalidateSize();

                },
                100
            );

        }

    }
);

window.addEventListener(
    "orientationchange",
    () => {

        if (!travelMap) {
            return;
        }


        setTimeout(
            () => {

                travelMap.invalidateSize();

            },
            250
        );

    }
);