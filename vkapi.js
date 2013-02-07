// Global constants
const CLIENT_ID = 2848213; 	// Id of VK application "Wall Image Uploader" (Русское название: "Постим картинки на стену")
const AUTHORIZATION_URI = "https://api.vkontakte.ru/oauth/authorize";	// Authorization uri for vkontakte.ru
const REDIRECT_URI_COM = "http://api.vk.com/blank.html";	// Redirect uri for vk.com
const REDIRECT_URI_RU = "http://api.vkontakte.ru/blank.html"; // Redirect uri for vkontakte.ru
const API_URI = "https://api.vkontakte.ru";	// Api uri for vkontakte.ru


// Global variables
var gAccessToken = null; 		// Access token
var gUserId = null; 			// User id
var gGroupId = null; 			// Group name or group id
var gGid = null; 				// Group id
var gExpiresIn = null;			// Expires time
var gIsExpires = false;			// Boolean indicates access token expire status
var gImageUrl = null;			// Global variable for image url
var gImageBlob = null;     		// Blob from image data
var gIsAuthInProgress = false;	// Is authorization in progress (used in chrome.tabs.onUpdated)
var gIsGroup = false;			// Post to the groups wall
var gFromGroup = 0;				// Post from the group name
var gSignedPost = 0;				// Post to the group wall is signed (value = 1) or anonymous (value = 0)

// Read global variables from local storage
function initGlobalVariables() {
	var accessToken = vkiuPreferencesGetItem("vkAccessToken");
	if (accessToken) {
		gAccessToken = accessToken;
	}
	
	var userId = vkiuPreferencesGetItem("vkUserId");
	if (userId) {
		gUserId = userId;
	}
	
	var wallType = vkiuPreferencesGetItem("wallType");
	if ((wallType) && (wallType == "gid")) {
		gIsGroup = true;
	} else {
		gIsGroup = false;
	}
	
	var fromGroup = vkiuPreferencesGetItem("fromGroup");
	if ((fromGroup) && (fromGroup == "groupPost")) {
		gFromGroup = 1;
	} else {
		gFromGroup = 0;
	}
	
	var groupId = vkiuPreferencesGetItem("groupName");
	if (groupId) {
		gGroupId = groupId;
	}

	var expiresIn = vkiuPreferencesGetItem("vkExpiresIn");
	if (expiresIn) {
		gExpiresIn = expiresIn;
	}

	var signedPost = vkiuPreferencesGetItem("signedPost");
	if ((signedPost) && (signedPost == "1")) {
		gSignedPost = 1;
	} else {
		gSignedPost = 0;
	}
}

// Prepare VK authorization page
function vkOpenAuthUrlPrepare(clientId, authorizationUrl, redirectUrl) {
	var authUrl = authorizationUrl;
	authUrl += "?client_id=" + clientId;
	authUrl += "&scope=wall,photos";
	authUrl += "&display=popup";
	authUrl += "&redirect_uri=" + redirectUrl;
	authUrl += "&response_type=token";

	return authUrl;
}

// Open VK authorization page
function vkOpenAuth(clientId, authorizationUrl, redirectUrl) {
	try {
		open(vkOpenAuthUrlPrepare(clientId, authorizationUrl, redirectUrl));
	} catch (e) {
		errorHandler("vkOpenAuth", e);
	}
};

// Finalize authorization and read access token and user id
function vkFinalizeAuth(authUrl) {	
	try {
		gAccessToken = getUriParameterByName(authUrl, "access_token");
		gExpiresIn = getUriParameterByName(authUrl, "expires_in");
		gUserId = getUriParameterByName(authUrl, "user_id");	
		gIsExpires = false;
	
		vkiuPreferencesSetItem("vkAccessToken", gAccessToken);
		vkiuPreferencesSetItem("vkUserId", gUserId);
		vkiuPreferencesSetItem("vkExpiresIn", gExpiresIn);
	
		notificationShow("Авторизация успешно завершена");
	
		gImageBlob = null;
		getImageDataURL(gImageUrl);
	} catch (e) {
		errorHandler("vkFinalizeAuth", e);
	}
};

// Step 1. Get upload server url to POST blob
function vkGetWallUploadServer(apiUrl, accessToken, entityId, isGroup) {
	if ((apiUrl != null) && (accessToken != null) && (entityId != null)) {
		var postUrl = apiUrl;
		postUrl += "/method/photos.getWallUploadServer";
		postUrl += "?access_token=" + accessToken;
		if (isGroup) {
			postUrl += "&gid=" + entityId;
		} else {
			postUrl += "&uid=" + entityId;
		}
		
		try {
			requestExec("GET", postUrl, "vkGetWallUploadServer", false, null);
		} catch (e) {
			errorHandler("vkGetWallUploadServer", "Доступ к VK API запрещен");
		}
	} else {
		if (!authorizationRequest()) {
			errorHandler("vkGetWallUploadServer", "Ошибка инициализации параметров при обращении к VK API");
		}
	}
};

// Step 2. POST blob to upload server url using FormData
function vkUploadImageToServer(uploadServerUrl, imageUrl, imageBlob) {
	if ((imageUrl != null) && (uploadServerUrl != null) && (imageBlob != null)) {
		var formData = new FormData( );
		formData.append("photo", imageBlob, "photo.png");
		
		try {
			requestExec("POST", uploadServerUrl, "vkUploadImageToServer", false, formData);  
		} catch (e) {
			errorHandler("vkUploadImageToServer", "Request to VK API failed");
		}
	} else {
		if (!authorizationRequest()) {
			errorHandler("vkUploadImageToServer", "Ошибка инициализации параметров при обращении к VK API");
		}
	}
};

// Step 3. Save image in the wall album
function vkSaveWallPhoto(apiUrl, accessToken, entityId, serverId, photoData, hash, isGroup) {
	if ((apiUrl != null) && (accessToken != null) && (entityId != null) && (serverId != null) && (photoData != null) && (hash != null)) {
		var postUrl = apiUrl;
		postUrl += "/method/photos.saveWallPhoto";
		postUrl += "?access_token=" + accessToken;
		postUrl += "&server=" + serverId;
		postUrl += "&photo=" + photoData;
		postUrl += "&hash=" + hash;
		if (isGroup) {
			postUrl += "&gid=" + entityId;
		} else {
			postUrl += "&uid=" + entityId;
		}
		
		try {
			requestExec("POST", postUrl, "vkSaveWallPhoto", false, null);
		} catch (e) {
			errorHandler("vkSaveWallPhoto", "Доступ к VK API запрещен");
		}		
	} else {
		if (!authorizationRequest()) {		
			errorHandler("vkSaveWallPhoto", "Ошибка инициализации параметров при обращении к VK API");
		}
	}
};

// Step 4. Post wall message with attachment
function vkWallPost(apiUrl, accessToken, entityId, photoId, fromGroup, signedPost) {
	if ((apiUrl != null) && (accessToken != null) && (entityId != null) && (photoId != null)) {
		var postUrl = apiUrl;
		postUrl += "/method/wall.post";
		postUrl += "?access_token=" + accessToken;
		postUrl += "&owner_id=" + entityId;		
		postUrl += "&attachments=" + photoId;
		postUrl += "&from_group=" + fromGroup;
		postUrl += "&signed=" + signedPost;
		
        try {
        	requestExec("GET", postUrl, "vkWallPost", false, null);
        } catch(e) {
	        errorHandler("vkWallPost", "Доступ к VK API запрещен");
        }
    } else {
    	if (!authorizationRequest()) {
	    	errorHandler("vkWallPost", "Ошибка инициализации параметров при обращении к VK API");
	    }
    }
};

// Get user groups
function vkGroupsGet(apiUrl, accessToken, entityId) {
	if ((apiUrl != null) && (accessToken != null) && (entityId != null)) {
		var postUrl = apiUrl;
		postUrl += "/method/groups.get";
		postUrl += "?access_token=" + accessToken;
		postUrl += "&owner_id=" + entityId;		
		postUrl += "&extended=1";
		
        try {
        	requestExec("GET", postUrl, "vkGroupsGet", false, null);
        } catch(e) {
	        errorHandler("vkGroupsGet", "Доступ к VK API запрещен");
        }	
	} else {
		if (!authorizationRequest()) {	
			errorHandler("vkGroupsGet", "Ошибка инициализации параметров при обращении к VK API");
		}
	}
};

// Extract vk group name from url
function vkExtractGroupName (url) {
	 var groupName = url.toString().replace("http://", "").replace("https://", "").replace("vk.com/", "").replace("vkontakte.ru/", "");
	 return groupName;
};

// Get uri parameter by name
function getUriParameterByName(uri, name) {
	var res = "";
  	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  	var regexStr = "[\\?&#]" + name + "=([A-z,0-9]*)";
  	var results = RegExp(regexStr).exec(uri);
  	if (results != null) {
    	res = decodeURIComponent(results[1].replace(/\+/g, " "));
    }	
    return res;
};


function dataURIToBlob (dataURI) {
	var byteString = atob(dataURI.split(',')[1]);
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
	var ab = [];

	for (var i = 0; i < byteString.length; i++) 
		ab.push(byteString.charCodeAt(i)); 

	return new Blob([new Uint8Array(ab)], { type: mimeString });
};


// Cross-domain request execute
function requestExec(method, url, source, isAsyncRequest, data) {
    var xhr = new XMLHttpRequest();
	xhr.open(method, url, isAsyncRequest);
	
    xhr.onreadystatechange = function(data) {  
    	if (xhr.readyState == 4) {
        	if (xhr.status == 200) {
            	var xhrResponse = JSON.parse(xhr.responseText);  

				if ((xhrResponse.error != null) && (xhrResponse.error.error_code != null)) {
					var errorCode = xhrResponse.error.error_code;
					switch (errorCode) {
						case 5:
							gIsExpires = true;
							authorizationRequest();
							break;
						
						case 15:
							errorHandler("requestExec", "Недостаточно прав для отправки изображений на стену группы (проверьте как вы отправляете картинку: от своего имени или от имени группы)");
							break;
						
						default:
							if (xhrResponse.error.error_msg != null) {
								errorHandler("requestExec", xhrResponse.error.error_msg);
							} else {
								errorHandler("requestExec", "Неопознанная ошибка. Код ошибки: " + errorCode);
							}
							break;
					}
					return;
				}

            	switch (source) {
             	    case "vkGetWallUploadServer":
            	        if (xhrResponse.response.upload_url != null) {
            	            uploadServerUrl = xhrResponse.response.upload_url;
            	            vkUploadImageToServer(uploadServerUrl, gImageUrl, gImageBlob)
            	        } else {
            	        	errorHandler("requestExec (vkGetWallUploadServer)", "Адрес сервера ВКонтакте для загрузки картинок не корректен");
            	        }
            	        break;            	
            	
            	    case "vkUploadImageToServer":
						if ((xhrResponse.server != null) && (xhrResponse.photo != null) && (xhrResponse.hash != null)) {
							serverId = xhrResponse.server; 
							photoData = xhrResponse.photo; 
							hash = xhrResponse.hash; 
							if (photoData == null || photoData == "" || photoData == "[]") {
								errorHandler("requestExec (vkUploadImageToServer)", "Выбранная картинка имеет неподходящее расширение или поверждена");
							} else {
								if (gIsGroup) {
									vkSaveWallPhoto(API_URI, gAccessToken, gGid, serverId, photoData, hash, true);
								} else {
									vkSaveWallPhoto(API_URI, gAccessToken, gUserId, serverId, photoData, hash, false);
								}
							}
						} else {
            	        	errorHandler("requestExec (vkUploadImageToServer)", "Не удалось загрузить картинку на сервер ВКонтакте");
            	        }
            	        break;            	
            	
            	    case "vkSaveWallPhoto":
						if (xhrResponse.response[0].id != null) {
							photoId = xhrResponse.response[0].id;
							if (gIsGroup) {
								vkWallPost(API_URI, gAccessToken, "-" + gGid, photoId, gFromGroup, gSignedPost);
							} else {
								vkWallPost(API_URI, gAccessToken, gUserId, photoId, gFromGroup, gSignedPost);
							}							
						} else {
            	        	errorHandler("requestExec (vkSaveWallPhoto)", "Не удалось получить идентификатор картинки с сервера ВКонтакте");
            	        }             	    
            	        break;             	
            	
            	    case "vkWallPost":
            	        if (xhrResponse.response.post_id != null) {
            	        	// success!
							notificationShow("Картинка отправлена на стену!");
            	        } else {
            	        	errorHandler("requestExec (vkWallPost)", "Не удалось создать запись на стене");
            	        }
            	        break;
            	        
            	    case "vkGroupsGet":    
            	        if (xhrResponse.response.length != null && xhrResponse.response.length > 0) {
            	        	gGid = null;
            	        	var count = xhrResponse.response[0];
            	        	if (count > 0) {
            	        		for (var i = 1; i <= count; i++) {
            	        			if (xhrResponse.response[i].screen_name == vkExtractGroupName(gGroupId)) {
            	        				gGid = xhrResponse.response[i].gid;
            	        			}
            	        		}
            	        		if (gGid != null) {
            	        			// success!
            	        		} else {
            	        			errorHandler("requestExec (vkGroupsGet)", "Не удалось найти группу по указанной ссылке");
            	        		}    			
            	        	} else {
	            	        	errorHandler("requestExec (vkGroupsGet)", "Вы не состоите ни в одной группе");
            	        	}
            	        } else {
            	        	errorHandler("requestExec (vkGroupsGet)", "Ошибка при получении списка групп");
            	        }
            	        break;
            	                    	                   	    
            	    default:
            	        break;    
            	}
            		
				xhr = null;
			}
		}
	}; 
	
	xhr.send(data);
};
    
// Get image data from the url
function getImageDataURL(url) {
	var data, canvas, ctx;
	var img = new Image();
	
	img.onload = function() {
	    canvas = document.createElement("canvas");
	    canvas.width = img.width;
	    canvas.height = img.height;

		ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0);

		try {
			data = canvas.toDataURL();
			imageDataHandler(data);
		} catch(e) {
			errorHandler("getImageDataURL onload", e);
		}
	};
		
	img.src = url;
};

// Image data handler
function imageDataHandler(data) {
	try {
		initGlobalVariables();

		gImageBlob = dataURIToBlob(data);

		if (gIsGroup) {
			vkGroupsGet(API_URI, gAccessToken, gGroupId);			
			if (gGid != null) {
				vkGetWallUploadServer(API_URI, gAccessToken, gGid, true);
			}
		} else {
			vkGetWallUploadServer(API_URI, gAccessToken, gUserId, false);
		}
	} catch (e) {
		errorHandler("imageDataHandler", e);
	}
};

// Error message handler
function errorHandler(sender, e) {
	//alert("Sender: \"" + sender + "\", error message: " + e);
	alert("Сообщение об ошибке: " + e);
};

// Request user to complete authorization
function authorizationRequest() {
	if ((gIsExpires) || (gAccessToken == null)) {
		alert("Необходима авторизация ВКонтакте. Страница авторизации откроется в новой вкладке")
		gAccessToken = null;
		gIsAuthInProgress = true;
		vkOpenAuth(CLIENT_ID, AUTHORIZATION_URI, REDIRECT_URI_RU);
		return true;
	}
	return false;
};

