import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql';
import dotenv from 'dotenv'

import routes from './routes'; 

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

app.get('/details/:id', (req: Request, res: Response, next: NextFunction) => {

  var pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: 10,
    multipleStatements: true
  });

  pool.getConnection((err: any, conn: any) => {
    if(err){
      console.log('Entered an error: ', err);
      res.send({
        success: false,
        statusCode: 500,
        message: 'Error during connection'
      }) 
      
      return;
    }

    console.log('id from req.params: ' + req.params.id);

    conn.query('SELECT * FROM customers WHERE customerNumber=?', [req.params.id], (err: any, rows: any) => {
      if(err){
        console.log('Encountered an error: ', err);
        conn.release();

        return res.send({
          success: false,
          statusCode: 400
        });      
      }

      if(rows.length < 1){
        return res.send({
          message: 'Data not found',
          statusCode: 404,
        });
      }

      res.send({
        message: 'Successul',
        statusCode: 200,
        data: rows
      });

      conn.release();   // close connection
    });
    
  });
}); 

app.post('/register/', (req: Request, res: Response) => {

  var pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    connectionLimit: 10,
    multipleStatements: true
  });

  pool.getConnection((err: any, conn: any) => {
    if(err){
      console.log('Entered an error: ', err);
      res.send({
        success: false,
        statusCode: 500,
        message: 'Error during connection'
      }) 
      
      return;
    }

    console.log('req.body: ' + req.body);
    let sqlQuery = `call registeruser(?,?,?)`;
    

    conn.query(sqlQuery, [req.body.email, req.body.phone, req.body.password], (err: any, rows: any) => {
      if(err){
        console.log('Encountered an error: ', err);
        conn.release();

        return res.send({
          success: false,
          statusCode: 400
        });      
      }

      res.send({
        message: 'Successul',
        statusCode: 200,
        // data: rows
      });

      conn.release();   // close connection
    });
    
  });
});

app.post('/id/:id/name/:name', (req: Request, res: Response) => {
  res.send({ 
    data: req.body,
    params: {
      id: req.params.id,
      name: req.params.name
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});