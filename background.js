(function () {
	var vkapi = new VKAPI();

	// Context menu click handler
	function onClickHandler(info, tab) {
		vkapi.imageUpload(info.srcUrl);
	};

	// Chrome tabs on update event listener. 
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		if (vkapi.isAuthInProgress && tab.url.indexOf(vkapi.REDIRECT_URI + "#access_token") >= 0) {
			vkapi.isAuthInProgress = false;
			chrome.tabs.remove(tabId);
			vkapi.authFinalize(tab.url);
		}
	});     

	// Create context menu item
	chrome.contextMenus.create({
	"title" : "На стену!",
	"type" : "normal",
	"contexts" : ["image"],
	"onclick" : onClickHandler
	});
})();
