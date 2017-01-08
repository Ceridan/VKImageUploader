(function () {
	document.addEventListener('DOMContentLoaded', function () {
		var storage = new Storage();
		var utils = new Utils();
		
		var wallType = storage.getItem("wallType");
		var groupName = storage.getItem("groupName");
		var fromGroup = storage.getItem("fromGroup");
		var signedPost = storage.getItem("signedPost");
		var caption = storage.getItem("caption");
			
		if (wallType === "gid") {
			document.getElementById("gid").checked = true;
			document.getElementById("uid").checked = false;  		
		} else {
			document.getElementById("gid").checked = false;
			document.getElementById("uid").checked = true;  		
		}

		if (groupName) {
			document.getElementById("groupName").value = groupName;
		}

		if (fromGroup === "groupPost") {
			document.getElementById("groupPost").checked = true;
			document.getElementById("selfPost").checked = false;  		
		} else {
			document.getElementById("groupPost").checked = false;
			document.getElementById("selfPost").checked = true;  		
		}

		if (signedPost === "1") {
			document.getElementById("signedPost").checked = true;  				
		} else {
			document.getElementById("signedPost").checked = false;  						
		}

		if (caption) {
			document.getElementById("caption").value = caption;
		}

		document.getElementById("btnOK").addEventListener("click", function() {
			if (document.getElementById("gid").checked) {
				storage.setItem("wallType", "gid");
			} else {
				storage.setItem("wallType", "uid");
			}
			
			storage.setItem("groupName", document.getElementById("groupName").value);
			
			if (document.getElementById("groupPost").checked) {
				storage.setItem("fromGroup", "groupPost");
			} else {
				storage.setItem("fromGroup", "selfPost");
			}
			
			if (document.getElementById("signedPost").checked) {
				storage.setItem("signedPost", "1");
			} else {
				storage.setItem("signedPost", "0");
			}	

			storage.setItem("caption", document.getElementById("caption").value);

			utils.notificationShow("Настройки сохранены!");
			
			chrome.tabs.getCurrent(function(tab) {
				chrome.tabs.remove(tab.id);
			});
		});	
	});
})();
