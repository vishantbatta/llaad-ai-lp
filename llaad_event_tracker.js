// LLaad Event Tracker
// A JavaScript library for tracking events and sending them to Appwrite

(function(global) {
    'use strict';

    // Configuration
    const CONFIG = {
        endpoint: 'https://fra.cloud.appwrite.io/v1',
        projectId: '685647c2002af9f4d81d',
        databaseId: '685647e10001f9b49876',
        collectionId: '6856480600341ef07d01',
        attributeName: 'event_name'
    };

    // Appwrite SDK - We'll load it dynamically
    let appwriteClient = null;
    let appwriteDatabases = null;
    let appwriteID = null;

    // Event queue for events sent before Appwrite is loaded
    let eventQueue = [];
    let isAppwriteLoaded = false;

    // Load Appwrite SDK dynamically
    function loadAppwriteSDK() {
        return new Promise((resolve, reject) => {
            if (window.Appwrite) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/appwrite@15.0.0/dist/sdk.umd.js';
            script.onload = () => {
                if (window.Appwrite) {
                    resolve();
                } else {
                    reject(new Error('Appwrite SDK failed to load'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load Appwrite SDK'));
            document.head.appendChild(script);
        });
    }

    // Initialize Appwrite client
    function initializeAppwrite() {
        try {
            const { Client, Databases, ID } = window.Appwrite;
            
            appwriteClient = new Client()
                .setEndpoint(CONFIG.endpoint)
                .setProject(CONFIG.projectId);
            
            appwriteDatabases = new Databases(appwriteClient);
            appwriteID = ID;
            
            isAppwriteLoaded = true;
            console.log('LLaad Event Tracker: Appwrite initialized successfully');
            
            // Process any queued events
            processEventQueue();
            
        } catch (error) {
            console.error('LLaad Event Tracker: Failed to initialize Appwrite:', error);
        }
    }

    // Process events that were queued before Appwrite was loaded
    function processEventQueue() {
        while (eventQueue.length > 0) {
            const eventName = eventQueue.shift();
            sendEventToAppwrite(eventName);
        }
    }

    // Send event to Appwrite
    function sendEventToAppwrite(eventName) {
        if (!isAppwriteLoaded) {
            console.log(`LLaad Event Tracker: Queueing event "${eventName}" - Appwrite not ready`);
            eventQueue.push(eventName);
            return;
        }

        const documentData = {
            [CONFIG.attributeName]: eventName,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href
        };

        console.log(`LLaad Event Tracker: Sending event "${eventName}"`);

        const promise = appwriteDatabases.createDocument(
            CONFIG.databaseId,
            CONFIG.collectionId,
            appwriteID.unique(),
            documentData
        );

        promise.then(function(response) {
            console.log(`LLaad Event Tracker: Event "${eventName}" sent successfully:`, response);
        }).catch(function(error) {
            console.error(`LLaad Event Tracker: Failed to send event "${eventName}":`, error);
            
            // Optionally retry logic could be added here
            // For now, we'll just log the error
        });
    }

    // Validate event name
    function isValidEventName(eventName) {
        return typeof eventName === 'string' && eventName.trim().length > 0;
    }

    // Main LLaad object
    const LLaad = {
        // Send event method
        send_event: function(eventName) {
            if (!isValidEventName(eventName)) {
                console.error('LLaad Event Tracker: Invalid event name. Event name must be a non-empty string.');
                return;
            }

            eventName = eventName.trim();
            console.log(`LLaad Event Tracker: Received event "${eventName}"`);
            
            sendEventToAppwrite(eventName);
        },

        // Get configuration (for debugging)
        getConfig: function() {
            return { ...CONFIG };
        },

        // Get status
        getStatus: function() {
            return {
                isAppwriteLoaded: isAppwriteLoaded,
                queuedEvents: eventQueue.length,
                sdkLoaded: !!window.Appwrite
            };
        },

        // Manual initialization (in case auto-init fails)
        init: function() {
            if (isAppwriteLoaded) {
                console.log('LLaad Event Tracker: Already initialized');
                return;
            }
            
            loadAppwriteSDK()
                .then(initializeAppwrite)
                .catch(error => {
                    console.error('LLaad Event Tracker: Initialization failed:', error);
                });
        }
    };

    // Auto-initialize when DOM is ready
    function autoInit() {
        loadAppwriteSDK()
            .then(initializeAppwrite)
            .catch(error => {
                console.error('LLaad Event Tracker: Auto-initialization failed:', error);
                console.log('LLaad Event Tracker: You can try manual initialization with llaad.init()');
            });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        // DOM is already ready
        setTimeout(autoInit, 100);
    }

    // Expose LLaad globally
    global.llaad = LLaad;

    // Also expose as window.LLaad for convenience
    if (typeof window !== 'undefined') {
        window.LLaad = LLaad;
    }

    console.log('LLaad Event Tracker: Library loaded');

})(typeof window !== 'undefined' ? window : this);