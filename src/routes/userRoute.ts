import { Router, Request, Response } from 'express';
import mysql from 'mysql';


const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});

userRouter.get('/details/:id', (req: Request, res: Response) => { // , next: NextFunction

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
  
userRouter.post('/register/', (req: Request, res: Response) => {
  
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

export default userRouter;