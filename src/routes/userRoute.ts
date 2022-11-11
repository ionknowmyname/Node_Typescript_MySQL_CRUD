import { Router, Request, Response } from 'express';
import mysql from 'mysql';
import bcrypt from 'bcrypt';
import pool from '../config/dbConnection';
import generateToken from '../config/generateToken';


const saltround = 10;
const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});

userRouter.get('/details/:id', (req: Request, res: Response) => { // , next: NextFunction 
  
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
  
userRouter.post('/register', (req: Request, res: Response) => {
  
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

        bcrypt.hash(req.body.password, saltround, (error: any, hash: string) => {
            if(error){
                console.log('Entered an error: ', error);
                res.send({
                    success: false,
                    statusCode: 500,
                    message: 'Error during password encryption'
                }) 
                
                return;
            } else {
                // console.log('req.body: ' + req.body);
                let sqlQuery = `call registeruser(?,?,?)`;
        
                conn.query(sqlQuery, [req.body.email, req.body.phone, hash], (err: any, rows: any) => {
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
            }

        });  
      
    });
});

userRouter.post('/login', (req: Request, res: Response) => {
  
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

        pool.query('SELECT password FROM users WHERE email=?', [req.body.email], (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }

            console.log("hashed password from DB --> " + rows[0].password);
            const passwordfromDB = rows[0].password;
            bcrypt.compare(req.body.password, passwordfromDB, (err, result) => {
                if(err){
                    res.send({
                        message: "Failed",
                        statusCode: 500,
                        data: err
                    });
                }

                if(result){
                    res.send({
                        message: "Success",
                        statusCode: 200,
                        data: { token: generateToken(req.body.email) }
                    });
                } else {
                    res.send({
                        message: "Failed",
                        statusCode: 500,
                        data: err
                    });
                }
            });
            
            conn.release();  // close connection
        });           
    });
});

export default userRouter;