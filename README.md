# nodejs-mysql-config-storage
MySQL хранилище параметров приложения
```
Автоматически создает таблицу config (название-значение) в заданной базе данных MySQL.
Метод "start" помещает функционал и данные из таблицы в req.config

req.config.set 	 	- добавляет новый параметр в таблицу или обновляет существующий
req.config.delete 	- удаляет параметр из таблицы
req.config[name] 	- возвращает параметр name

Использует модуль "model-for-mysql" для взаимодействия с БД MySQL
```
## Подключение
```JS
//Устанавка конфигурации (глобальная)
myConfig = {};
//Конфигурация базы данных 
myConfig.db = {
	host 		: 'localhost',
	user 		: 'user',	
	password 	: 'password',
	database 	: 'database',	
};
var config = require('mysql-config-storage')(myConfig.db);

//Формируем задачу
var app = function(req, res) {

	//Запускаем модуль конфигурации
	config.start(req, res, function () {
		...
	});
};
//Создаем и запускаем сервер для задачи
var server = require('http').createServer(app);
server.listen(2020);
```
## Использование

### Установка параметра
```JS
req.config.set(name, value, function(success){});
```
### Удаление параметров
```JS
req.config.delete( name, function(success){} );
```
или
```JS
req.config.delete( [name1, name2], function(success){} );
```
### Получение параметра
```JS
var option = req.config['option'];
```
## Тестирование
```
Пример серверного кода для проверки работоспособности расположен в директории "_demo"
Для запуска установите параметры соединения с БД.
```
### Запуск тестового сервера (из папки "mysql-config-storage")
```
npm run demo
```
### Результат
```
http://localhost:2020
```

