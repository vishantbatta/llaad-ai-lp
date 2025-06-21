// LLaad Event Tracker
// A JavaScript library for tracking events and sending them to Appwrite

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        endpoint: 'https://fra.cloud.appwrite.io/v1',
        projectId: '685647c2002af9f4d81d',
        databaseId: '685647e10001f9b49876',
        collectionId: '6856480600341ef07d01',
        attributeName: 'event_name'
    };

    // Initialize when Appwrite is available
    function initializeAppwrite() {
        if (!window.Appwrite) {
            console.error('LLaad Event Tracker: Appwrite SDK not found. Please include the Appwrite SDK before this script.');
            console.error('Add this script tag: <script src="https://cdn.jsdelivr.net/npm/appwrite@18.1.1"></script>');
            return null;
        }

        const client = new window.Appwrite.Client()
            .setEndpoint(CONFIG.endpoint)
            .setProject(CONFIG.projectId);

        const databases = new window.Appwrite.Databases(client);

        return { databases, ID: window.Appwrite.ID };
    }

    // Send event to Appwrite
    function sendEventToAppwrite(eventName) {
        const appwrite = initializeAppwrite();
        if (!appwrite) return;

        const { databases, ID } = appwrite;

        const documentData = {
            [CONFIG.attributeName]: eventName
        };

        console.log(`LLaad Event Tracker: Sending event "${eventName}"`);

        const promise = databases.createDocument(
            CONFIG.databaseId,
            CONFIG.collectionId,
            ID.unique(),
            documentData
        );

        promise.then(function(response) {
            console.log(`LLaad Event Tracker: Event "${eventName}" sent successfully:`, response);
        }, function(error) {
            console.error(`LLaad Event Tracker: Failed to send event "${eventName}":`, error);
        });
    }

    // Validate event name
    function isValidEventName(eventName) {
        return typeof eventName === 'string' && eventName.trim().length > 0;
    }

    // Main LLaad object
    const llaad = {
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
        }
    };

    // Make available globally
    window.llaad = llaad;

    console.log('LLaad Event Tracker: Library loaded');

})();
