import express, { NextFunction } from 'express';
import { Request, Response } from 'express';
import mysql from 'mysql';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/details/:id', (req: Request, res: Response, next: NextFunction) => {

  var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'node-typescript',
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
        console.log('Entered an error: ', err);
        conn.release();

        return res.send({
          success: false,
          statusCode: 400
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

  // former impl

  /* res.send({
    message: 'Its working',
    id: req.params.id,
    name: req.params.name
  }); */
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