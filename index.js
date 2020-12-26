var Model = function (config) {
	//наследование и конструктор
	require('model-for-mysql').call(this, config);
	
	var self = this;
	
	//Название таблицы
	this.table 			= 'config';
	//Ключевое поле
	this.idkey 			= 'config_key';	
	//Ник таблицы
	this.table_nick 	= 'Таблица конфигурации';
	//Структура полей таблицы	
	this.fields 		= 
	[
		{
			field	: 'config_key', 
			label	: 'НАЗВАНИЕ ПАРАМЕТРА', 
			type	: 'varchar(100) NOT NULL',
		},
		{
			field	: 'config_value', 
			label	: 'ЗНАЧЕНИЕ ПАРАМЕТРА', 
			type	: 'text NOT NULL',
		},
		{
			field	: 'config_about',
			label	: 'КОММЕНТАРИЙ',
			type	: 'varchar(255) NOT NULL',
		},
	];
	
	this.insert_row = function (name, value, next) {
		var data = {
			data : {
				config_key 		: name,
				config_value 	: JSON.stringify(value),
			}
		};
		this.insert(data, next);
	};

	this.update_row = function (name, value, next) {
		var data = {
			where : {
				config_key : name
			},
			data : {
				config_value : JSON.stringify(value)
			}
		};
		this.update(data, next);
	};

	this.delete_rows = function(names, next) {
		var data = {
			in : {
				config_key : names
			}
		};
		this.delete(data, next);
	};
	
	//Создаем таблицу, если не создана
	this.create( function (success) {});
};

var Config = function (config) {
	var self = this;
	//Формируем модель
	var mdl_config = new Model(config);
	
	//Заполнение config.destination данными из таблицы
	this.start = function (req, res, next) {
		req.config = {
			set : function(name, value, next) {
				if (req.config[name]) {
					mdl_config.update_row(name, value, next);
				} else {
					mdl_config.insert_row(name, value, next);
				}
			},
			delete : function(names, next) {
				if (!(names instanceof Array)) names = [names];
				mdl_config.delete_rows(names, next);
			},
		};
		//Заполоняем данные из БД
		mdl_config.select ({fields:['config_key', 'config_value']}, function (rows) {
			for (var i in rows) {
				req.config[rows[i]['config_key']] = JSON.parse(rows[i]['config_value']);
			};
			next();	
		});
	};
};
module.exports = function (config) {
	return new Config(config);
};