
import { auth, db } from "./firebase-config.js";
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
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
let travelMapInfoWindow = null;
const travelMapMarkerById = new Map();

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

let realtimeRatings =
    [];


let activeComments =
    [];


let activeCommentsUnsubscribe =
    null;


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
   GENERAL HTML ESCAPE
   USED BY COMMENTS + PROFILE PHOTOS
========================================================= */

function escapeHTML(
    value
) {

    return escapeDestinationHTML(
        value
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


    /* =====================================================
   REALTIME COMMUNITY RATING
===================================================== */

    const ratingStats =
        getRatingStatsForPlace(
            destination.id
        );


    const oldRating =
        Number(
            destination.rating
            ||
            0
        );


    const ratingNumber =
        ratingStats.count >
            0

            ?

            ratingStats.average

            :

            oldRating;


    const rating =
        ratingNumber >
            0

            ?

            ratingNumber.toFixed(
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

        /* =========================================
   SWITCH SAVED PLACES TO THIS ACCOUNT
========================================= */

        updateFavoriteButtons();

        updateSavedCount();


        /* =========================================
           REFRESH SAVED PAGE
        ========================================= */

        if (
            page?.classList.contains(
                "saved-mode"
            )
        ) {

            renderSavedPlaces();

        }


        /* =========================================
           REFRESH SAVED MAP MARKERS
        ========================================= */

        if (
            travelMap
        ) {

            refreshTravelMapMarkers(
                false
            );

        }

        /* =========================================
   UPDATE OPEN DETAILS AUTH STATE
========================================= */

        if (
            activeDetailsPlaceId
        ) {

            renderYourRating();

            updateCommentComposerIdentity();

        }


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

/* =========================================================
   GOOGLE MAPS MARKER ICON

   TEAL = NORMAL
   RED  = SAVED
========================================================= */

function createTravelMapIcon(
    isSaved = false
) {

    return {

        path:
            google.maps.SymbolPath.CIRCLE,

        scale:
            isSaved
                ? 13
                : 11,

        fillColor:
            isSaved
                ? "#e53935"
                : "#00aeb3",

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
   CLEAR GOOGLE MAP MARKERS
========================================================= */

function clearTravelMapMarkers() {

    travelMapMarkers
        .forEach(
            marker => {

                marker.setMap(
                    null
                );

            }
        );


    travelMapMarkers =
        [];


    travelMapMarkerById
        .clear();

}


/* =========================================================
   REFRESH GOOGLE MAP MARKERS FROM FIRESTORE
========================================================= */

function refreshTravelMapMarkers(
    fitMarkers = false
) {

    if (
        !travelMap
        ||
        !window.google
        ||
        !window.google.maps
    ) {

        return;

    }


    clearTravelMapMarkers();


    const savedPlaces =
        getSavedPlaces();


    const markerBounds =
        new google.maps.LatLngBounds();


    realtimeDestinations
        .forEach(
            destination => {

                const latitude =
                    Number(
                        destination.lat
                    );


                const longitude =
                    Number(
                        destination.lng
                    );


                if (
                    !Number.isFinite(
                        latitude
                    )
                    ||
                    !Number.isFinite(
                        longitude
                    )
                ) {

                    return;

                }


                const placeId =
                    destination.id;


                const isSaved =
                    savedPlaces.includes(
                        placeId
                    );


                const position = {

                    lat:
                        latitude,

                    lng:
                        longitude

                };


                /* =========================================
                   CREATE MARKER
                ========================================= */

                const marker =
                    new google.maps.Marker({

                        position:
                            position,

                        map:
                            travelMap,

                        title:
                            destination.name
                            ||
                            "",

                        icon:
                            createTravelMapIcon(
                                isSaved
                            )

                    });


                /* =========================================
                   MARKER CLICK
                ========================================= */

                marker.addListener(
                    "click",
                    () => {

                        const card =
                            document.querySelector(
                                `.featured-section .destination-card[data-id="${placeId}"]`
                            );


                        if (
                            !card
                        ) {

                            return;

                        }


                        travelMapInfoWindow
                            ?.setContent(
                                createMapPopup(
                                    card
                                )
                            );


                        travelMapInfoWindow
                            ?.open({

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


                travelMapMarkerById.set(
                    placeId,
                    marker
                );


                markerBounds.extend(
                    position
                );

            }
        );


    /* =====================================================
       FIT MAP AROUND DESTINATIONS
    ===================================================== */

    if (
        fitMarkers
        &&
        !markerBounds.isEmpty()
    ) {

        travelMap.fitBounds(
            markerBounds,
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

}


/* =========================================================
   INITIALIZE GOOGLE MAP
========================================================= */

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

        const currentCenter =
            travelMap.getCenter();


        if (
            currentCenter
        ) {

            travelMap.setCenter(
                currentCenter
            );

        }


        /* =========================================
           REFRESH FIRESTORE MARKERS
        ========================================= */

        refreshTravelMapMarkers(
            false
        );


        return;

    }


    /* =========================================
       GET MAP ELEMENT
    ========================================= */

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


                maxZoom:
                    21,


                mapTypeId:
                    google.maps.MapTypeId
                        .ROADMAP,


                /* =================================
                   STREET VIEW PEGMAN
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


    /* =========================================================
       LOAD REALTIME FIRESTORE DESTINATION MARKERS
    ========================================================= */

    refreshTravelMapMarkers(
        true
    );

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

/* =========================================================
   SAVED PLACES — SEPARATE FOR EACH FIREBASE ACCOUNT
========================================================= */

function getSavedStorageKey() {

    const user =
        auth.currentUser;


    /* =========================================
       NO USER = NO ACCOUNT SAVED STORAGE
    ========================================= */

    if (
        !user
    ) {

        return null;

    }


    /*
       Example:

       travelBuddySavedPlaces_abcFirebaseUID123
    */

    return `${SAVED_STORAGE_KEY}_${user.uid}`;

}


/* =========================================================
   GET CURRENT USER'S SAVED PLACES
========================================================= */

function getSavedPlaces() {

    const storageKey =
        getSavedStorageKey();


    if (
        !storageKey
    ) {

        return [];

    }


    try {

        return JSON.parse(

            localStorage.getItem(
                storageKey
            )

        ) || [];

    } catch (
    error
    ) {

        console.error(
            "SAVED PLACES READ ERROR:",
            error
        );


        return [];

    }

}


/* =========================================================
   SAVE CURRENT USER'S SAVED PLACES
========================================================= */

function saveSavedPlaces(
    savedPlaces
) {

    const storageKey =
        getSavedStorageKey();


    if (
        !storageKey
    ) {

        return;

    }


    localStorage.setItem(

        storageKey,

        JSON.stringify(
            savedPlaces
        )

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

/* =========================================================
   SAVE / UNSAVE DESTINATION
========================================================= */

function toggleSavedPlace(
    card
) {

    if (
        !card
    ) {

        return;

    }


    /* =====================================================
       USER MUST BE LOGGED IN
    ===================================================== */

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        showSignIn();

        openAuthModal();

        return;

    }


    const placeId =
        card.dataset.id;


    if (
        !placeId
    ) {

        return;

    }


    let savedPlaces =
        getSavedPlaces();


    const isAlreadySaved =
        savedPlaces.includes(
            placeId
        );


    /* =====================================================
       REMOVE
    ===================================================== */

    if (
        isAlreadySaved
    ) {

        savedPlaces =
            savedPlaces.filter(
                id =>
                    id !==
                    placeId
            );

    }


    /* =====================================================
       ADD
    ===================================================== */

    else {

        savedPlaces.push(
            placeId
        );

    }


    saveSavedPlaces(
        savedPlaces
    );


    /* =====================================================
       UPDATE UI
    ===================================================== */

    updateFavoriteButtons();

    updateSavedCount();


    /* =====================================================
       UPDATE SAVED PAGE IF OPEN
    ===================================================== */

    if (
        page?.classList.contains(
            "saved-mode"
        )
    ) {

        renderSavedPlaces();

    }


    /* =====================================================
       UPDATE SAVED MAP MARKERS
    ===================================================== */

    if (
        travelMap
    ) {

        refreshTravelMapMarkers(
            false
        );

    }

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
/* =========================================================
   REALTIME FIRESTORE RATINGS
========================================================= */


/* =========================================================
   GET RATING STATISTICS
========================================================= */

function getRatingStatsForPlace(
    placeId
) {

    const ratings =
        realtimeRatings.filter(
            item =>
                item.destinationId ===
                placeId
        );


    if (
        ratings.length ===
        0
    ) {

        return {

            average:
                0,

            count:
                0

        };

    }


    const total =
        ratings.reduce(
            (
                sum,
                item
            ) => {

                const value =
                    Number(
                        item.rating
                    );


                return sum +
                    (
                        Number.isFinite(
                            value
                        )

                            ?

                            value

                            :

                            0
                    );

            },
            0
        );


    return {

        average:
            total /
            ratings.length,

        count:
            ratings.length

    };

}


/* =========================================================
   GET CURRENT USER'S RATING
========================================================= */

function getCurrentUserRating(
    placeId
) {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        return 0;

    }


    const rating =
        realtimeRatings.find(
            item =>
                item.destinationId ===
                placeId
                &&
                item.userId ===
                user.uid
        );


    return Number(
        rating?.rating
        ||
        0
    );

}


/* =========================================================
   UPDATE AVERAGE RATING IN DETAILS
========================================================= */

function renderActiveDestinationAverageRating() {

    if (
        !activeDetailsPlaceId
    ) {

        return;

    }


    const stats =
        getRatingStatsForPlace(
            activeDetailsPlaceId
        );


    detailsRating.textContent =
        stats.count >
            0

            ?

            stats.average.toFixed(
                1
            )

            :

            "New";

}


/* =========================================================
   SHOW CURRENT USER'S RATING
========================================================= */

function renderYourRating() {

    if (
        !activeDetailsPlaceId
    ) {

        return;

    }


    const user =
        auth.currentUser;


    if (
        !user
    ) {

        rateStars.forEach(
            star => {

                star.classList.remove(
                    "active"
                );

            }
        );


        yourRatingText.textContent =
            "Sign in to rate";


        return;

    }


    const rating =
        getCurrentUserRating(
            activeDetailsPlaceId
        );


    rateStars.forEach(
        star => {

            const starValue =
                Number(
                    star.dataset.rating
                );


            star.classList.toggle(

                "active",

                starValue <=
                rating

            );

        }
    );


    yourRatingText.textContent =
        rating >
            0

            ?

            `${rating}/5`

            :

            "Not rated";

}


/* =========================================================
   SAVE / UPDATE USER RATING
========================================================= */

async function saveRealtimeRating(
    placeId,
    rating
) {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        showSignIn();

        openAuthModal();

        return;

    }


    if (
        !placeId
        ||
        rating <
        1
        ||
        rating >
        5
    ) {

        return;

    }


    /*
       One document per user + destination.

       If the user changes 3 stars to 5 stars,
       the same document is updated instead
       of creating another rating.
    */

    const ratingId =
        `${placeId}_${user.uid}`;


    await setDoc(

        doc(
            db,
            "destinationRatings",
            ratingId
        ),

        {

            destinationId:
                placeId,

            userId:
                user.uid,

            userName:
                user.displayName
                ||
                user.email
                ||
                "Traveler",

            rating:
                rating,

            updatedAt:
                serverTimestamp()

        },

        {
            merge:
                true
        }

    );

}


/* =========================================================
   STAR CLICK
========================================================= */

rateStars.forEach(
    star => {

        star.addEventListener(
            "click",
            async () => {

                if (
                    !activeDetailsPlaceId
                ) {

                    return;

                }


                const rating =
                    Number(
                        star.dataset.rating
                    );


                try {

                    yourRatingText.textContent =
                        "Saving...";


                    await saveRealtimeRating(

                        activeDetailsPlaceId,

                        rating

                    );


                    /*
                       No manual rendering needed.
                       Firestore onSnapshot will update it.
                    */

                } catch (
                error
                ) {

                    console.error(
                        "RATING ERROR:",
                        error
                    );


                    yourRatingText.textContent =
                        "Unable to save";

                }

            }
        );

    }
);


/* =========================================================
   REALTIME RATINGS LISTENER
========================================================= */

function startRealtimeRatingsListener() {

    onSnapshot(

        collection(
            db,
            "destinationRatings"
        ),

        snapshot => {

            realtimeRatings =
                snapshot.docs.map(
                    documentSnapshot => ({

                        id:
                            documentSnapshot.id,

                        ...documentSnapshot.data()

                    })
                );


            /* =========================================
               UPDATE DESTINATION CARDS
            ========================================= */

            if (
                realtimeDestinationsLoaded
            ) {

                renderRealtimeDestinations();

            }


            /* =========================================
               UPDATE OPEN DETAILS WINDOW
            ========================================= */

            if (
                activeDetailsPlaceId
            ) {

                renderYourRating();

                renderActiveDestinationAverageRating();

            }

        },

        error => {

            console.error(
                "RATINGS LISTENER ERROR:",
                error
            );

        }

    );

}


/* =========================================================
   COMMENT HELPERS
========================================================= */

function getInitialsFromName(
    name
) {

    const cleaned =
        String(
            name
            ||
            "Traveler"
        )
            .trim();


    const parts =
        cleaned
            .split(
                /\s+/
            )
            .filter(
                Boolean
            );


    if (
        parts.length ===
        0
    ) {

        return "T";

    }


    if (
        parts.length ===
        1
    ) {

        return parts[0]
            .charAt(
                0
            )
            .toUpperCase();

    }


    return (

        parts[0]
            .charAt(
                0
            )

        +

        parts[
            parts.length -
            1
        ]
            .charAt(
                0
            )

    )
        .toUpperCase();

}


/* =========================================================
   COMMENT DATE
========================================================= */

function formatCommentDate(
    timestamp
) {

    if (
        !timestamp
        ||
        typeof timestamp.toDate !==
        "function"
    ) {

        return "Just now";

    }


    return timestamp
        .toDate()
        .toLocaleString(
            "en-US",
            {

                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric",

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }
        );

}


/* =========================================================
   UPDATE COMMENT COMPOSER USER
========================================================= */

/* =========================================================
   UPDATE COMMENT COMPOSER USER
   GOOGLE PHOTO + INITIALS FALLBACK
========================================================= */

function updateCommentComposerIdentity() {

    const composerAvatar =
        document.querySelector(
            ".comment-avatar"
        );


    if (
        !composerAvatar
    ) {

        return;

    }


    const user =
        auth.currentUser;


    /* =====================================================
       LOGGED OUT
    ===================================================== */

    if (
        !user
    ) {

        composerAvatar.innerHTML =
            "?";


        commentInput.placeholder =
            "Sign in to write a comment...";


        return;

    }


    const name =
        user.displayName
        ||
        user.email
        ||
        "Traveler";


    const profilePhoto =
        user.photoURL
        ||
        "";


    /* =====================================================
       GOOGLE / GMAIL PROFILE PHOTO
    ===================================================== */

    if (
        profilePhoto
    ) {

        composerAvatar.innerHTML = `

            <img
                src="${escapeHTML(profilePhoto)}"
                alt="${escapeHTML(name)}"
                referrerpolicy="no-referrer"
            >

        `;

    }


    /* =====================================================
       NO GOOGLE PHOTO -> INITIALS
    ===================================================== */

    else {

        composerAvatar.textContent =
            getInitialsFromName(
                name
            );

    }


    commentInput.placeholder =
        "Write a comment...";

}


/* =========================================================
   RENDER COMMENTS
========================================================= */

function renderComments() {

    if (
        !activeDetailsPlaceId
    ) {

        return;

    }


    commentsList.innerHTML =
        "";


    commentCount.textContent =
        `${activeComments.length} ${activeComments.length ===
            1

            ?

            "comment"

            :

            "comments"
        }`;


    if (
        activeComments.length ===
        0
    ) {

        commentsList.innerHTML = `

            <div
                style="
                    padding:22px 10px;
                    text-align:center;
                    color:#587087;
                    font-size:13px;
                "
            >

                No comments yet. Be the first to comment.

            </div>

        `;


        return;

    }


    activeComments.forEach(
        comment => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "comment-item";


            const author =
                comment.userName
                ||
                "Traveler";


            const initials =
                getInitialsFromName(
                    author
                );

            const profilePhoto =
                comment.userPhoto
                ||
                "";


            item.innerHTML = `

                <div
    class="comment-item-avatar"
>

    ${profilePhoto

                    ?

                    `
                <img
                    src="${escapeHTML(profilePhoto)}"
                    alt="${escapeHTML(author)}"
                    referrerpolicy="no-referrer"
                >
            `

                    :

                    escapeHTML(initials)
                }

</div>


                <div>

                    <div
                        class="comment-bubble"
                    >

                        <span
                            class="comment-author"
                        >

                            ${escapeHTML(author)}

                        </span>


                        <p
                            class="comment-text"
                        >

                            ${escapeHTML(
                    comment.text
                    ||
                    ""
                )}

                        </p>

                    </div>


                    <div
                        class="comment-meta"
                    >

                        ${escapeHTML(
                    formatCommentDate(
                        comment.createdAt
                    )
                )}

                    </div>

                </div>

            `;


            commentsList.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   REALTIME COMMENTS LISTENER
========================================================= */

function startRealtimeCommentsListener(
    placeId
) {

    /* =========================================
       STOP PREVIOUS DESTINATION LISTENER
    ========================================= */

    if (
        activeCommentsUnsubscribe
    ) {

        activeCommentsUnsubscribe();

        activeCommentsUnsubscribe =
            null;

    }


    activeComments =
        [];


    renderComments();


    const commentsQuery =
        query(

            collection(
                db,
                "destinationComments"
            ),

            where(
                "destinationId",
                "==",
                placeId
            )

        );


    activeCommentsUnsubscribe =
        onSnapshot(

            commentsQuery,

            snapshot => {

                /*
                   If the user changed destination
                   before this snapshot arrived,
                   ignore it.
                */

                if (
                    activeDetailsPlaceId !==
                    placeId
                ) {

                    return;

                }


                activeComments =
                    snapshot.docs
                        .map(
                            documentSnapshot => ({

                                id:
                                    documentSnapshot.id,

                                ...documentSnapshot.data()

                            })
                        );


                /* =========================================
                   NEWEST COMMENT FIRST
                ========================================= */

                activeComments.sort(
                    (
                        first,
                        second
                    ) => {

                        const firstTime =
                            first.createdAt
                                ?.toMillis?.()
                            ||
                            0;


                        const secondTime =
                            second.createdAt
                                ?.toMillis?.()
                            ||
                            0;


                        return (
                            secondTime -
                            firstTime
                        );

                    }
                );


                renderComments();

            },

            error => {

                console.error(
                    "COMMENTS LISTENER ERROR:",
                    error
                );

            }

        );

}


/* =========================================================
   SUBMIT COMMENT
========================================================= */

async function submitComment() {

    if (
        !activeDetailsPlaceId
    ) {

        return;

    }


    const user =
        auth.currentUser;


    if (
        !user
    ) {

        showSignIn();

        openAuthModal();

        return;

    }


    const text =
        commentInput.value
            .trim();


    if (
        !text
    ) {

        commentInput.focus();

        return;

    }


    try {

        commentSubmitButton.disabled =
            true;


        const userName =
            user.displayName
            ||
            user.email
                ?.split(
                    "@"
                )[0]
            ||
            "Traveler";


        await addDoc(

            collection(
                db,
                "destinationComments"
            ),

            {

                destinationId:
                    activeDetailsPlaceId,

                userId:
                    user.uid,

                userName:
                    userName,

                userPhoto:
                    user.photoURL
                    ||
                    "",

                text:
                    text,

                createdAt:
                    serverTimestamp()

            }

        );


        commentInput.value =
            "";


        commentInput.focus();


        /*
           Do NOT manually add the comment.

           onSnapshot() will receive it and
           render it automatically.
        */


    } catch (
    error
    ) {

        console.error(
            "COMMENT ERROR:",
            error
        );

    } finally {

        commentSubmitButton.disabled =
            false;

    }

}


/* =========================================================
   COMMENT POST BUTTON
========================================================= */

commentSubmitButton
    ?.addEventListener(
        "click",
        submitComment
    );


/* =========================================================
   CTRL + ENTER TO POST
========================================================= */

commentInput
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
                &&
                event.ctrlKey
            ) {

                event.preventDefault();

                submitComment();

            }

        }
    );


/* =========================================================
   START GLOBAL REALTIME RATINGS
========================================================= */

startRealtimeRatingsListener();

/* =========================================================
   OPEN DESTINATION DETAILS
========================================================= */

function openDestinationDetails(
    card
) {

    if (
        !card
    ) {

        return;

    }


    const placeId =
        card.dataset.id;


    const category =
        card.dataset.category
        ||
        "";


    const name =
        card.dataset.name
        ||
        "";


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


    if (
        !placeId
    ) {

        return;

    }


    /* =====================================================
       ACTIVE DESTINATION
    ===================================================== */

    activeDetailsPlaceId =
        placeId;


    /* =====================================================
       BASIC DESTINATION DETAILS
    ===================================================== */

    detailsImage.src =
        image?.src
        ||
        "";


    detailsImage.alt =
        name;


    detailsCategory.textContent =
        category;


    detailsTitle.textContent =
        name;


    detailsLocation.textContent =
        location
            ?.textContent
            .trim()
        ||
        "";


    detailsDescription.textContent =
        description
            ?.textContent
            .trim()
        ||
        "";


    detailsRating.textContent =
        rating
            ?.textContent
            .trim()
        ||
        "New";


    commentInput.value =
        "";


    /* =====================================================
       OPEN MODAL FIRST
    ===================================================== */

    detailsModal.hidden =
        false;


    document.body.classList.add(
        "details-modal-open"
    );


    /* =====================================================
       REALTIME RATINGS
    ===================================================== */

    try {

        renderYourRating();

        renderActiveDestinationAverageRating();

    } catch (
    error
    ) {

        console.error(
            "DETAILS RATING ERROR:",
            error
        );

    }


    /* =====================================================
       COMMENT PROFILE
    ===================================================== */

    try {

        updateCommentComposerIdentity();

    } catch (
    error
    ) {

        console.error(
            "COMMENT PROFILE ERROR:",
            error
        );

    }


    /* =====================================================
       REALTIME COMMENTS
    ===================================================== */

    try {

        startRealtimeCommentsListener(
            placeId
        );

    } catch (
    error
    ) {

        console.error(
            "COMMENTS START ERROR:",
            error
        );

    }


    /* =====================================================
       RESTORE ICONS
    ===================================================== */

    if (
        window.lucide
    ) {

        window.lucide.createIcons();

    }

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

/* =========================================================
   MAP POPUP -> VIEW DETAILS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const mapDetailsButton =
            event.target.closest(
                "[data-map-place-id]"
            );


        if (
            !mapDetailsButton
        ) {

            return;

        }


        event.preventDefault();

        event.stopPropagation();


        const placeId =
            mapDetailsButton.dataset
                .mapPlaceId;


        if (
            !placeId
        ) {

            return;

        }


        /* =====================================================
           FIND THE REALTIME DESTINATION CARD
        ===================================================== */

        const card =
            document.querySelector(
                `.featured-section .destination-card[data-id="${placeId}"]`
            );


        if (
            !card
        ) {

            console.warn(
                "Destination card not found:",
                placeId
            );

            return;

        }


        /* =====================================================
           CLOSE GOOGLE MAP INFO WINDOW
        ===================================================== */

        travelMapInfoWindow
            ?.close();


        /* =====================================================
           OPEN EXISTING VIEW DETAILS MODAL
        ===================================================== */

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


    /* =====================================================
       STOP REALTIME COMMENTS LISTENER
    ===================================================== */

    if (
        activeCommentsUnsubscribe
    ) {

        activeCommentsUnsubscribe();

        activeCommentsUnsubscribe =
            null;

    }


    activeComments =
        [];


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
