const express = require('express') //모듈 로드시키기
const ejs = require('ejs');
const app = express();
const port = 3000 //서버 접속 번호
var bodyParser = require('body-parser')
const session = require('express-session')
const FileStore = require('session-file-store')(session)


app.set('view engine', 'ejs');
app.set('views', './views')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
    secret: 'jiminjimin',	// 원하는 문자 입력
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
}))


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


var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'coriny',
    password: '1234',
    database: 'memberinfo'
});


//데이터베이스 정보 보기
app.get('/db', (req, res) => {
    pool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        connection.query('SELECT * FROM memberinfo', function (error, results, fields) {
            res.send(JSON.stringify(results));

            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) throw error;

            // Don't use the connection here, it has been returned to the pool.
        });
    });
})


// 데이터 추가하기(회원가입)
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

    console.log(memberinfo_insert);

    pool.getConnection((err, connection) => {
        if (err) throw err;

        connection.query('INSERT INTO memberinfo SET ?', memberinfo_insert, (error, results, fields) => {
            connection.release();

            if (error) {
                console.error(error);
                res.status(500).json({ error: '데이터 삽입 실패' });
                return;
            }
            // 데이터 삽입 성공 시 클라이언트 측에서 리디렉션을 수행
            var html = `
            <script>
                alert("회원가입이 성공적으로 완료되었습니다.");
                window.location.href = '/login'; // 리디렉션
            </script>
        `;
            res.send(html);
        });
    });
});


// 로그인
app.post('/login', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;

    pool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!

        // Use the connection
        const sql = 'SELECT * FROM memberinfo WHERE id = ? AND password = ?';
        connection.query(sql, [id, password], function (error, results, fields) {
            if (error) {
                console.error('Error executing query:', error);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            if (results.length > 0) {       // db에서의 반환값이 있으면 로그인 성공
                req.session.id = id;
            }

            // 결과 처리
            // res.send(JSON.stringify(results));
            res.redirect('/mainpage');
            console.log('results', results);

            // When done with the connection, release it.
            connection.release();
        });
    });
});


// 메인페이지
app.get('/mainpage', (req, res) => {
    var html = `
        <h2>메인 페이지에 오신 것을 환영합니다</h2>
        <p>${req.session.id}님 로그인에 성공하셨습니다.</p>
    `;
    res.send(html); // 경로: ./views/mainpage.ejs
});


app.listen(port, () => {
    console.log(`서버가 실행되었습니다. 접속주소 : http://localhost: ${port}`)
})