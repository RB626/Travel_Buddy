
import {
    auth,
    db
} from "./firebase-config.js";


import {
    collection,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import {
    createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,

    GoogleAuthProvider,
    signInWithPopup

} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


const lucide = window.lucide;

lucide.createIcons();


const travelBuddyAiButton = document.getElementById("travelBuddyAiButton");
const aiChat = document.getElementById("aiChat");
const aiChatCloseButton = document.getElementById("aiChatCloseButton");
const aiChatMessages = document.getElementById("aiChatMessages");
const aiChatForm = document.getElementById("aiChatForm");
const aiChatInput = document.getElementById("aiChatInput");
const aiChatSendButton = document.getElementById("aiChatSendButton");
const authAvatarPhoto = document.getElementById("authAvatarPhoto");
const accountMenuPhoto = document.getElementById("accountMenuPhoto");
const accountMenuInitials = document.getElementById("accountMenuInitials");
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
const googleSignInButton = document.getElementById("googleSignInButton");
const forgotPasswordButton = document.querySelector(".forgot-password-btn");
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

/* =========================================
   SAMAR MAP BOUNDS
========================================= */

const SAMAR_BOUNDS = {

    north:
        12.75,

    south:
        10.75,

    west:
        124.20,

    east:
        125.75

};

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

function getDestinationCards() {

    return document
        .querySelectorAll(
            ".featured-section .destination-card"
        );

}

const seeAllButton =
    document.getElementById("seeAllButton");

let activeDetailsPlaceId = null;
let travelMap = null;
let travelMapMarkers = [];
let travelMapInfoWindow =
    null;

/* =========================================
   ACTIVE FILTER
========================================= */

let activeCategory = "All";

/* =========================================================
   REALTIME FIRESTORE DESTINATIONS
========================================================= */

const destinationGrid =
    document.getElementById(
        "destinationGrid"
    );


let realtimeDestinations =
    [];

let realtimeDestinationsLoaded =
    false;


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeDestinationHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   DISTANCE FROM CATBALOGAN
========================================================= */

function calculateDistanceFromCatbalogan(
    lat,
    lng
) {

    const startLat =
        11.7753;

    const startLng =
        124.8861;


    const destinationLat =
        Number(
            lat
        );

    const destinationLng =
        Number(
            lng
        );


    if (
        !Number.isFinite(
            destinationLat
        )
        ||
        !Number.isFinite(
            destinationLng
        )
    ) {

        return null;

    }


    const earthRadius =
        6371;


    const toRadians =
        degrees =>
            degrees *
            Math.PI /
            180;


    const dLat =
        toRadians(
            destinationLat -
            startLat
        );


    const dLng =
        toRadians(
            destinationLng -
            startLng
        );


    const a =
        Math.sin(
            dLat / 2
        ) ** 2
        +
        Math.cos(
            toRadians(
                startLat
            )
        )
        *
        Math.cos(
            toRadians(
                destinationLat
            )
        )
        *
        Math.sin(
            dLng / 2
        ) ** 2;


    const distance =
        earthRadius *
        (
            2 *
            Math.atan2(
                Math.sqrt(
                    a
                ),
                Math.sqrt(
                    1 - a
                )
            )
        );


    return distance;

}


/* =========================================================
   CREATE DESTINATION CARD
========================================================= */

function createRealtimeDestinationCard(
    destination
) {

    const id =
        escapeDestinationHTML(
            destination.id
        );


    const name =
        escapeDestinationHTML(
            destination.name
            ||
            "Unnamed destination"
        );


    const category =
        escapeDestinationHTML(
            destination.category
            ||
            "Destination"
        );


    const municipality =
        escapeDestinationHTML(
            destination.municipality
            ||
            ""
        );


    const barangay =
        escapeDestinationHTML(
            destination.barangay
            ||
            ""
        );


    const description =
        escapeDestinationHTML(
            destination.shortDesc
            ||
            destination.fullDesc
            ||
            ""
        );


    const image =
        escapeDestinationHTML(
            destination.img
            ||
            ""
        );


    const ratingNumber =
        Number(
            destination.rating
            ||
            0
        );


    const rating =
        ratingNumber >
            0

            ?

            ratingNumber
                .toFixed(
                    1
                )

            :

            "New";


    const distance =
        calculateDistanceFromCatbalogan(
            destination.lat,
            destination.lng
        );


    const distanceText =
        distance !==
            null

            ?

            `${distance.toFixed(1)} km away`

            :

            "Samar";


    let locationText =
        municipality;


    if (
        barangay
        &&
        municipality
    ) {

        locationText =
            `${barangay}, ${municipality}`;

    }


    if (
        locationText
    ) {

        locationText +=
            ", Samar";

    } else {

        locationText =
            "Samar";

    }


    return `

        <article
            class="destination-card"
            data-id="${id}"
            data-category="${category}"
            data-name="${name}"
            data-lat="${Number(destination.lat) || ""}"
            data-lng="${Number(destination.lng) || ""}"
        >

            <div class="card-photo">

                <img
                    src="${image}"
                    alt="${name}"
                    loading="lazy"
                >


                <span class="category-badge">

                    ${category}

                </span>


                <div class="card-top-actions">

                    <button
                        class="favorite-btn"
                        type="button"
                        aria-label="Save destination"
                    >

                        <i data-lucide="heart"></i>

                    </button>


                    <span class="rating-badge">

                        <span class="star">
                            ★
                        </span>

                        <b>
                            ${rating}
                        </b>

                    </span>

                </div>

            </div>


            <div class="card-body">

                <h4>
                    ${name}
                </h4>


                <p class="place">

                    <i data-lucide="map-pin"></i>

                    ${escapeDestinationHTML(locationText)}

                </p>


                <p class="description">

                    ${description}

                </p>


                <div class="card-footer">

                    <span class="distance">

                        <i data-lucide="navigation"></i>

                        ${distanceText}

                    </span>


                    <button
                        class="details-btn"
                        type="button"
                    >

                        View Details

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   RENDER REALTIME DESTINATIONS
========================================================= */

function renderRealtimeDestinations() {

    if (
        !destinationGrid
    ) {

        return;

    }


    if (
        realtimeDestinations.length ===
        0
    ) {

        destinationGrid.innerHTML = `

            <div
                style="
                    grid-column:1/-1;
                    padding:50px 20px;
                    text-align:center;
                    color:#587087;
                    font-weight:700;
                "
            >

                No published destinations yet.

            </div>

        `;


        return;

    }


    destinationGrid.innerHTML =

        realtimeDestinations
            .map(
                createRealtimeDestinationCard
            )
            .join(
                ""
            );


    /* RESTORE LUCIDE ICONS */

    if (
        window.lucide
    ) {

        window.lucide
            .createIcons();

    }


    /* RESTORE FAVORITE STATES */

    updateFavoriteButtons();

    updateSavedCount();


    /* REAPPLY SEARCH / CATEGORY */

    applyDestinationFilters();


    /* UPDATE SAVED PAGE IF OPEN */

    if (
        page?.classList.contains(
            "saved-mode"
        )
    ) {

        renderSavedPlaces();

    }

}


/* =========================================================
   LISTEN TO PUBLISHED DOT DESTINATIONS
========================================================= */

function startRealtimeDestinationListener() {

    const publishedQuery =
        query(

            collection(
                db,
                "destinations"
            ),

            where(
                "status",
                "==",
                "Published"
            )

        );


    onSnapshot(

        publishedQuery,

        snapshot => {

            realtimeDestinations =
                snapshot.docs
                    .map(
                        documentSnapshot => ({

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        })
                    );

            realtimeDestinationsLoaded =
                true;

            realtimeDestinations.sort(
                (
                    first,
                    second
                ) => {

                    const firstTime =
                        first.createdAt
                            ?.toMillis?.()
                        ||
                        first.updatedAt
                            ?.toMillis?.()
                        ||
                        0;


                    const secondTime =
                        second.createdAt
                            ?.toMillis?.()
                        ||
                        second.updatedAt
                            ?.toMillis?.()
                        ||
                        0;


                    return (
                        secondTime -
                        firstTime
                    );

                }
            );


            console.log(
                "Realtime published destinations:",
                realtimeDestinations
            );


            renderRealtimeDestinations();

        },

        error => {

            console.error(
                "DESTINATION FIRESTORE ERROR:",
                error
            );


            if (
                destinationGrid
            ) {

                destinationGrid.innerHTML = `

                    <div
                        style="
                            grid-column:1/-1;
                            padding:40px;
                            text-align:center;
                            color:#d33838;
                            font-weight:700;
                        "
                    >

                        Unable to load destinations.

                    </div>

                `;

            }

        }

    );

}


/* =========================================================
   START REALTIME DESTINATIONS
========================================================= */

startRealtimeDestinationListener();

/* =========================================================
   FIREBASE AUTHENTICATION
========================================================= */


/* =========================================
   CURRENT USER
========================================= */

function getCurrentUser() {

    return auth.currentUser;

}


/* =========================================
   USER INITIALS
========================================= */

function getUserInitials(
    user
) {

    if (!user) {

        return "U";

    }


    const fullName =
        user.displayName
            ?.trim()
        || "";


    if (fullName) {

        const parts =
            fullName.split(/\s+/);


        const first =
            parts[0]
                ?.charAt(0)
                .toUpperCase()
            || "";


        const last =
            parts.length > 1
                ?
                parts[
                    parts.length - 1
                ]
                    ?.charAt(0)
                    .toUpperCase()
                :
                "";


        return (
            first + last
        ) || "U";

    }


    return (
        user.email
            ?.charAt(0)
            .toUpperCase()
        ||
        "U"
    );

}


/* =========================================
   UPDATE ACCOUNT UI
========================================= */

/* =========================================================
   UPDATE AUTH UI
========================================================= */

function updateAuthUI(
    user
) {

    /* =========================================
       LOGGED OUT
    ========================================= */

    if (!user) {

        authAvatarIcon.hidden =
            false;


        authAvatarInitials.hidden =
            true;


        authAvatarPhoto.hidden =
            true;


        authAvatarPhoto.src =
            "";


        accountMenu.hidden =
            true;


        return;

    }


    /* =========================================
       LOGGED IN
    ========================================= */

    const initials =
        getUserInitials(
            user
        );


    const profilePhoto =
        user.photoURL
        ||
        "";


    /* =========================================
       USER HAS GOOGLE PROFILE PHOTO
    ========================================= */

    if (profilePhoto) {

        /*
          TOP HEADER PHOTO
        */

        authAvatarIcon.hidden =
            true;


        authAvatarInitials.hidden =
            true;


        authAvatarPhoto.src =
            profilePhoto;


        authAvatarPhoto.hidden =
            false;


        /*
          ACCOUNT MENU PHOTO
        */

        accountMenuInitials.hidden =
            true;


        accountMenuPhoto.src =
            profilePhoto;


        accountMenuPhoto.hidden =
            false;

    }


    /* =========================================
       NO PROFILE PHOTO
       USE INITIALS
    ========================================= */

    else {

        /*
          HEADER
        */

        authAvatarIcon.hidden =
            true;


        authAvatarPhoto.hidden =
            true;


        authAvatarPhoto.src =
            "";


        authAvatarInitials.hidden =
            false;


        authAvatarInitials.textContent =
            initials;


        /*
          ACCOUNT MENU
        */

        accountMenuPhoto.hidden =
            true;


        accountMenuPhoto.src =
            "";


        accountMenuInitials.hidden =
            false;


        accountMenuInitials.textContent =
            initials;

    }


    /* =========================================
       ACCOUNT INFORMATION
    ========================================= */

    accountMenuName.textContent =
        user.displayName
        ||
        "Traveler";


    accountMenuEmail.textContent =
        user.email
        ||
        "";

}


/* =========================================
   ACCOUNT ACCESS
========================================= */

function handleAccountAccess() {

    const user =
        getCurrentUser();


    if (!user) {

        accountMenu.hidden =
            true;


        showSignIn();


        openAuthModal();


        return;

    }


    accountMenu.hidden =
        !accountMenu.hidden;

}

/* =========================================================
   TRAVELBUDDY AI - CLOUDFLARE API
========================================================= */

const TRAVELBUDDY_API_URL =
    "https://openrouterapikey.rbbelas54.workers.dev/chat";


let travelBuddyConversation = [];


/* =========================================================
   BUILD TRAVELBUDDY DESTINATION KNOWLEDGE
========================================================= */

function buildTravelBuddyKnowledge() {

    const cards =
        document.querySelectorAll(
            ".featured-section .destination-card"
        );


    const places = [];


    cards.forEach(card => {

        const name =
            card.dataset.name
            ||
            card.querySelector("h4")
                ?.textContent
                .trim()
            ||
            "";


        const category =
            card.dataset.category
            ||
            "";


        const location =
            card.querySelector(".place")
                ?.textContent
                .trim()
            ||
            "";


        const description =
            card.querySelector(".description")
                ?.textContent
                .trim()
            ||
            "";


        const distance =
            card.querySelector(".distance")
                ?.textContent
                .trim()
            ||
            "";


        const rating =
            card.querySelector(".rating-badge b")
                ?.textContent
                .trim()
            ||
            "";


        places.push(
            `
Destination: ${name}
Category: ${category}
Location: ${location}
Description: ${description}
Distance shown in TravelBuddy: ${distance}
Rating shown in TravelBuddy: ${rating}
`.trim()
        );

    });


    return places.join("\n\n");

}


/* =========================================================
   ADD CHAT MESSAGE
========================================================= */

function addAiChatMessage(
    message,
    sender = "bot"
) {

    const messageElement =
        document.createElement("div");


    messageElement.className =
        `ai-message ai-message-${sender}`;


    if (sender === "bot") {

        const avatar =
            document.createElement("div");


        avatar.className =
            "ai-message-avatar";


        avatar.innerHTML =
            `<i data-lucide="bot"></i>`;


        messageElement.appendChild(
            avatar
        );

    }


    const bubble =
        document.createElement("div");


    bubble.className =
        "ai-message-bubble";


    bubble.textContent =
        message;


    messageElement.appendChild(
        bubble
    );


    aiChatMessages.appendChild(
        messageElement
    );


    /* RESTORE LUCIDE ICONS */

    if (window.lucide) {

        window.lucide.createIcons();

    }


    aiChatMessages.scrollTop =
        aiChatMessages.scrollHeight;


    return messageElement;

}


/* =========================================================
   AI TYPING ANIMATION
========================================================= */

function showAiTyping() {

    const typingMessage =
        document.createElement("div");


    typingMessage.className =
        "ai-message ai-message-bot";


    typingMessage.innerHTML = `
        <div class="ai-message-avatar">
            <i data-lucide="bot"></i>
        </div>

        <div class="ai-message-bubble">
            <div class="ai-typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;


    aiChatMessages.appendChild(
        typingMessage
    );


    if (window.lucide) {

        window.lucide.createIcons();

    }


    aiChatMessages.scrollTop =
        aiChatMessages.scrollHeight;


    return typingMessage;

}


/* =========================================================
   SEND MESSAGE TO TRAVELBUDDY AI
========================================================= */

async function sendTravelBuddyMessage(
    message
) {

    const cleanedMessage =
        message.trim();


    if (!cleanedMessage) {

        return;

    }


    /* USER MESSAGE */

    addAiChatMessage(
        cleanedMessage,
        "user"
    );


    aiChatInput.value = "";

    aiChatInput.style.height = "";

    aiChatSendButton.disabled =
        true;


    /* SAVE CONVERSATION */

    travelBuddyConversation.push({

        role:
            "user",

        text:
            cleanedMessage

    });


    if (
        travelBuddyConversation.length >
        12
    ) {

        travelBuddyConversation =
            travelBuddyConversation.slice(
                -12
            );

    }


    const typingMessage =
        showAiTyping();


    try {

        const response =
            await fetch(
                TRAVELBUDDY_API_URL,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            messages:
                                travelBuddyConversation,

                            destinationKnowledge:
                                buildTravelBuddyKnowledge()

                        })

                }
            );


        /*
           Handle non-JSON responses safely
        */

        const responseText =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(
                    responseText
                );

        } catch {

            throw new Error(
                `Worker returned an invalid response: ${responseText}`
            );

        }


        if (!response.ok) {

            throw new Error(
                data?.error
                ||
                `Request failed: ${response.status}`
            );

        }


        const reply =
            data?.reply
            ||
            "I couldn't generate a response.";


        typingMessage.remove();


        addAiChatMessage(
            reply,
            "bot"
        );


        travelBuddyConversation.push({

            role:
                "assistant",

            text:
                reply

        });


        if (
            travelBuddyConversation.length >
            12
        ) {

            travelBuddyConversation =
                travelBuddyConversation.slice(
                    -12
                );

        }


    } catch (error) {

        console.error(
            "TRAVELBUDDY AI ERROR:",
            error
        );


        typingMessage.remove();


        addAiChatMessage(
            "Sorry, I couldn't connect to TravelBuddy AI. Please try again.",
            "bot"
        );


    } finally {

        aiChatSendButton.disabled =
            false;


        aiChatInput?.focus();

    }

}


/* =========================================================
   OPEN / CLOSE CHATBOT
========================================================= */

travelBuddyAiButton?.addEventListener(
    "click",

    () => {

        const isOpen =
            !aiChat.hidden;


        aiChat.hidden =
            isOpen;


        if (!isOpen) {

            aiChatInput?.focus();

        }


        /*
           RESTORE ALL LUCIDE ICONS
        */

        if (window.lucide) {

            window.lucide.createIcons();

        }

    }
);


/* =========================================================
   CLOSE CHATBOT
========================================================= */

aiChatCloseButton?.addEventListener(
    "click",

    () => {

        aiChat.hidden =
            true;

    }
);


/* =========================================================
   SEND FORM
========================================================= */

aiChatForm?.addEventListener(
    "submit",

    async event => {

        event.preventDefault();


        await sendTravelBuddyMessage(
            aiChatInput.value
        );

    }
);


/* =========================================================
   QUICK PROMPTS
========================================================= */

document
    .querySelectorAll(
        "[data-ai-prompt]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",

            async () => {

                await sendTravelBuddyMessage(
                    button.dataset.aiPrompt
                );

            }
        );

    });


/* =========================================================
   AUTO GROW TEXTAREA
========================================================= */

aiChatInput?.addEventListener(
    "input",

    () => {

        aiChatInput.style.height =
            "auto";


        aiChatInput.style.height =
            `${Math.min(
                aiChatInput.scrollHeight,
                110
            )}px`;

    }
);


/* =========================================================
   ENTER TO SEND
========================================================= */

aiChatInput?.addEventListener(
    "keydown",

    event => {

        if (
            event.key === "Enter"
            &&
            !event.shiftKey
        ) {

            event.preventDefault();


            aiChatForm
                ?.requestSubmit();

        }

    }
);


/* =========================================================
   ENSURE ICONS ARE DRAWN
========================================================= */

if (window.lucide) {

    window.lucide.createIcons();

}

/* =========================================
   OPEN AUTH MODAL
========================================= */

function openAuthModal() {

    if (!authModal) {

        return;

    }


    authModal.hidden =
        false;


    accountMenu.hidden =
        true;


    document.body.style.overflow =
        "hidden";


    if (
        typeof lucide !==
        "undefined"
    ) {

        lucide.createIcons();

    }

}


/* =========================================
   CLOSE AUTH MODAL
========================================= */

function closeAuthModal() {

    if (!authModal) {

        return;

    }


    authModal.hidden =
        true;


    if (authMessage) {

        authMessage.hidden =
            true;


        authMessage.classList.remove(
            "error"
        );

    }


    document.body.style.overflow =
        "";

}


/* =========================================
   AUTH MESSAGE
========================================= */

function showAuthMessage(
    message,
    isError = false
) {

    if (!authMessage) {

        return;

    }


    authMessage.hidden =
        false;


    authMessage.textContent =
        message;


    authMessage.classList.toggle(
        "error",
        isError
    );

}


/* =========================================
   FIREBASE ERROR HANDLER
========================================= */

function handleFirebaseAuthError(
    error
) {

    console.error(
        "Firebase Authentication Error:",
        error
    );


    let message =
        "Something went wrong. Please try again.";


    switch (
    error.code
    ) {

        case "auth/email-already-in-use":

            message =
                "An account with this email already exists.";

            break;


        case "auth/invalid-email":

            message =
                "Please enter a valid email address.";

            break;


        case "auth/weak-password":

            message =
                "Please use a stronger password.";

            break;


        case "auth/invalid-credential":

            message =
                "Incorrect email or password.";

            break;


        case "auth/missing-password":

            message =
                "Please enter your password.";

            break;


        case "auth/popup-closed-by-user":

            message =
                "Google sign-in was cancelled.";

            break;


        case "auth/popup-blocked":

            message =
                "Your browser blocked the Google login popup.";

            break;


        case "auth/account-exists-with-different-credential":

            message =
                "An account already exists with this email using another login method.";

            break;


        case "auth/too-many-requests":

            message =
                "Too many attempts. Please try again later.";

            break;


        case "auth/network-request-failed":

            message =
                "Network error. Check your internet connection.";

            break;


        case "auth/operation-not-allowed":

            message =
                "This login method is not enabled in Firebase.";

            break;

    }


    showAuthMessage(
        message,
        true
    );

}


/* =========================================================
   HEADER ACCOUNT BUTTON
========================================================= */

authAvatarButton?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


        handleAccountAccess();

    }
);


/* =========================================================
   PROFILE NAVIGATION
========================================================= */

profileNavButton?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


        handleAccountAccess();

    }
);


/* =========================================================
   ACCOUNT MENU PROFILE BUTTON
========================================================= */

accountProfileButton?.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


        accountMenu.hidden =
            true;

    }
);


/* =========================================================
   SHOW SIGN IN
========================================================= */

function showSignIn() {

    signInTab?.classList.add(
        "active"
    );


    signUpTab?.classList.remove(
        "active"
    );


    if (signInForm) {

        signInForm.hidden =
            false;

    }


    if (signUpForm) {

        signUpForm.hidden =
            true;

    }


    if (authMessage) {

        authMessage.hidden =
            true;

    }

}


/* =========================================================
   SHOW SIGN UP
========================================================= */

function showSignUp() {

    signUpTab?.classList.add(
        "active"
    );


    signInTab?.classList.remove(
        "active"
    );


    if (signUpForm) {

        signUpForm.hidden =
            false;

    }


    if (signInForm) {

        signInForm.hidden =
            true;

    }


    if (authMessage) {

        authMessage.hidden =
            true;

    }

}


/* =========================================================
   AUTH TABS
========================================================= */

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


/* =========================================================
   EMAIL/PASSWORD SIGN UP
========================================================= */

signUpForm?.addEventListener(
    "submit",

    async event => {

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

            showAuthMessage(
                "Passwords do not match.",
                true
            );


            return;

        }


        try {

            showAuthMessage(
                "Creating your account..."
            );


            /*
              CREATE FIREBASE ACCOUNT
            */

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            /*
              SAVE FIRST + LAST NAME
            */

            await updateProfile(
                userCredential.user,
                {

                    displayName:
                        `${firstName} ${lastName}`.trim()

                }
            );


            /*
              FORCE AUTH USER RELOAD
              INTO UI
            */

            updateAuthUI(
                userCredential.user
            );


            signUpForm.reset();


            closeAuthModal();


        } catch (
        error
        ) {

            handleFirebaseAuthError(
                error
            );

        }

    }
);


/* =========================================================
   EMAIL/PASSWORD SIGN IN
========================================================= */

signInForm?.addEventListener(
    "submit",

    async event => {

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


        const rememberMe =
            document
                .getElementById(
                    "rememberMe"
                )
                ?.checked
            ??
            false;


        try {

            showAuthMessage(
                "Signing in..."
            );


            /*
              REMEMBER ME
            */

            await setPersistence(

                auth,

                rememberMe
                    ?
                    browserLocalPersistence
                    :
                    browserSessionPersistence

            );


            /*
              SIGN IN
            */

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            signInForm.reset();


            closeAuthModal();


        } catch (
        error
        ) {

            handleFirebaseAuthError(
                error
            );

        }

    }
);


/* =========================================================
   GOOGLE / GMAIL SIGN IN
========================================================= */

const googleProvider =
    new GoogleAuthProvider();


googleProvider.setCustomParameters({

    prompt:
        "select_account"

});


googleSignInButton?.addEventListener(
    "click",

    async () => {

        try {

            showAuthMessage(
                "Opening Google sign-in..."
            );


            /*
              GOOGLE LOGIN SHOULD
              REMAIN LOGGED IN
            */

            await setPersistence(
                auth,
                browserLocalPersistence
            );


            /*
              OPEN GOOGLE ACCOUNT PICKER
            */

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                );


            console.log(
                "Google account:",
                result.user.email
            );


            closeAuthModal();


        } catch (
        error
        ) {

            handleFirebaseAuthError(
                error
            );

        }

    }
);


/* =========================================================
   FORGOT PASSWORD
========================================================= */

forgotPasswordButton?.addEventListener(
    "click",

    async () => {

        const emailInput =
            document.getElementById(
                "signInEmail"
            );


        const email =
            emailInput
                ?.value
                .trim()
                .toLowerCase()
            ||
            "";


        if (!email) {

            showAuthMessage(
                "Enter your email address first.",
                true
            );


            emailInput?.focus();


            return;

        }


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            showAuthMessage(
                "Password reset email sent. Check your inbox."
            );


        } catch (
        error
        ) {

            handleFirebaseAuthError(
                error
            );

        }

    }
);


/* =========================================================
   LOG OUT
========================================================= */

logoutButton?.addEventListener(
    "click",

    async () => {

        try {

            await signOut(
                auth
            );


            accountMenu.hidden =
                true;


        } catch (
        error
        ) {

            console.error(
                "Firebase logout error:",
                error
            );

        }

    }
);


/* =========================================================
   CLOSE AUTH MODAL
========================================================= */

authCloseButton?.addEventListener(
    "click",
    closeAuthModal
);


authBackdrop?.addEventListener(
    "click",
    closeAuthModal
);


/* =========================================================
   CLOSE ACCOUNT MENU WHEN CLICKING OUTSIDE
========================================================= */

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
            &&
            !profileNavButton?.contains(
                event.target
            )
        ) {

            accountMenu.hidden =
                true;

        }

    }
);


/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

document
    .querySelectorAll(
        ".auth-password-toggle"
    )
    .forEach(
        button => {

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


                    const showingPassword =
                        input.type ===
                        "text";


                    input.type =
                        showingPassword
                            ?
                            "password"
                            :
                            "text";


                    button.setAttribute(
                        "aria-label",
                        showingPassword
                            ?
                            "Show password"
                            :
                            "Hide password"
                    );

                }
            );

        }
    );


/* =========================================================
   REAL-TIME FIREBASE AUTH STATE
========================================================= */

onAuthStateChanged(
    auth,

    user => {

        /*
          THIS RUNS WHEN:
          - PAGE LOADS
          - USER SIGNS IN
          - GOOGLE LOGIN SUCCEEDS
          - ACCOUNT IS CREATED
          - USER LOGS OUT
        */

        updateAuthUI(
            user
        );


        if (user) {

            console.log(
                "Firebase user logged in:",
                {
                    uid:
                        user.uid,

                    name:
                        user.displayName,

                    email:
                        user.email,

                    provider:
                        user.providerData[
                            0
                        ]?.providerId
                }
            );

        } else {

            console.log(
                "No Firebase user logged in."
            );

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

/* =========================================================
   GOOGLE MAPS MARKER ICON
========================================================= */

function createTravelMapIcon() {

    return {

        path:
            google.maps.SymbolPath.CIRCLE,

        scale:
            11,

        fillColor:
            "#00aeb3",

        fillOpacity:
            1,

        strokeColor:
            "#ffffff",

        strokeWeight:
            3

    };

}


/* =========================================================
   GOOGLE MAPS POPUP
========================================================= */

function createMapPopup(
    card
) {

    const placeId =
        card.dataset.id;


    const name =
        card.dataset.name
        ||
        "";


    const category =
        card.dataset.category
        ||
        "";


    const image =
        card.querySelector(
            ".card-photo img"
        )?.src
        ||
        "";


    const location =
        card.querySelector(
            ".place"
        )?.textContent
            .trim()
        ||
        "";


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


/* =========================================================
   INITIALIZE GOOGLE MAP
========================================================= */

async function initializeTravelMap() {

    /* =========================================
       WAIT FOR GOOGLE MAPS API
    ========================================= */

    if (
        window.googleMapsReady
    ) {

        await window.googleMapsReady;

    }


    /* =========================================
       CHECK GOOGLE MAPS
    ========================================= */

    if (
        !window.google
        ||
        !window.google.maps
    ) {

        console.error(
            "Google Maps JavaScript API failed to load."
        );

        return;

    }


    /* =========================================
       MAP ALREADY EXISTS
    ========================================= */

    if (
        travelMap
    ) {

        /*
           Google Maps automatically handles most
           resizing, but recentering ensures the
           hidden Map page renders correctly.
        */

        const currentCenter =
            travelMap.getCenter();


        if (
            currentCenter
        ) {

            travelMap.setCenter(
                currentCenter
            );

        }


        return;

    }


    const mapElement =
        document.getElementById(
            "travelMap"
        );


    if (
        !mapElement
    ) {

        return;

    }


    /* =========================================
       CREATE GOOGLE MAP
    ========================================= */

    travelMap =
        new google.maps.Map(
            mapElement,
            {

                center: {

                    lat:
                        11.7753,

                    lng:
                        124.8861

                },


                zoom:
                    9,


                minZoom:
                    8,


                /*
                   Allows users to zoom deeply
                   into roads and streets.
                */

                maxZoom:
                    21,


                mapTypeId:
                    google.maps.MapTypeId
                        .ROADMAP,


                /* =================================
                   GOOGLE STREET VIEW PEGMAN
                ================================= */

                streetViewControl:
                    true,


                streetViewControlOptions: {

                    position:
                        google.maps
                            .ControlPosition
                            .RIGHT_BOTTOM

                },


                /* =================================
                   GOOGLE MAP CONTROLS
                ================================= */

                zoomControl:
                    true,


                fullscreenControl:
                    true,


                /*
                   We already have our custom
                   Street / Satellite buttons.
                */

                mapTypeControl:
                    false,


                scaleControl:
                    true,


                gestureHandling:
                    "greedy",


                /* =================================
                   KEEP MAP AROUND SAMAR
                ================================= */

                restriction: {

                    latLngBounds:
                        SAMAR_BOUNDS,

                    strictBounds:
                        false

                }

            }
        );


    /* =========================================
       SHARED INFO WINDOW
    ========================================= */

    travelMapInfoWindow =
        new google.maps.InfoWindow({

            maxWidth:
                280

        });


    /* =========================================
       CLEAR OLD MARKERS
    ========================================= */

    travelMapMarkers =
        [];


    const markerBounds =
        new google.maps.LatLngBounds();


    /* =========================================
       CREATE DESTINATION MARKERS
    ========================================= */

    destinationCards.forEach(
        card => {

            const placeId =
                card.dataset.id;


            const coordinates =
                MAP_COORDINATES[
                placeId
                ];


            if (
                !coordinates
            ) {

                return;

            }


            const position = {

                lat:
                    coordinates.lat,

                lng:
                    coordinates.lng

            };


            /* =================================
               GOOGLE MAP MARKER
            ================================= */

            const marker =
                new google.maps.Marker({

                    position:
                        position,

                    map:
                        travelMap,

                    title:
                        card.dataset.name
                        ||
                        "",

                    icon:
                        createTravelMapIcon()

                });


            /* =================================
               OPEN DESTINATION POPUP
            ================================= */

            marker.addListener(
                "click",
                () => {

                    travelMapInfoWindow
                        .setContent(
                            createMapPopup(
                                card
                            )
                        );


                    travelMapInfoWindow
                        .open({

                            map:
                                travelMap,

                            anchor:
                                marker

                        });

                }
            );


            travelMapMarkers.push(
                marker
            );


            markerBounds.extend(
                position
            );

        }
    );


    /* =========================================
       SHOW ALL DESTINATIONS
    ========================================= */

    if (
        !markerBounds.isEmpty()
    ) {

        travelMap.fitBounds(
            markerBounds,
            45
        );


        /*
           Prevent fitBounds from zooming
           too close on initialization.
        */

        google.maps.event
            .addListenerOnce(
                travelMap,
                "idle",
                () => {

                    const currentZoom =
                        travelMap.getZoom();


                    if (
                        currentZoom
                        &&
                        currentZoom > 10
                    ) {

                        travelMap.setZoom(
                            10
                        );

                    }

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

/* =========================================================
   GOOGLE STREET / ROAD MAP
========================================================= */

streetMapButton?.addEventListener(
    "click",
    () => {

        if (
            !travelMap
        ) {

            return;

        }


        travelMap.setMapTypeId(
            google.maps.MapTypeId
                .ROADMAP
        );


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


/* =========================================================
   GOOGLE SATELLITE MAP
========================================================= */

satelliteMapButton?.addEventListener(
    "click",
    () => {

        if (
            !travelMap
        ) {

            return;

        }


        travelMap.setMapTypeId(
            google.maps.MapTypeId
                .SATELLITE
        );


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


    getDestinationCards()
        .forEach(card => {

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

/* =========================================================
   UPDATE SAVED COUNT
   REMOVE OLD / INVALID SAVED DESTINATIONS
========================================================= */

function updateSavedCount() {

    let savedPlaces =
        getSavedPlaces();


    /* =====================================================
       ONLY CLEAN AFTER FIRESTORE HAS FINISHED LOADING
    ===================================================== */

    if (
        realtimeDestinationsLoaded
    ) {

        const validDestinationIds =
            new Set(

                realtimeDestinations.map(
                    destination =>
                        destination.id
                )

            );


        const cleanedSavedPlaces =
            savedPlaces.filter(
                placeId =>
                    validDestinationIds.has(
                        placeId
                    )
            );


        /* =============================================
           OLD STATIC IDs FOUND
           SAVE THE CLEAN VERSION
        ============================================= */

        if (
            cleanedSavedPlaces.length !==
            savedPlaces.length
        ) {

            saveSavedPlaces(
                cleanedSavedPlaces
            );

        }


        savedPlaces =
            cleanedSavedPlaces;

    }


    const total =
        savedPlaces.length;


    /* =====================================================
       SAVED PAGE HEADER
    ===================================================== */

    if (
        savedCount
    ) {

        savedCount.textContent =
            `${total} saved`;

    }


    /* =====================================================
       BOTTOM NAV BADGE
    ===================================================== */

    if (
        savedNavCount
    ) {

        savedNavCount.textContent =
            total;


        savedNavCount.hidden =
            total === 0;

    }

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

/* =========================================================
   DYNAMIC FAVORITE BUTTONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const favoriteButton =
            event.target.closest(
                ".favorite-btn"
            );


        if (
            !favoriteButton
        ) {

            return;

        }


        event.stopPropagation();


        const card =
            favoriteButton.closest(
                ".destination-card"
            );


        if (
            !card
        ) {

            return;

        }


        toggleSavedPlace(
            card
        );


        /*
           If heart was clicked
           inside Saved page,
           immediately refresh Saved.
        */

        if (
            card.closest(
                "#savedGrid"
            )
        ) {

            renderSavedPlaces();

        }

    }
);

/* =========================================================
   RENDER SAVED PLACES
========================================================= */

function renderSavedPlaces() {

    let savedPlaces =
        getSavedPlaces();


    /* =====================================================
       REMOVE IDS THAT NO LONGER EXIST
    ===================================================== */

    if (
        realtimeDestinationsLoaded
    ) {

        const validIds =
            new Set(

                realtimeDestinations.map(
                    destination =>
                        destination.id
                )

            );


        savedPlaces =
            savedPlaces.filter(
                placeId =>
                    validIds.has(
                        placeId
                    )
            );


        saveSavedPlaces(
            savedPlaces
        );

    }


    savedGrid.innerHTML =
        "";


    savedPlaces.forEach(
        placeId => {

            const originalCard =
                document.querySelector(
                    `.featured-section .destination-card[data-id="${placeId}"]`
                );


            if (
                !originalCard
            ) {

                return;

            }


            const clonedCard =
                originalCard.cloneNode(
                    true
                );


            clonedCard.classList.remove(
                "hidden"
            );


            savedGrid.appendChild(
                clonedCard
            );

        }
    );


    /* =====================================================
       EMPTY STATE
    ===================================================== */

    const actuallyDisplayed =
        savedGrid.children.length;


    savedEmpty.hidden =
        actuallyDisplayed !==
        0;


    /* =====================================================
       COUNTERS
    ===================================================== */

    updateSavedCount();


    /* =====================================================
       FAVORITE STATES
    ===================================================== */

    updateFavoriteButtons();


    /* =====================================================
       ICONS
    ===================================================== */

    if (
        window.lucide
    ) {

        window.lucide.createIcons();

    }

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

/* =========================================================
   SHOW ALL GOOGLE MAP MARKERS
========================================================= */

mapShowAllButton?.addEventListener(
    "click",
    () => {

        if (
            !travelMap
        ) {

            return;

        }


        const bounds =
            new google.maps.LatLngBounds();


        travelMapMarkers
            .forEach(
                marker => {

                    const position =
                        marker.getPosition();


                    if (
                        position
                    ) {

                        bounds.extend(
                            position
                        );

                    }

                }
            );


        if (
            bounds.isEmpty()
        ) {

            travelMap.fitBounds(
                SAMAR_BOUNDS,
                20
            );


            return;

        }


        travelMap.fitBounds(
            bounds,
            45
        );


        google.maps.event
            .addListenerOnce(
                travelMap,
                "idle",
                () => {

                    const zoom =
                        travelMap.getZoom();


                    if (
                        zoom
                        &&
                        zoom > 10
                    ) {

                        travelMap.setZoom(
                            10
                        );

                    }

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
updateSavedCount();

/* =========================================================
   GOOGLE MAPS RESPONSIVE RESIZE FIX
========================================================= */

let googleMapResizeTimer =
    null;


function refreshGoogleMapLayout() {

    if (
        !travelMap
        ||
        !window.google
        ||
        !window.google.maps
    ) {

        return;

    }


    const currentCenter =
        travelMap.getCenter();


    /*
       Google Maps handles responsive resizing itself.

       Re-setting the current center ensures the map
       remains positioned correctly after mobile
       viewport changes.
    */

    if (
        currentCenter
    ) {

        travelMap.setCenter(
            currentCenter
        );

    }

}


/* =========================================================
   WINDOW RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        if (
            !travelMap
            ||
            !page?.classList.contains(
                "map-mode"
            )
        ) {

            return;

        }


        clearTimeout(
            googleMapResizeTimer
        );


        googleMapResizeTimer =
            setTimeout(
                () => {

                    refreshGoogleMapLayout();

                },
                180
            );

    }
);


/* =========================================================
   PHONE ORIENTATION
========================================================= */

window.addEventListener(
    "orientationchange",
    () => {

        if (
            !travelMap
        ) {

            return;

        }


        clearTimeout(
            googleMapResizeTimer
        );


        googleMapResizeTimer =
            setTimeout(
                () => {

                    refreshGoogleMapLayout();

                },
                400
            );

    }
);
