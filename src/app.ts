import express, { Request, Response } from 'express';
const cors = require('cors');
const env = require('dotenv');
const mysql = require('mysql2');

env.config();

const app: any = express();
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT: number = 3000;

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: 'book_comment'
});

connection.connect((err: Error) => {
    if (err) {
        console.log('error connecting: ' + err.stack);
        return;
    }
    console.log('DB Success');
});

app.get('/', (req: Request, res: Response) => {
    connection.query(
        'SELECT title, books.isbn, comments FROM books inner join comments on comments.isbn = books.isbn',
        (error: Error, results: []) => {
            if (error) throw error;
            res.send(results);
            // console.log(results);
        }
    );
});

app.post('/book/post', (req: Request, res: Response) => {
    const title = req.body.title;
    const isbn = req.body.isbn;
    const query = `insert into books (title, isbn) select * from (select '${title}' as title, '${isbn}' as isbn) as tmp where not exists (select * from books where title='${title}' and isbn='${isbn}')`

    connection.query(
        query,
        (error: Error, results: []) => {
            if (error) throw error;
            console.log('book insert');
        }
    );
})

app.post('/comment/post', (req: Request, res: Response) => {
    const isbn = req.body.isbn;
    const comment = req.body.comment;

    const query = `insert into comments (isbn, comments) values ('${isbn}', '${comment}')`;


    connection.query(
        query,
        (error: Error, results: []) => {
            if (error) throw error;
            console.log(results);
        }
    );

})


app.listen(PORT, () => {
    console.log('Start Server');
})