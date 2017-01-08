// Class for working with VK API
function VKAPI() {
    // VK constants
    this.CLIENT_ID = 2848213; 	                                            // Id of VK application "Wall Image Uploader" (Русское название: "Постим картинки на стену")
    this.AUTHORIZATION_URI = "https://api.vk.com/oauth/authorize";	        // Authorization uri for vvk.com
    this.REDIRECT_URI = "http://api.vk.com/blank.html";	                    // Redirect uri for vk.com
    this.API_URI = "https://api.vk.com";	                                // Api uri for vk.com

    // Include storage and utils modules
    var storage = new Storage();                                            // Storage Initilization
    var utils = new Utils();                                                // Utility object initilization
    var self = this;

    this.accessToken = null; 		                                        // Access token
    this.userId = null; 			                                        // User id
    this.groupName = null;		                                            // Group name or group id
    this.expiresIn = null;			                                        // Expiration time
    this.isGroup = false;			                                        // Post to the groups wall
    this.fromGroup = 0;                                                     // Post from the group name
    this.signedPost = 0;		                                            // Post to the group wall is signed (value = 1) or anonymous (value = 0)
    this.groupId = null;                                                    // Group id (will be determined on the first post to the group wall)
    this.caption = null;                                                    // Caption for the wall post
    this.isExpires = false;			                                        // Boolean indicates access token expire status
    this.imageUrl = null;                                                   // Url of uploaded image
    this.imageBlob = null;     		                                        // Blob from image data
    this.isAuthInProgress = false;	                                        // Is authorization in progress (used in chrome.tabs.onUpdated)    

    // Main parameters thiswhich will be loaded from storage on image upload event
    this.loadFromStorage = function() {
        self.accessToken = storage.getItem("vkAccessToken");
        self.userId = storage.getItem("vkUserId");
        self.groupName = storage.getItem("groupName");
        self.expiresIn = storage.getItem("vkExpiresIn");
        self.isGroup = storage.getItem("wallType") === "gid";
        self.fromGroup = storage.getItem("fromGroup") === "groupPost" ? 1 : 0;
        self.signedPost = storage.getItem("signedPost") === "1" ? 1 : 0;
        self.caption = storage.getItem("caption");
    }

    // Creating authentication URL with our client ID and correct scope and open this URL
    this.authInit = function() {
        if (self.isExpires || !self.accessToken) {
            self.accessToken = null;
            self.isAuthInProgress = true;

            var authUrl = self.AUTHORIZATION_URI;
            authUrl += "?client_id=" + self.CLIENT_ID;
            authUrl += "&scope=wall,photos";
            authUrl += "&display=popup";
            authUrl += "&redirect_uri=" + self.REDIRECT_URI;
            authUrl += "&response_type=token";

            open(authUrl);

            return false;
        }

        return true;
    };

    // Finalize authentication and read access token and user id
    this.authFinalize = function(url) {
        self.accessToken = utils.getUriParameterByName(url, "access_token");
        self.userId = utils.getUriParameterByName(url, "user_id");
        self.expiresIn = utils.getUriParameterByName(url, "expires_in");	
        self.isExpires = false;

        utils.notificationShow("Авторизация успешно завершена");

        storage.setItem("vkAccessToken", self.accessToken);
        storage.setItem("vkUserId", self.userId);
        storage.setItem("vkExpiresIn", self.isExpires);

        if (self.imageUrl) {
            utils.getImageDataByURL(self.imageUrl, self.imageUploadHandler);
        }
    };

    // Step 1. Get upload server url to POST a blob
    this.getWallUploadServer = function() {
        var getUrl = self.API_URI;
        getUrl += "/method/photos.getWallUploadServer";
        getUrl += "?access_token=" + self.accessToken;
        getUrl += self.isGroup ? ("&gid=" + self.groupId) : ("&uid=" + self.userId);

        $.ajax({
            type: "GET",
            url: getUrl,
            dataType: "json",
            success: function (response) {
                if (self.checkAndHandleVkError(response))
                    return;

                self.uploadImageToServer(response.response.upload_url)
            }
        });
    };

    // Step 2. POST blob via the upload server URL using FormData
    this.uploadImageToServer = function(uploadServerUrl) {
        if (!self.imageBlob)
            return;

        var formData = new FormData();
        formData.append("photo", self.imageBlob, "photo.png");
 
        $.ajax({
            type: "POST",
            url: uploadServerUrl,
            dataType: "json",
            cache: false,
            processData: false,
            contentType: false,
            data: formData,
            success: function (response) {
                if (self.checkAndHandleVkError(response))
                    return;

                self.saveWallPhoto(response.server, response.photo, response.hash);
            }
        });       
    };

    // Step 3. Save image to the wall photo catalogue
    this.saveWallPhoto = function(server, photo, hash) {
        if (!photo || photo.length == 0) {
            utils.errorHandler("Сервер не смог корректно распознать загружаемое изображение. Загрузка не была произведена.");
            return;
        }

        var postUrl = self.API_URI;
        postUrl += "/method/photos.saveWallPhoto";
        postUrl += "?access_token=" + self.accessToken;
        postUrl += "&server=" + server;
        postUrl += "&photo=" + photo;
        postUrl += "&hash=" + hash;
        postUrl += self.isGroup ? ("&gid=" + self.groupId) : ("&uid=" + self.userId);

        if (self.caption) {
            postUrl += "&caption=" + self.caption;
        }

        $.ajax({
            type: "POST",
            url: postUrl,
            dataType: "json",
            success: function (response) {
                if (self.checkAndHandleVkError(response))
                    return;
                if (!response.response || response.response.length == 0) {
                    utils.errorHandler("Не удалось получить идентификатор картинки с сервера ВКонтакте");
                    return;
                }

                var photoId = response.response[0].id;
                self.wallPost(photoId);						
            }
        }); 
    };

    // Step 4. Post message with attachment to the VK wall
    this.wallPost = function(photoId) {
        var getUrl = self.API_URI;
        getUrl += "/method/wall.post";
        getUrl += "?access_token=" + self.accessToken;
        getUrl += "&owner_id=" + (self.isGroup ? "-" + self.groupId : self.userId);		
        getUrl += "&attachments=" + photoId;
        getUrl += "&from_group=" + self.fromGroup;
        getUrl += "&signed=" + self.signedPost;

        $.ajax({
            type: "GET",
            url: getUrl,
            dataType: "json",
            success: function (response) {
                if (self.checkAndHandleVkError(response))
                    return;

                if (response.response.post_id != null) {
                    storage.setItem("UploadImageUrl", null);
                    utils.notificationShow("Картинка отправлена на стену!");
                } else {
                    utils.errorHandler("Не удалось создать запись на стене ВКонтакте");
                }				
            }
        }); 
    };

    // Set user group
    this.setUserGroup = function(callback) {
        var getUrl = self.API_URI;
        getUrl += "/method/groups.getById";
        getUrl += "?access_token=" + self.accessToken;	
        getUrl += "&group_id=" + utils.extractGroupName(self.groupName);

        $.ajax({
            type: "GET",
            url: getUrl,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function (response) {
                if (self.checkAndHandleVkError(response))
                    return;
                
                if (response.response.length == 0) {
                    utils.notificationShow("Возникла ошибка при получении списка групп");
                    return;
                }
                
                self.groupId = response.response[0].gid;

                if (!self.groupId) {
                    utils.notificationShow("Не удалось найти группу по указанной ссылке");
                } else {
                    callback();
                }		
            }
        });         
    };

    this.imageUpload = function(url) {
        self.imageUrl = url;

        if (!self.authInit())
            return;

        utils.getImageDataByURL(url, self.imageUploadHandler);
    }

    this.imageUploadHandler = function(imageData) {
        if (!imageData) {
            utils.notificationShow("Не удалось корректно загрузить изображение из источника");
            return;
        }

        if (!self.authInit())
            return;

        self.loadFromStorage();
        self.imageBlob = utils.dataURIToBlob(imageData);

        if (self.isGroup && !self.groupId)
            self.setUserGroup(self.getWallUploadServer)
        else
            self.getWallUploadServer();
    };

    // Check and handle errors in XHR response from VK
    this.checkAndHandleVkError = function(response) {
        if (!response.error)
            return false;

        var errorCode = response.error.error_code;
        var errorMessage = response.error.error_msg;
        
        switch (errorCode)
        {
            case 5:
                self.isExpires = true;
                self.authInit();
                break;
            
            case 15:
                utils.errorHandler("Недостаточно прав для отправки изображений на стену группы (проверьте как вы отправляете картинку: от своего имени или от имени группы)");
                break;         

            default:
                utils.errorHandler(errorMessage, errorCode);
                break;
        }

        return true;
    };
};