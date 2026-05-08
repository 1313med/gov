const DEV_SERVER_URL = "http://192.168.1.27:5000";
const PROD_SERVER_URL = "https://api.goovoiture.com";

// Use HTTP only in development LAN testing; production must stay HTTPS.
export const SERVER_URL = __DEV__ ? DEV_SERVER_URL : PROD_SERVER_URL;
export const API_URL = `${SERVER_URL}/api`;
