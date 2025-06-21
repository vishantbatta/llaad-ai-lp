// LLaad Event Tracker
// A JavaScript library for tracking events and sending them to Appwrite

import { Client, Databases, ID } from "appwrite";

// Configuration
const CONFIG = {
    endpoint: 'https://fra.cloud.appwrite.io/v1',
    projectId: '685647c2002af9f4d81d',
    databaseId: '685647e10001f9b49876',
    collectionId: '6856480600341ef07d01',
    attributeName: 'event_name'
};

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(CONFIG.endpoint)
    .setProject(CONFIG.projectId);

const databases = new Databases(client);

// Send event to Appwrite
function sendEventToAppwrite(eventName) {
    const documentData = {
        [CONFIG.attributeName]: eventName,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href
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

// Export for use in other modules
export default llaad;

// Also make available globally for direct script usage
if (typeof window !== 'undefined') {
    window.llaad = llaad;
}

console.log('LLaad Event Tracker: Library loaded');
