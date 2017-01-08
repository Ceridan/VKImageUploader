function Storage() {
	var utils = new Utils();

	this.getItem = function(name) {
		if (!localStorage) {
			utils.errorHandler("Ошибка доступа к локальному хранилищу");
			return null;
		}

		var storageData = localStorage.getItem("vkiuPreferences");
		
		if (storageData == null) {
			return null;
		}
		
		var preferences = JSON.parse(storageData);

		return preferences[name];
	};

	this.setItem = function(name, value) {
		if (!localStorage) {
			utils.errorHandler("Ошибка доступа к локальному хранилищу");
			return;
		}
		
		var preferences;
		var storageData = localStorage.getItem("vkiuPreferences");
		
		if (storageData != null) {
			preferences = JSON.parse(storageData);
		} else {
			preferences = new Object();
		}
		
		preferences[name] = value;
		
		localStorage.setItem("vkiuPreferences", JSON.stringify(preferences));
	};
};