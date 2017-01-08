VKImageUploader / Постим картинки на стену
==================================================

English:
Google Chrome extension which allows you to post images which were found in the internet directly to your or group wall in the VKontakte social network (http://vk.com, http://vkontake.ru).
You can find this extension in the web store via this link: https://chrome.google.com/webstore/detail/ailbpeoongmfjfnilklgbljlibjfojln
This extension focuses on the Russian-speaking segment of the VKontakte users so all text is on russian.
When you find somewhere in the web cool picture and want to post it to your VKontakte wall you can easily do it with this extension. You should click right mouse button to open context menu and you can see there new menu item: "На стену!" (English translation: "To the Wall!") and it will post image to your wall immediatly. Extension have options page where you can choose where do you want to post image: your wall or group.
This is my first experience to work with chrome extensions and javascript at all.

Russian: 
Расширение для бразуера Google Chrome, которое позволяет постить картинки, найденные в сети, на личную стену или на стену группы социальной сети ВКонтакте (http://vk.com, http://vkontakte.ru).
Найти расширение можно в интернет-магазине Chrome под названием "Постим картинки на стену" или по прямой ссылке: https://chrome.google.com/webstore/detail/ailbpeoongmfjfnilklgbljlibjfojln
Если вы нашли картинку в сети и хотите ее отправить к себе на стену, достаточно шелкнуть правой кнопкой мыши на картинке (вызвать контекстнуе меню) и выбрать там новый пункт: "На стену!" и картинка будет автоматически отправлена на вашу стену. У расширения есть настройки, позволяющие выбрать куда отправлять картинки: на вашу личную стену или стену группы.
Это мой первый опыт работы с расширениями для Chrome и с javascript в целом.

==================================================

Patch notes / Изменения в версиях расширения
--------------------------------------------------
Version 1.5.1

English:
The extension is totally refactored. New features and changes in the current version:
- Added support for built-in Chrome notifications.
- You can set a fixed text caption for your wall posts in the extension options.
- Fixed some bugs interact with VK API.

Russian:
Расширение полностью переписано. Новые возможности и изменения в текущей версии:
- Добавлена поддержка встроенных уведомлений Chrome. 
- Добавлена возможность в настройках указать фиксированный заголовок для сообщений, отправляемых на стену.
- Исправлен ряд ошибок при взаимодействии с VK API.

--------------------------------------------------
Version 1.5.1

English:
Fixed caption problem when caption disappered if it includes hashtags.

Russian:
Исправлена ошибка с появлением заголовка, если в нем присутствуют хештеги.

--------------------------------------------------

Version 1.4.19

English:
Fixed "Reference error: WebKitBlobBuilder is not defined" error. It happens because Google Chrome doesn't support WebKitBlobBuilder anymore.
P.S. Few versions are skipped while fighting with Chrome web store. It has a bug, when you upload and public your extension and then trying to download it back from web store, it says: "Manifest file is invalid". If it happens with your extension just calm down and wait. In about 6-7 hours it became available by itself. Magic.

Russian:
Исправлена ошибка "Reference error: WebKitBlobBuilder is not defined", возникшая в связи с тем, что Google Chrome отказался от поддержки WebKitBlobBuilder.
P.S. Скачок в нумерациях версий произошел из-за проблем загрузки расширения в Chrome web store. У него есть баг, когда загружаешь и публикуешь расширение, а потом пытаешся его скачать из web store, то возникает ошибка: "Файл манифеста имеет неверный формат". Если это произойдет с вашим расширением, то нужно просто расслабиться и подождать. Примерно через 6-7 часов расширение вдруг начало прекрасно скачиваться и обновляться. Магия.

--------------------------------------------------
Version 1.4.5

English:
New checkbox called "ставить подпись под сообщением" ("sign group post") added to the extension settings. If this checkbox is checked, then group wall post will be signed, otherwise, without sign.

Russian: 
В настройки расширения добавлена опция "ставить подпись под сообщением". Если эта галочка поставлена, то, когда постишь на стену группы от имени группы, подпись будет видна, в противном случае, подписи не будет.

--------------------------------------------------
Version 1.4.4

English:
In accordance with the requirements of Google manifest.json has been upgraded two version 2.0. The old manifest file was renamed to manifest_version_1.json and kept in project.

Russian:
В соответствии с требованиями Google manifest.json обновился до версии 2.0. Старый файл манифеста переименован под именем manifest_version_1.json и оставлен в проекте.

--------------------------------------------------

