function saveOptions() {
  	if (document.getElementById("gid").checked) {
  		vkiuPreferencesSetItem("wallType", "gid");
  	} else {
  		vkiuPreferencesSetItem("wallType", "uid");
  	}
  	
	vkiuPreferencesSetItem("groupName", document.getElementById("groupName").value);
	
	if (document.getElementById("groupPost").checked) {
  		vkiuPreferencesSetItem("fromGroup", "groupPost");
  	} else {
  		vkiuPreferencesSetItem("fromGroup", "selfPost");
  	}
	
	chrome.extension.getBackgroundPage().notificationShow("Настройки сохранены");
	
	chrome.tabs.getCurrent(function(tab) {
		chrome.tabs.remove(tab.id);
	});
};

document.addEventListener('DOMContentLoaded', function () {
	var wallType = vkiuPreferencesGetItem("wallType");
	var groupName = vkiuPreferencesGetItem("groupName");
	var fromGroup = vkiuPreferencesGetItem("fromGroup");
		
	if ((wallType != null) && (wallType == "gid")) {
  		document.getElementById("gid").checked = true;
  		document.getElementById("uid").checked = false;  		
  	} else {
  		document.getElementById("gid").checked = false;
  		document.getElementById("uid").checked = true;  		
  	}

	if (groupName != null) {
		document.getElementById("groupName").value = groupName;
	}
  
  	if ((fromGroup != null) && (fromGroup == "groupPost")) {
  		document.getElementById("groupPost").checked = true;
  		document.getElementById("selfPost").checked = false;  		
  	} else {
  		document.getElementById("groupPost").checked = false;
  		document.getElementById("selfPost").checked = true;  		
  	}
  
  	document.getElementById("btnOK").addEventListener("click", saveOptions);	
});
