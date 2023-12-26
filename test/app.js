const express = require('express') //모듈 로드시키기
const ejs = require('ejs');
const app = express();
const port = 3000 //서버 접속 번호
var bodyParser = require('body-parser')


app.set('view engine', 'ejs');
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: false }))

//라우팅
app.get('/', (req, res) => {
    res.render('index') // 경로 : ./views/index.ejs
})

//로그인
app.get('/login', (req, res) => {
    res.render('login') // 경로 : ./views/login.ejs
})

//회원가입
app.get('/signin', (req, res) => {
    res.render('sign_in') // 경로 : ./views/sign_in.ejs
})

app.post('/addmember', (req, res) => {
    const id = req.body.id;
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const memberinfo_insert = {
        id: `${id}`,
        name: `${name}`,
        email: `${email}`,
        password: `${password}`
    }
    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query('INSERT INTO memberinfo SET ?', memberinfo_insert, (error, results, fields) => {
            connection.release();

            if (error) {
                console.error(error);
                res.status(500).json({ error: '데이터 삽입 실패' });
                return;
            }

            res.json({ success: true, insertedId: results.insertId });
        });
    });
    // var a = `${id} ${name} ${email} ${password}`


})

var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'coriny',
    password: '1234',
    database: 'memberinfo'
});

//데이터베이스 정보 꺼내기
app.get('/db', (req, res) => {
    pool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query('SELECT * FROM memberinfo', function (error, results, fields) {
            res.send(JSON.stringify(results));
            console.log('results', results);

            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;

            // Don't use the connection here, it has been returned to the pool.
        });
    });
})




app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속주소 : http://localhost: ${port}`)
})