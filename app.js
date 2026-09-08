
import { auth, db } from "./firebase-config.js";
import { collection, query, where, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
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


const travelerNotificationButton = document.getElementById("travelerNotificationButton");
const travelerNotificationCount = document.getElementById("travelerNotificationCount");
const travelerNotificationPanel = document.getElementById("travelerNotificationPanel");
const travelerNotificationList = document.getElementById("travelerNotificationList");
const markTravelerNotificationsRead = document.getElementById("markTravelerNotificationsRead");
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

let cloudSavedPlaceIds =
    [];


let savedPlacesUnsubscribe =
    null;


let savedPlacesLoaded =
    false;


let activeComments =
    [];


let travelerNotifications =
    [];


let travelerReadNotificationIds =
    new Set();


let travelerNotificationsUnsubscribe =
    null;


let travelerNotificationReadsUnsubscribe =
    null;


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
   REALTIME TRAVELER NOTIFICATIONS
========================================================= */


/* =========================================================
   CONVERT FIRESTORE TIMESTAMP
========================================================= */

function notificationTimestampToMillis(
    timestamp
) {

    if (
        timestamp
        &&
        typeof timestamp.toMillis ===
        "function"
    ) {

        return timestamp.toMillis();

    }


    if (
        timestamp
        &&
        typeof timestamp.toDate ===
        "function"
    ) {

        return timestamp
            .toDate()
            .getTime();

    }


    return 0;

}


/* =========================================================
   RELATIVE TIME
========================================================= */

function formatTravelerNotificationTime(
    timestamp
) {

    const time =
        notificationTimestampToMillis(
            timestamp
        );


    if (
        !time
    ) {

        return "Just now";

    }


    const seconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    time
                )
                /
                1000
            )
        );


    if (
        seconds <
        60
    ) {

        return "Just now";

    }


    const minutes =
        Math.floor(
            seconds /
            60
        );


    if (
        minutes <
        60
    ) {

        return `${minutes}m ago`;

    }


    const hours =
        Math.floor(
            minutes /
            60
        );


    if (
        hours <
        24
    ) {

        return `${hours}h ago`;

    }


    const days =
        Math.floor(
            hours /
            24
        );


    if (
        days <
        7
    ) {

        return `${days}d ago`;

    }


    return new Date(
        time
    )
        .toLocaleDateString(
            "en-US",
            {
                month:
                    "short",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        );

}


/* =========================================================
   CREATE PERSONAL NOTIFICATION
========================================================= */

async function recordTravelerNotification({
    type,
    destinationId,
    destinationName,
    commentText = ""
}) {

    const user =
        auth.currentUser;


    if (
        !user
        ||
        !destinationId
    ) {

        return;

    }


    await addDoc(

        collection(
            db,
            "travelerNotifications"
        ),

        {

            userId:
                user.uid,

            type:
                type,

            destinationId:
                destinationId,

            destinationName:
                destinationName
                ||
                "Destination",

            commentText:
                commentText,

            unread:
                true,

            createdAt:
                serverTimestamp()

        }

    );

}


/* =========================================================
   NEW PLACES FROM REALTIME DESTINATIONS

   These are GLOBAL notifications.
   No extra DOT collection is required.
========================================================= */

function getNewPlaceNotifications() {

    /*
       Only use fairly recent destinations so an old
       database does not fill the notification panel.
    */

    const notificationWindow =
        14 *
        24 *
        60 *
        60 *
        1000;


    const now =
        Date.now();


    return realtimeDestinations
        .map(
            destination => {

                const notificationId =
                    `new_place_${destination.id}`;


                const createdAt =
                    destination.publishedAt
                    ||
                    destination.createdAt
                    ||
                    destination.updatedAt
                    ||
                    null;


                const timestamp =
                    notificationTimestampToMillis(
                        createdAt
                    );


                return {

                    id:
                        notificationId,

                    source:
                        "global",

                    type:
                        "new_place",

                    destinationId:
                        destination.id,

                    destinationName:
                        destination.name
                        ||
                        "New destination",

                    createdAt:
                        createdAt,

                    timestamp:
                        timestamp,

                    unread:
                        !travelerReadNotificationIds
                            .has(
                                notificationId
                            )

                };

            }
        )
        .filter(
            notification => {

                /*
                   Keep timestamp-less records as well.
                   Otherwise keep only recent places.
                */

                if (
                    !notification.timestamp
                ) {

                    return true;

                }


                return (
                    now -
                    notification.timestamp
                ) <=
                    notificationWindow;

            }
        );

}


/* =========================================================
   COMBINE PERSONAL + NEW PLACE NOTIFICATIONS
========================================================= */

function getCombinedTravelerNotifications() {

    const personal =
        travelerNotifications
            .map(
                notification => ({

                    ...notification,

                    source:
                        "personal",

                    timestamp:
                        notificationTimestampToMillis(
                            notification.createdAt
                        )

                })
            );


    const newPlaces =
        getNewPlaceNotifications();


    return [
        ...personal,
        ...newPlaces
    ]
        .sort(
            (
                first,
                second
            ) => {

                return (
                    second.timestamp -
                    first.timestamp
                );

            }
        )
        .slice(
            0,
            20
        );

}


/* =========================================================
   NOTIFICATION MESSAGE
========================================================= */

function getTravelerNotificationMessage(
    notification
) {

    const destinationName =
        escapeHTML(
            notification.destinationName
            ||
            "destination"
        );


    switch (
    notification.type
    ) {

        case "saved":

            return `
                You saved
                <strong>${destinationName}</strong>.
            `;


        case "comment":

            return `
                You commented on
                <strong>${destinationName}</strong>.
            `;


        case "new_place":

            return `
                New destination posted:
                <strong>${destinationName}</strong>.
            `;


        default:

            return `
                Activity on
                <strong>${destinationName}</strong>.
            `;

    }

}


/* =========================================================
   NOTIFICATION ICON
========================================================= */

function getTravelerNotificationIcon(
    type
) {

    switch (
    type
    ) {

        case "saved":

            return "heart";


        case "comment":

            return "message-circle";


        case "new_place":

            return "map-pin-plus";


        default:

            return "bell";

    }

}


/* =========================================================
   RENDER NOTIFICATIONS
========================================================= */

function renderTravelerNotifications() {

    if (
        !travelerNotificationList
        ||
        !travelerNotificationCount
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

        travelerNotificationCount.hidden =
            true;


        travelerNotificationCount.textContent =
            "0";


        travelerNotificationList.innerHTML = `

            <div class="traveler-notification-empty">

                <i data-lucide="bell-off"></i>

                <p>
                    Sign in to view your notifications.
                </p>

            </div>

        `;


        window.lucide
            ?.createIcons();


        return;

    }


    const notifications =
        getCombinedTravelerNotifications();


    const unreadCount =
        notifications.filter(
            notification =>
                notification.unread ===
                true
        ).length;


    travelerNotificationCount.textContent =
        unreadCount >
            99

            ?

            "99+"

            :

            unreadCount;


    travelerNotificationCount.hidden =
        unreadCount ===
        0;


    /* =====================================================
       EMPTY
    ===================================================== */

    if (
        notifications.length ===
        0
    ) {

        travelerNotificationList.innerHTML = `

            <div class="traveler-notification-empty">

                <i data-lucide="bell"></i>

                <p>
                    No notifications yet.
                </p>

            </div>

        `;


        window.lucide
            ?.createIcons();


        return;

    }


    travelerNotificationList.innerHTML =

        notifications
            .map(
                notification => {

                    const icon =
                        getTravelerNotificationIcon(
                            notification.type
                        );


                    return `

                        <button
    type="button"
    class="
        traveler-notification-item
        ${notification.unread
                            ?
                            "unread"
                            :
                            ""
                        }
    "
    data-notification-source="${notification.source}"
    data-notification-id="${escapeHTML(notification.id)}"
    data-notification-type="${escapeHTML(notification.type)}"
    data-destination-id="${escapeHTML(notification.destinationId)}"
>

                            <div
                                class="
                                    traveler-notification-icon
                                    ${notification.type}
                                "
                            >

                                <i data-lucide="${icon}"></i>

                            </div>


                            <div
                                class="traveler-notification-content"
                            >

                                <p>

                                    ${getTravelerNotificationMessage(notification)}

                                </p>


                                <div
                                    class="traveler-notification-time"
                                >

                                    ${formatTravelerNotificationTime(
                            notification.createdAt
                        )
                        }

                                </div>

                            </div>


                            ${notification.unread

                            ?

                            `
                                        <span
                                            class="traveler-notification-unread-dot"
                                        ></span>
                                    `

                            :

                            ""
                        }

                        </button>

                    `;

                }
            )
            .join(
                ""
            );


    window.lucide
        ?.createIcons();

}


/* =========================================================
   STOP OLD ACCOUNT LISTENERS
========================================================= */

function stopTravelerNotificationListeners() {

    if (
        travelerNotificationsUnsubscribe
    ) {

        travelerNotificationsUnsubscribe();

        travelerNotificationsUnsubscribe =
            null;

    }


    if (
        travelerNotificationReadsUnsubscribe
    ) {

        travelerNotificationReadsUnsubscribe();

        travelerNotificationReadsUnsubscribe =
            null;

    }

}


/* =========================================================
   START CURRENT ACCOUNT LISTENERS
========================================================= */

function startTravelerNotificationListeners(
    user
) {

    stopTravelerNotificationListeners();


    travelerNotifications =
        [];


    travelerReadNotificationIds =
        new Set();


    if (
        !user
    ) {

        renderTravelerNotifications();

        return;

    }


    /* =====================================================
       PERSONAL SAVED / COMMENT NOTIFICATIONS
    ===================================================== */

    const personalQuery =
        query(

            collection(
                db,
                "travelerNotifications"
            ),

            where(
                "userId",
                "==",
                user.uid
            )

        );


    travelerNotificationsUnsubscribe =
        onSnapshot(

            personalQuery,

            snapshot => {

                travelerNotifications =
                    snapshot.docs.map(
                        documentSnapshot => ({

                            id:
                                documentSnapshot.id,

                            ...documentSnapshot.data()

                        })
                    );


                renderTravelerNotifications();

            },

            error => {

                console.error(
                    "TRAVELER NOTIFICATION ERROR:",
                    error
                );

            }

        );


    /* =====================================================
       READ RECEIPTS FOR GLOBAL NEW PLACE NOTIFICATIONS
    ===================================================== */

    const readsQuery =
        query(

            collection(
                db,
                "travelerNotificationReads"
            ),

            where(
                "userId",
                "==",
                user.uid
            )

        );


    travelerNotificationReadsUnsubscribe =
        onSnapshot(

            readsQuery,

            snapshot => {

                travelerReadNotificationIds =
                    new Set(

                        snapshot.docs
                            .map(
                                documentSnapshot =>
                                    documentSnapshot
                                        .data()
                                        .notificationId
                            )
                            .filter(
                                Boolean
                            )

                    );


                renderTravelerNotifications();

            },

            error => {

                console.error(
                    "NOTIFICATION READ LISTENER ERROR:",
                    error
                );

            }

        );

}


/* =========================================================
   MARK SINGLE NOTIFICATION READ
========================================================= */

async function markTravelerNotificationRead(
    source,
    notificationId
) {

    const user =
        auth.currentUser;


    if (
        !user
        ||
        !notificationId
    ) {

        return;

    }


    /* =====================================================
       PERSONAL NOTIFICATION
    ===================================================== */

    if (
        source ===
        "personal"
    ) {

        await updateDoc(

            doc(
                db,
                "travelerNotifications",
                notificationId
            ),

            {
                unread:
                    false
            }

        );


        return;

    }


    /* =====================================================
       GLOBAL NEW PLACE NOTIFICATION
    ===================================================== */

    await setDoc(

        doc(
            db,
            "travelerNotificationReads",
            `${user.uid}_${notificationId}`
        ),

        {

            userId:
                user.uid,

            notificationId:
                notificationId,

            readAt:
                serverTimestamp()

        },

        {
            merge:
                true
        }

    );

}


/* =========================================================
   MARK ALL READ
========================================================= */

async function markAllTravelerNotificationsRead() {

    const user =
        auth.currentUser;


    if (
        !user
    ) {

        return;

    }


    const notifications =
        getCombinedTravelerNotifications();


    const promises =
        [];


    notifications.forEach(
        notification => {

            if (
                !notification.unread
            ) {

                return;

            }


            promises.push(

                markTravelerNotificationRead(

                    notification.source,

                    notification.id

                )

            );

        }
    );


    try {

        await Promise.all(
            promises
        );

    } catch (
    error
    ) {

        console.error(
            "MARK NOTIFICATIONS READ ERROR:",
            error
        );

    }

}

/* =========================================================
   CREATE / REPLACE SAVED NOTIFICATION
   ONLY ONE PER USER + DESTINATION
========================================================= */

async function recordSavedNotification(
    destinationId,
    destinationName
) {

    const user =
        auth.currentUser;


    if (
        !user
        ||
        !destinationId
    ) {

        return;

    }


    const notificationId =
        `saved_${user.uid}_${destinationId}`;


    await setDoc(

        doc(
            db,
            "travelerNotifications",
            notificationId
        ),

        {

            userId:
                user.uid,

            type:
                "saved",

            destinationId:
                destinationId,

            destinationName:
                destinationName
                ||
                "Destination",

            unread:
                true,

            createdAt:
                serverTimestamp()

        }

    );

}


/* =========================================================
   REMOVE SAVED NOTIFICATIONS
   ALSO CLEANS OLD DUPLICATES
========================================================= */

async function removeSavedNotifications(
    destinationId
) {

    const user =
        auth.currentUser;


    if (
        !user
        ||
        !destinationId
    ) {

        return;

    }


    /*
       Find every old saved notification for this
       user + destination.

       This also removes duplicates that were
       created before this fix.
    */

    const matchingNotifications =
        travelerNotifications.filter(
            notification =>

                notification.type ===
                "saved"

                &&

                notification.destinationId ===
                destinationId

                &&

                notification.userId ===
                user.uid
        );


    const deletePromises =
        matchingNotifications.map(
            notification =>

                deleteDoc(

                    doc(
                        db,
                        "travelerNotifications",
                        notification.id
                    )

                )

        );


    /*
       Also delete the new deterministic document ID,
       even if it is not yet in the realtime array.
    */

    const deterministicId =
        `saved_${user.uid}_${destinationId}`;


    if (
        !matchingNotifications.some(
            notification =>
                notification.id ===
                deterministicId
        )
    ) {

        deletePromises.push(

            deleteDoc(

                doc(
                    db,
                    "travelerNotifications",
                    deterministicId
                )

            )

        );

    }


    await Promise.all(
        deletePromises
    );

}


/* =========================================================
   BELL OPEN / CLOSE
========================================================= */

travelerNotificationButton
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            if (
                !requireTravelerAccount(
                    "view your notifications"
                )
            ) {

                return;

            }


            const willOpen =
                travelerNotificationPanel.hidden;


            travelerNotificationPanel.hidden =
                !willOpen;


            travelerNotificationButton
                .setAttribute(

                    "aria-expanded",

                    String(
                        willOpen
                    )

                );


            if (
                willOpen
            ) {

                renderTravelerNotifications();

            }

        }
    );


/* =========================================================
   MARK ALL READ BUTTON
========================================================= */

markTravelerNotificationsRead
    ?.addEventListener(
        "click",
        async event => {

            event.stopPropagation();

            await markAllTravelerNotificationsRead();

        }
    );


/* =========================================================
   CLICK TRAVELER NOTIFICATION
========================================================= */

travelerNotificationList
    ?.addEventListener(
        "click",
        async event => {

            const item =
                event.target.closest(
                    ".traveler-notification-item"
                );


            if (
                !item
            ) {

                return;

            }


            const source =
                item.dataset
                    .notificationSource;


            const notificationId =
                item.dataset
                    .notificationId;


            const notificationType =
                item.dataset
                    .notificationType;


            const destinationId =
                item.dataset
                    .destinationId;


            /* =====================================================
               MARK AS READ
            ===================================================== */

            try {

                await markTravelerNotificationRead(

                    source,

                    notificationId

                );

            } catch (
            error
            ) {

                console.error(
                    "READ NOTIFICATION ERROR:",
                    error
                );

            }


            /* =====================================================
               CLOSE NOTIFICATION PANEL
            ===================================================== */

            travelerNotificationPanel.hidden =
                true;


            travelerNotificationButton
                ?.setAttribute(
                    "aria-expanded",
                    "false"
                );


            /* =====================================================
               SAVED NOTIFICATION
               GO TO SAVED PLACES
            ===================================================== */

            if (
                notificationType ===
                "saved"
            ) {

                /*
                   Use your existing Saved navigation.
                */

                savedNavButton
                    ?.click();


                /*
                   After Saved Places renders,
                   scroll to the exact saved destination.
                */

                requestAnimationFrame(
                    () => {

                        const savedCard =

                            Array
                                .from(
                                    document.querySelectorAll(
                                        "#savedGrid .destination-card"
                                    )
                                )
                                .find(
                                    card =>
                                        card.dataset.id ===
                                        destinationId
                                );


                        if (
                            savedCard
                        ) {

                            savedCard.scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "center"

                            });

                        }

                    }
                );


                return;

            }


            /* =====================================================
   NEW DESTINATION NOTIFICATION
   HOME -> FEATURED DESTINATION -> HIGHLIGHT CARD
===================================================== */

            if (
                notificationType ===
                "new_place"
            ) {

                /* GO BACK TO HOME FIRST */

                homeNavButton
                    ?.click();


                /* =========================================
                   FIND + SCROLL TO THE EXACT NEW PLACE
                ========================================= */

                const focusNewDestination =
                    () => {

                        const destinationCard =
                            Array
                                .from(
                                    document.querySelectorAll(
                                        ".featured-section .destination-card"
                                    )
                                )
                                .find(
                                    card =>
                                        card.dataset.id ===
                                        destinationId
                                );


                        if (
                            !destinationCard
                        ) {

                            return false;

                        }


                        /* REMOVE OLD HIGHLIGHT */

                        document
                            .querySelectorAll(
                                ".destination-card.notification-highlight"
                            )
                            .forEach(
                                card =>
                                    card.classList.remove(
                                        "notification-highlight"
                                    )
                            );


                        /* HIGHLIGHT THIS CARD */

                        destinationCard.classList.add(
                            "notification-highlight"
                        );


                        /* SCROLL DIRECTLY TO FEATURED CARD */

                        destinationCard.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "center",

                            inline:
                                "nearest"

                        });


                        /* REMOVE HIGHLIGHT AFTER A FEW SECONDS */

                        setTimeout(
                            () => {

                                destinationCard.classList.remove(
                                    "notification-highlight"
                                );

                            },
                            3500
                        );


                        return true;

                    };


                setTimeout(
                    () => {

                        if (
                            focusNewDestination()
                        ) {

                            return;

                        }


                        setTimeout(
                            focusNewDestination,
                            300
                        );

                    },
                    350
                );


                return;
            }


            if (
                notificationType ===
                "comment"
            ) {

                const card =
                    Array
                        .from(
                            document.querySelectorAll(
                                ".featured-section .destination-card"
                            )
                        )
                        .find(
                            destinationCard =>
                                destinationCard.dataset.id ===
                                destinationId
                        );


                if (
                    card
                ) {

                    openDestinationDetails(
                        card
                    );

                }


                return;

            }

        }
    );



/* =========================================================
   CLICK OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            travelerNotificationPanel?.hidden
        ) {

            return;

        }


        if (
            !event.target.closest(
                ".traveler-notification-wrap"
            )
        ) {

            travelerNotificationPanel.hidden =
                true;


            travelerNotificationButton
                ?.setAttribute(
                    "aria-expanded",
                    "false"
                );

        }

    }
);


/* =========================================================
/* =========================================================
   LIVE TRAVELER LOCATION
========================================================= */

const FALLBACK_TRAVELER_LOCATION = {

    lat:
        11.7753,

    lng:
        124.8861

};


let currentTravelerLocation =
    null;


let travelerLocationWatchId =
    null;


/* =========================================================
   CALCULATE DISTANCE BETWEEN TWO GPS POINTS
   HAVERSINE FORMULA
========================================================= */

function calculateDistanceKm(
    startLat,
    startLng,
    endLat,
    endLng
) {

    const latitude1 =
        Number(
            startLat
        );


    const longitude1 =
        Number(
            startLng
        );


    const latitude2 =
        Number(
            endLat
        );


    const longitude2 =
        Number(
            endLng
        );


    if (
        !Number.isFinite(
            latitude1
        )
        ||
        !Number.isFinite(
            longitude1
        )
        ||
        !Number.isFinite(
            latitude2
        )
        ||
        !Number.isFinite(
            longitude2
        )
    ) {

        return null;

    }


    const earthRadiusKm =
        6371;


    const toRadians =
        degrees =>
            degrees *
            Math.PI /
            180;


    const deltaLatitude =
        toRadians(
            latitude2 -
            latitude1
        );


    const deltaLongitude =
        toRadians(
            longitude2 -
            longitude1
        );


    const a =

        Math.sin(
            deltaLatitude / 2
        ) ** 2

        +

        Math.cos(
            toRadians(
                latitude1
            )
        )

        *

        Math.cos(
            toRadians(
                latitude2
            )
        )

        *

        Math.sin(
            deltaLongitude / 2
        ) ** 2;


    const c =
        2 *
        Math.atan2(

            Math.sqrt(
                a
            ),

            Math.sqrt(
                1 - a
            )

        );


    return earthRadiusKm *
        c;

}


/* =========================================================
   DISTANCE FROM CURRENT TRAVELER TO DESTINATION
========================================================= */

function calculateDistanceToDestination(
    destinationLat,
    destinationLng
) {

    /*
       If GPS permission has not been received yet,
       temporarily use Catbalogan as the fallback.
    */

    const travelerLocation =
        currentTravelerLocation
        ||
        FALLBACK_TRAVELER_LOCATION;


    return calculateDistanceKm(

        travelerLocation.lat,

        travelerLocation.lng,

        destinationLat,

        destinationLng

    );

}

/* =========================================================
   FORMAT DISTANCE LABEL
========================================================= */

function getDistanceLabel(
    distance
) {

    if (
        distance ===
        null
    ) {

        return "Location unavailable";

    }


    /* =====================================================
       REAL GPS IS AVAILABLE
    ===================================================== */

    if (
        currentTravelerLocation
    ) {

        return `${distance.toFixed(1)} km away`;

    }


    /* =====================================================
       GPS DENIED / UNAVAILABLE
       USING CATBALOGAN FALLBACK
    ===================================================== */

    return `${distance.toFixed(1)} km from Catbalogan`;

}

/* =========================================================
   UPDATE ALL VISIBLE DISTANCE LABELS
========================================================= */

function updateLiveDistanceLabels() {

    document
        .querySelectorAll(
            ".destination-card"
        )
        .forEach(
            card => {

                const latitude =
                    Number(
                        card.dataset.lat
                    );


                const longitude =
                    Number(
                        card.dataset.lng
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


                const distance =
                    calculateDistanceToDestination(
                        latitude,
                        longitude
                    );


                const distanceValue =
                    card.querySelector(
                        ".distance-value"
                    );


                if (
                    !distanceValue
                ) {

                    return;

                }


                distanceValue.textContent =
                    getDistanceLabel(
                        distance
                    );

            }
        );

}


/* =========================================================
   START LIVE DEVICE LOCATION
========================================================= */

function startLiveLocationTracking() {

    /* =========================================
       CHECK BROWSER SUPPORT
    ========================================= */

    if (
        !("geolocation" in navigator)
    ) {

        console.warn(
            "Geolocation is not supported by this browser."
        );


        return;

    }


    /* =========================================
       DO NOT CREATE MULTIPLE GPS WATCHERS
    ========================================= */

    if (
        travelerLocationWatchId !==
        null
    ) {

        return;

    }


    travelerLocationWatchId =
        navigator.geolocation
            .watchPosition(

                position => {

                    const latitude =
                        Number(
                            position.coords
                                .latitude
                        );


                    const longitude =
                        Number(
                            position.coords
                                .longitude
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


                    /* =================================
                       SAVE CURRENT LIVE POSITION
                    ================================= */

                    currentTravelerLocation = {

                        lat:
                            latitude,

                        lng:
                            longitude,

                        accuracy:
                            position.coords
                                .accuracy

                    };


                    console.log(

                        "Traveler live location:",

                        currentTravelerLocation

                    );


                    /* =================================
                       UPDATE ALL DISTANCES
                    ================================= */

                    updateLiveDistanceLabels();

                },


                error => {

                    /*
                       Keep using the Catbalogan fallback
                       instead of breaking the app.
                    */

                    switch (
                    error.code
                    ) {

                        case error.PERMISSION_DENIED:

                            console.warn(
                                "Location permission was denied."
                            );

                            break;


                        case error.POSITION_UNAVAILABLE:

                            console.warn(
                                "Current location is unavailable."
                            );

                            break;


                        case error.TIMEOUT:

                            console.warn(
                                "Location request timed out."
                            );

                            break;


                        default:

                            console.warn(
                                "Unable to get traveler location:",
                                error
                            );

                    }


                    currentTravelerLocation =
                        null;


                    updateLiveDistanceLabels();

                },


                {
                    enableHighAccuracy:
                        true,

                    timeout:
                        15000,

                    maximumAge:
                        10000
                }

            );

}


/* =========================================================
   STOP GPS WHEN PAGE CLOSES
========================================================= */

window.addEventListener(
    "pagehide",
    () => {

        if (
            travelerLocationWatchId !==
            null
        ) {

            navigator.geolocation
                .clearWatch(
                    travelerLocationWatchId
                );


            travelerLocationWatchId =
                null;

        }

    }
);


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
        calculateDistanceToDestination(
            destination.lat,
            destination.lng
        );


    const distanceText =
        getDistanceLabel(
            distance
        );


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

    <span class="distance-value">
        ${distanceText}
    </span>

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
                        Number(
                            first.clientCreatedAt
                        )
                        ||
                        0;


                    const secondTime =
                        second.createdAt
                            ?.toMillis?.()
                        ||
                        Number(
                            second.clientCreatedAt
                        )
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
            renderTravelerNotifications();

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

startLiveLocationTracking();

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


        avatar.innerHTML = `
        <img
        src="19.png"
        alt="TravelBuddy AI"
        class="ai-message-avatar-img"
        >
        `;


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

        <img
            src="19.png"
            alt="TravelBuddy AI"
            class="ai-message-avatar-img"
        >

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

/* =========================================================
   REQUIRE TRAVELER ACCOUNT
========================================================= */

function requireTravelerAccount(
    action = "use this feature"
) {

    const user =
        auth.currentUser;


    /* =========================================
       ALREADY SIGNED IN
    ========================================= */

    if (
        user
    ) {

        return true;

    }


    /* =========================================
       GUEST -> SHOW AUTH
    ========================================= */

    showSignIn();

    openAuthModal();


    showAuthMessage(
        `Sign in or create an account to ${action}.`
    );


    return false;

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

        startRealtimeSavedPlacesListener(
            user
        );

        startTravelerNotificationListeners(
            user
        );

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
                ? "#00aeb3"
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
   REFRESH GOOGLE MAP
   SHOW ONLY CURRENT USER'S SAVED PLACES
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


    /* =========================================
       REMOVE OLD MARKERS
    ========================================= */

    clearTravelMapMarkers();


    /* CLOSE OLD POPUP */

    travelMapInfoWindow
        ?.close();


    /* =========================================
       CURRENT USER'S SAVED DESTINATIONS
    ========================================= */

    const savedPlaces =
        getSavedPlaces();


    const savedPlaceIds =
        new Set(
            savedPlaces
        );


    const markerBounds =
        new google.maps.LatLngBounds();


    /* =========================================
       NO SAVED PLACES
    ========================================= */

    if (
        savedPlaceIds.size ===
        0
    ) {

        return;

    }


    /* =========================================
       ONLY LOOP THROUGH SAVED DESTINATIONS
    ========================================= */

    realtimeDestinations

        .filter(
            destination =>

                savedPlaceIds.has(
                    destination.id
                )
        )

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


                const position = {

                    lat:
                        latitude,

                    lng:
                        longitude

                };


                /* =========================================
                   CREATE SAVED-PLACE MARKER
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

                        /*
                           TRUE = SAVED MARKER STYLE
                        */

                        icon:
                            createTravelMapIcon(
                                true
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


                /* =========================================
                   STORE MARKER
                ========================================= */

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


    /* =========================================
       FIT MAP AROUND SAVED PLACES
    ========================================= */

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
   CLOUD SAVED PLACES
========================================================= */

function getSavedPlaces() {

    return [
        ...cloudSavedPlaceIds
    ];

}


/* =========================================================
   MIGRATE OLD LOCAL SAVED PLACES ONCE

   This preserves favorites that existed before
   switching to Firestore.
========================================================= */

async function migrateOldSavedPlacesToFirestore(
    user
) {

    if (
        !user
    ) {

        return;

    }


    const oldStorageKey =
        `${SAVED_STORAGE_KEY}_${user.uid}`;


    const migrationKey =
        `${SAVED_STORAGE_KEY}_cloudMigrated_${user.uid}`;


    if (
        localStorage.getItem(
            migrationKey
        ) ===
        "1"
    ) {

        return;

    }


    let oldSavedPlaces =
        [];


    try {

        oldSavedPlaces =
            JSON.parse(

                localStorage.getItem(
                    oldStorageKey
                )

            ) || [];

    } catch (
    error
    ) {

        console.warn(
            "OLD SAVED MIGRATION READ ERROR:",
            error
        );

    }


    if (
        oldSavedPlaces.length >
        0
    ) {

        await Promise.all(

            oldSavedPlaces.map(
                placeId =>

                    setDoc(

                        doc(
                            db,
                            "users",
                            user.uid,
                            "savedPlaces",
                            placeId
                        ),

                        {
                            destinationId:
                                placeId,

                            savedAt:
                                serverTimestamp()
                        },

                        {
                            merge:
                                true
                        }

                    )

            )

        );

    }


    localStorage.removeItem(
        oldStorageKey
    );


    localStorage.setItem(
        migrationKey,
        "1"
    );

}


/* =========================================================
   START REALTIME SAVED PLACES LISTENER
========================================================= */

async function startRealtimeSavedPlacesListener(
    user
) {

    /* =========================================
       STOP PREVIOUS ACCOUNT LISTENER
    ========================================= */

    if (
        savedPlacesUnsubscribe
    ) {

        savedPlacesUnsubscribe();

        savedPlacesUnsubscribe =
            null;

    }


    cloudSavedPlaceIds =
        [];


    savedPlacesLoaded =
        false;


    updateFavoriteButtons();

    updateSavedCount();


    if (
        !user
    ) {

        if (
            page?.classList.contains(
                "saved-mode"
            )
        ) {

            renderSavedPlaces();

        }


        return;

    }


    /* =========================================
       MIGRATE OLD DEVICE DATA
    ========================================= */

    try {

        await migrateOldSavedPlacesToFirestore(
            user
        );

    } catch (
    error
    ) {

        console.error(
            "SAVED MIGRATION ERROR:",
            error
        );

    }


    /* =========================================
       FIRESTORE REALTIME LISTENER
    ========================================= */

    const savedCollection =
        collection(
            db,
            "users",
            user.uid,
            "savedPlaces"
        );


    savedPlacesUnsubscribe =
        onSnapshot(

            savedCollection,

            snapshot => {

                cloudSavedPlaceIds =
                    snapshot.docs.map(
                        documentSnapshot =>
                            documentSnapshot.id
                    );


                savedPlacesLoaded =
                    true;


                console.log(
                    "Realtime saved places:",
                    cloudSavedPlaceIds
                );


                /* =================================
                   UPDATE HEARTS
                ================================= */

                updateFavoriteButtons();


                /* =================================
                   UPDATE COUNT
                ================================= */

                updateSavedCount();


                /* =================================
                   UPDATE SAVED PAGE
                ================================= */

                if (
                    page?.classList.contains(
                        "saved-mode"
                    )
                ) {

                    renderSavedPlaces();

                }


                /* =================================
                   UPDATE MAP SAVED MARKERS
                ================================= */

                if (
                    travelMap
                ) {

                    refreshTravelMapMarkers(
                        false
                    );

                }

            },

            error => {

                console.error(
                    "SAVED PLACES LISTENER ERROR:",
                    error
                );

            }

        );

}

/* =========================================================
   UPDATE SAVED COUNT
========================================================= */

function updateSavedCount() {

    let savedPlaces =
        getSavedPlaces();


    /* =====================================================
       ONLY COUNT CURRENTLY PUBLISHED DESTINATIONS
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

    }


    const total =
        savedPlaces.length;


    if (
        savedCount
    ) {

        savedCount.textContent =
            `${total} saved`;

    }


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
   SAVE / UNSAVE DESTINATION — FIRESTORE
========================================================= */

async function toggleSavedPlace(
    card
) {

    if (
        !card
    ) {

        return;

    }


    if (
        !requireTravelerAccount(
            "save destinations"
        )
    ) {

        return;

    }


    const user =
        auth.currentUser;


    const placeId =
        card.dataset.id;


    if (
        !placeId
    ) {

        return;

    }


    const savedPlaces =
        getSavedPlaces();


    const isAlreadySaved =
        savedPlaces.includes(
            placeId
        );


    const destinationName =
        card.dataset.name
        ||
        card.querySelector(
            "h4"
        )
            ?.textContent
            .trim()
        ||
        "Destination";


    const savedDocument =
        doc(
            db,
            "users",
            user.uid,
            "savedPlaces",
            placeId
        );


    try {

        /* =================================================
           UNSAVE
        ================================================= */

        if (
            isAlreadySaved
        ) {

            await deleteDoc(
                savedDocument
            );


            /*
               Remove its corresponding saved notification
               on every device too.
            */

            await removeSavedNotifications(
                placeId
            );

        }


        /* =================================================
           SAVE
        ================================================= */

        else {

            await setDoc(

                savedDocument,

                {
                    destinationId:
                        placeId,

                    destinationName:
                        destinationName,

                    savedAt:
                        serverTimestamp()
                }

            );


            await recordSavedNotification(

                placeId,

                destinationName

            );

        }


        /*
           DO NOT manually change cloudSavedPlaceIds here.

           Firestore onSnapshot() will receive the
           change on every device.
        */


    } catch (
    error
    ) {

        console.error(
            "SAVE PLACE FIRESTORE ERROR:",
            error
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

        if (
            !requireTravelerAccount(
                "view your saved places"
            )
        ) {

            return;

        }

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


                /* =========================================
                   ACCOUNT REQUIRED
                ========================================= */

                if (
                    !requireTravelerAccount(
                        "rate this destination"
                    )
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
            `<i data-lucide="lock-keyhole"></i>`;


        commentInput.value =
            "";


        commentInput.readOnly =
            true;


        commentInput.placeholder =
            "Sign in or create an account to comment...";


        commentSubmitButton
            ?.setAttribute(
                "aria-label",
                "Sign in to comment"
            );


        window.lucide
            ?.createIcons();


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

    commentInput.readOnly =
        false;


    commentSubmitButton
        ?.setAttribute(
            "aria-label",
            "Post comment"
        );

    commentInput.placeholder =
        "Write a comment...";

}

/* =========================================================
   GUEST COMMENT BOX
========================================================= */

commentInput
    ?.addEventListener(
        "pointerdown",
        event => {

            if (
                auth.currentUser
            ) {

                return;

            }


            event.preventDefault();


            requireTravelerAccount(
                "write a comment"
            );

        }
    );


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


    if (
        !requireTravelerAccount(
            "post a comment"
        )
    ) {

        return;

    }


    const user =
        auth.currentUser;


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


                /* IMMEDIATE CLIENT TIMESTAMP */

                clientCreatedAt:
                    Date.now(),


                /* AUTHORITATIVE FIRESTORE TIMESTAMP */

                createdAt:
                    serverTimestamp()

            }

        );

        /* =========================================================
   REALTIME COMMENT NOTIFICATION
========================================================= */

        const commentedDestination =
            realtimeDestinations.find(
                destination =>
                    destination.id ===
                    activeDetailsPlaceId
            );


        const commentedDestinationName =
            commentedDestination?.name
            ||
            detailsTitle?.textContent
                ?.trim()
            ||
            "Destination";


        recordTravelerNotification({

            type:
                "comment",

            destinationId:
                activeDetailsPlaceId,

            destinationName:
                commentedDestinationName,

            commentText:
                text

        }).catch(
            error => {

                console.error(
                    "COMMENT NOTIFICATION ERROR:",
                    error
                );

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

    recordDestinationUniqueView(
        placeId
    );

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
   RECORD UNIQUE DESTINATION VIEW

   ONE FIREBASE USER = ONE VIEW PER DESTINATION
========================================================= */

async function recordDestinationUniqueView(
    destinationId
) {

    const user =
        auth.currentUser;


    /*
       Guests can still browse View Details,
       but they are not counted because they
       don't have a Firebase UID.
    */

    if (
        !user
        ||
        !destinationId
    ) {

        return;

    }


    /*
       Example document ID:

       abcDestination_5Yh38FirebaseUID

       Same user opening the same place again
       writes to the SAME document.
    */

    const viewId =
        `${destinationId}_${user.uid}`;


    try {

        await setDoc(

            doc(
                db,
                "destinationViews",
                viewId
            ),

            {
                destinationId:
                    destinationId,

                userId:
                    user.uid,

                userName:
                    user.displayName
                    ||
                    user.email
                        ?.split("@")[0]
                    ||
                    "Traveler",

                userEmail:
                    user.email
                    ||
                    "",

                userPhoto:
                    user.photoURL
                    ||
                    "",

                viewedAt:
                    serverTimestamp()
            },

            {
                merge:
                    true
            }

        );


        console.log(
            "Unique destination view recorded:",
            destinationId
        );


    } catch (
    error
    ) {

        console.error(
            "DESTINATION VIEW ERROR:",
            error
        );

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
