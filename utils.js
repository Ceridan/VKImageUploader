function Utils() {
	var self = this;

	// Create notifications for extension events
	this.notificationShow = function(message) {
		if (!Notification || Notification.permission === "denied") {
			alert(message); 
		} else if (Notification.permission === "granted") {
			var notification = new Notification(message, {
				icon: "img/vkiu-32.png",
			});
		} else {
			Notification.requestPermission(function (permission) {
				if (permission === "granted") {
					self.notificationShow(message);
				}
    		});
		}
	};
};

// Create final error message and show it to the user
Utils.prototype.errorHandler = function(errorMessage, errorCode) {
	var errorText = "Error message: " + errorMessage;
	
	if (errorCode)
		errorText += "\nError code: " + errorCode;

	this.notificationShow(errorText);
};

// Get URI parameter by name
Utils.prototype.getUriParameterByName = function(uri, name) {
    var regexStr = "[\\?&#]" + name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]") + "=([A-z,0-9]*)";
	var results = RegExp(regexStr).exec(uri);
		
	if (results != null) {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}	

	return null;
};

// Extract VK group name from URL
Utils.prototype.extractGroupName = function(url) {
	 return url.toString().replace("http://", "").replace("https://", "").replace("vk.com/", "").replace("vkontakte.ru/", "");
};

// Get image data from the url
Utils.prototype.getImageDataByURL = function(url, callback) {
	var data, canvas, ctx;
	var img = new Image();
	
	img.onload = function() {
	    canvas = document.createElement("canvas");
	    canvas.width = img.width;
	    canvas.height = img.height;

		ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);
		data = canvas.toDataURL();

		callback(data);
	};
		
	img.src = url;
};

// Convert  image data URI to blob
Utils.prototype.dataURIToBlob = function(dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	var ab = [];

	for (var i = 0; i < byteString.length; i++) 
		ab.push(byteString.charCodeAt(i)); 

	return new Blob([new Uint8Array(ab)], { type: mimeString });
};