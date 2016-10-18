var express = require('express');
var app = express();

var port = process.env.port || 1337; 

var session = require('express-session');
var path = require('path');
var bodyParser = require('body-parser'); 
var mysql = require('mysql');

// подключение модуля express-mysql-session 
var MySQLStore = require('express-mysql-session')(session);

// установка генератора шаблонов 
app.set('views', './pages'); 
app.set('view engine', 'ejs');

// подгрузка статических файлов из папки pages 
app.use(express.static(path.join(__dirname, 'pages')));

// middleware для обработки данных в формате JSON 
var jsonParser = bodyParser.json();
var textParser = bodyParser.text(); 

app.use(jsonParser); 
app.use(textParser); 

// middleware для обработки тела запроса в кодировке urlencoded 
app.use(bodyParser.urlencoded({ extended: true })); 

// параметры соединения с бд 
var options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'data',

    // как часто будет проводиться удаление устаревших сессий(миллисекунды)
    checkExpirationInterval: 900000,
    // время устаревания сессии(миллисекунды)
    expiration: 86400000
};

// создание хранилища для сессии 
var sessionStore = new MySQLStore(options);

var pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'data'
});  

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true, 
    store: sessionStore
}));

// ОБРАБОТКА ФИЛЬТРА КАТЕГОРИЙ
app.get('/filter/:category', function(req, res) {
        //console.log(req.params.category);
        pool.getConnection(function (err, connection) { 

            connection.query('SELECT * FROM `projects` WHERE category=?', req.params.category, function (err, rows) {
                if (err) console.log(err);

                // генерация рядов грида на основе полученных данных  
                var portf_diws = rows.map((row) => {
                    return (`<div class="col-md-4 col-xs-6">
                            <div class="mask" id=${row.id}>
                                <div style="display: inline-block;">
                                <img src="images/pen.fw.png" name="edit_prj" class="circle" id=${row.id}>&nbsp&nbsp&nbsp
                                <img src="images/info.fw.png" name="view_prj" class="circle" id=${row.id}><br>
                                 <span class="del"><img src="images/del.fw.png" name="del_prj" id=${row.id}></span>
                                </div>
                            </div>
                            <img src=${row.src} class="img-responsive cover">
                        </div>`)
                })

                //console.log(portf_diws);

                var res_div = '';

                for (var elem of portf_diws) res_div += elem;

                res_div += `<div class="col-md-4 col-xs-6">
                                <a href="/new"><img src="images/new.fw.png" class="img-responsive" id="add_prj"></a>
                            </div>`;

                res.end(res_div);
                connection.release();
            })

        })
    })

app.get('/', function (req, res) {
    res.redirect('/home');
})

app.get('/home', function(req, res) {
        pool.getConnection(function (err, connection) { 

            connection.query('SELECT * FROM `projects`', function(err, rows) {
                if (err) console.log(err);

                // генерация рядов грида на основе полученных данных  
                var portf_diws = rows.map((row) => {
                    return (`<div class="col-md-4 col-xs-6">
                            <div class="mask" id=${row.id}>
                                <div style="display: inline-block;">
                                <img src="images/pen.fw.png" name="edit_prj" class="circle" id=${row.id}>&nbsp&nbsp&nbsp
                                <img src="images/info.fw.png" name="view_prj" class="circle" id=${row.id}><br>
                                <span class="del"><img src="images/del.fw.png" name="del_prj" id=${row.id}></span>
                                </div>
                            </div>
                            <img src=${row.src} class="img-responsive cover">
                        </div>`)
                })

                //console.log(portf_diws);

                var res_div = '';

                for (var elem of portf_diws) res_div += elem;

                res_div += `<div class="col-md-4 col-xs-6">
                                <a href="/new"><img src="images/new.fw.png" class="img-responsive" id="add_prj"></a>
                            </div>`;

                res.render('index', { data:  res_div});
                connection.release();
            })

        })
    })

app.get('/contact', function(req, res) {
        res.sendFile(path.join(__dirname,'/pages/contact.html'));
    })

app.get('/new', function(req, res) {
        res.sendFile(path.join(__dirname,'/pages/new.html'));
    })

app.post('/login', function(req, res) {
    // чтение данных POST запроса 
    var data = req.body.text.split(';');
    var username = data[0]; 
    var password = data[1]; 
    if (username == 'admin' && password == '12345'){ 
        req.session.username = username;
        res.end();
    }else{
        res.end('Invalid data!');
    }
})

// удалить элемент по ID 
app.delete('/delete/:id', function(req, res) {
        //console.log(req.params.id);
        pool.getConnection(function (err, connection) { 
                if (err) console.log(err);

                //console.log(req.session.username);

                //if(req.session.username){
                    var sql = 'DELETE FROM `projects` WHERE id=?';
                    sql = mysql.format(sql, req.params.id);

                    connection.query(sql, function (err, rows) {
                        if (err) console.log(err);

                        console.log('item deleted');
                        //res.send('item deleted');
                        //res.redirect('/home');
                        res.end();
                        connection.release();
                    })
                /*}else{
                    res.end();
                }*/

        })
    })

// просмотреть элемент с указанным ID
app.get('/view/:id', function(req, res) {
        pool.getConnection(function (err, connection) { 
            var sql = 'SELECT * FROM `projects`  WHERE id=?';
            sql = mysql.format(sql, req.params.id);

            connection.query(sql, function(err, rows) {
                if (err) console.log(err);

                var project = rows[0];

                res.render('view', {
                    title: project.title,
                    author: project.author,
                    date: project.date,
                    description: project.description,
                    source: project.src
                });

                connection.release();
            })

        })
    })

//открыть страницу редактирования элемента с указанным ID
app.get('/edit/:id', function(req, res) {
        pool.getConnection(function (err, connection) { 
            var sql = 'SELECT * FROM `projects`  WHERE id=?';
            sql = mysql.format(sql, req.params.id);

            connection.query(sql, function(err, rows) {
                if (err) console.log(err);

                var project = rows[0];

                res.render('edit', {
                    title: project.title,
                    author: project.author,
                    description: project.description,
                    source: project.src,
                    category: project.category

                });

                connection.release();
            })

        })
    })

app.put('/update/:id', function(req, res) {
        console.log('updating item'); 
        var data = req.body;
        pool.getConnection(function(err, conn){ 

            if (err) {
                console.log(err.stack); 
                return; 
            }

            // форматирование запроса
            var sql = 'UPDATE `projects` SET title=?, author=?, category=?, description=? WHERE id=?';
            var inserts = [data.title, data.author, data.category, data.description, data.id];
            sql = mysql.format(sql, inserts);
            
            conn.query(sql, function(err) {

                if (err) { 
                    console.log(err); 
                    return;  
                };

                console.log('data inserted!'); 
            });

            // закончить соединение, позволить ему быть использованным еще раз
            conn.release(); 
        }); 
});

app.listen(port, function () {
    console.log('app running on port ' + port);
})