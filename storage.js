function vkiuPreferencesSetItem(name, value) {
	if (!localStorage) {
		alert("Ошибка доступа к локальному хранилищу!");
		return null;
	}
	
	var preferences = new Object();
	var storageData = localStorage.getItem("vkiuPreferences");
	
	if (storageData != null) {
		preferences = JSON.parse(storageData);
	}
	
	preferences[name] = value;
	
  	localStorage.setItem("vkiuPreferences", JSON.stringify(preferences));
};

function vkiuPreferencesGetItem(name) {
	if (!localStorage) {
		alert("Ошибка доступа к локальному хранилищу!");
		return null;
	}

	var preferences = null;
	var storageData = localStorage.getItem("vkiuPreferences");
	
	if (storageData == null) {
		return null;
	}
	
	preferences = JSON.parse(storageData);
	return preferences[name];
};