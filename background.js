// Show notification message
function notificationShow(message) {
	if (webkitNotifications) {
		var notification = webkitNotifications.createNotification(
  			"img/vkiu-32.png",
  			"Постим картинку на стену",
			message //"Image has been successfully added to the VK wall!"
		);
		notification.show();
        setTimeout(function() {notification.cancel()}, 3000);
	};
};

// Context menu click handler
function getClickHandler() {
  return function(info, tab) {
		gImageUrl = info.srcUrl;

 		if (gAccessToken != null) {
 			gImageBlob = null;
			getImageDataURL(gImageUrl);
        } else {
        	authorizationRequest();
        }
	};
};

// Chrome tabs on update event listener. 
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (gIsAuthInProgress) {
		if ((tab.url.indexOf(REDIRECT_URI_COM + "#access_token") >= 0) 
			|| (tab.url.indexOf(REDIRECT_URI_RU + "#access_token") >= 0)) {
			gIsAuthInProgress = false;
			var url = tab.url;
			chrome.tabs.remove(tabId);
			vkFinalizeAuth(url);
		}
	}
});     

// Create context menu item
chrome.contextMenus.create({
  "title" : "На стену!",
  "type" : "normal",
  "contexts" : ["image"],
  "onclick" : getClickHandler()
});

// Initilize global variables for working with VK API from local storage
initGlobalVariables();