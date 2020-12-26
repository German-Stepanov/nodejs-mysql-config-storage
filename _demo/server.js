//Вспомогательная функция
Object.defineProperty(Object.prototype, 'myFormat', {writable: true, value:
	function() {
		var str = '' + JSON.stringify(this, null, 4);
		//TABS
		str = str.replace(/((?!\r\n)[\s\S]+?)($|(?:\r\n))/g, function (s, STR, CRLN, POS) {
			return STR.replace(/([^\t]*?)\t/g, function (s, STR, POS) {
				return STR + (new Array(4 - (STR.length + 4 ) % 4 + 1)).join(' ');
			}) + CRLN;
		});
		//LN
		str = str.replace(/\n/g, '<br/>');
		//SPACES
		return str.replace(/ +/g, function (s) {
			return (s.length==1) ? (' ') : ((new Array(s.length)).join('&nbsp;') + ' ');
		});
	}
});

//Устанавка конфигурации (глобальная)
myConfig = {};
//Конфигурация сервера
myConfig.server = {
	port		: 2020,
	isDebug		: true,		//Сообшения сервера
};

//Конфигурация базы данных 
myConfig.db = {
	host 		: 'localhost',
	user 		: 'user',	
	password 	: 'password',
	database 	: 'database',	
};
var config = require('mysql-config-storage')(myConfig.db);

var controller = function(req, res, next) {
	var url = req.url.split('/');
	if (url[1]=='set') {
		//Установка данных пользователя
		var name = url[2]
		var value;
		if (url[3]=='object1') {
			value = {user_name:"name1", user_id:17}
		} else if (url[3]=='object2') {
			value = {user_name:"name2", user_id:28}
		} else {
			value = url[3];
		}
		req.config.set(name, value, function(success) {
			//Возврат на главную страницу
			res.writeHead(302, {'Location':'/'});
			res.end();
			return next();
		})
	} else if (url[1]=='delete') {
		//Удаление данных пользователя
		var name = url[2];
		if (url[3]) {
			name = [url[2], url[3]]	;		
		}
		req.config.delete(name, function(success) {
			res.writeHead(302, {'Location':'/'});
			res.end();
			return next();
		});
	} else {
		//Вывод главной страницы
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
		res.write('<style>* {font-size:18px} h1 {font-size:32px;margin-bottom:5px} h2 {font-size:24px;margin-bottom:5px} a {text-decoration:none; }</style>');
		res.write('<h1>Главная страница <a href="/" title="Обновить активность пользователя">(ОБНОВИТЬ)</a></h1> ');
		res.write('<h2>Данные пользователя</h2>');
		res.write('myConfig.data = ');
		res.write((req.config || {}).myFormat());

		//Добавляем меню
		res.write('<h2>ДОБАВИТЬ/ОБНОВИТЬ ДАННЫЕ<br/>myConfig.data.set(name, value, function(success) {})</h2>');
		res.write('<div><a href="/set/users_per_page/20">Установить <b>users_per_page</b> число <b>20</b></a></div>');
		res.write('<div><a href="/set/users_per_page/60">Установить <b>users_per_page</b> число <b>60</b></a></div>');
		res.write('<div><a href="/set/status/active">Установить <b>status</b> строку <b>active</b></a></div>');
		res.write('<div><a href="/set/status/passive">Установить <b>status</b> строку <b>passive</b></a></div>');
		res.write('<div><a href="/set/admin/object1">Установить <b>admin</b> объект <b>{user_name:"name1", user_id:17}</b></a></div>');
		res.write('<div><a href="/set/admin/object2">Установить <b>admin</b> объект <b>{user_name:"name2", user_id:28}</b></a></div>');

		res.write('<h2>УДАЛИТЬ ДАННЫЕ<br/>req.session.delete(name, function(success) {})</h2>');
		res.write('<div><a href="/delete/users_per_page">Удалить <b>users_per_page</b></a></div>');
		res.write('<div><a href="/delete/status">Удалить <b>status</b></a></div>');
		res.write('<div><a href="/delete/admin">Удалить <b>admin</b></a></div>');
		res.write('<div><a href="/delete/users_per_page/status">Удалить <b>users_per_page</b> и <b>status</b></a></div>');

		res.end();
		return next(1);
	}
}

//Формируем задачу
var app = function(req, res) {
	//Установим метку времени
	if (myConfig.server.isDebug) {
		console.log('\nПолучен запрос req.url', req.url);
		console.time('app');
	}
	//Подключаем и запускаем модуль конфигурации
	config.start(req, res, function () {
		//Запуск контроллера обработки запросов
		controller(req, res, function() {
			//Выводим общее время
			if (myConfig.server.isDebug) {
				console.timeEnd('app');
			}
		});
	});
};
//Создаем и запускаем сервер для задачи
var server = require('http').createServer(app);
server.listen(myConfig.server.port);
//Отображаем информацию о старте сервера
if (myConfig.server.isDebug) console.log('Server start on port ' + myConfig.server.port + ' ...');
