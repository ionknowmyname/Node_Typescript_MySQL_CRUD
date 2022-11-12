import { Router, Request, Response } from 'express';
import axios from 'axios';
import bcrypt from 'bcrypt';
import pool from '../config/dbConnection';
import generateToken from '../config/generateToken';
import authenticate from '../config/authentication';
var cacheService = require("express-api-cache");
var cache = cacheService.cache;


const saltround = 10;
const userRouter = Router();

userRouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});

userRouter.get('/all', authenticate, cache("10 minutes"), (req: Request, res: Response) => {

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

        const sqlQuery = 'SELECT id, email, phone, createdAt FROM users';
        pool.query(sqlQuery, (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }
    
            if(rows.length < 1){  // DB table is empty
                return res.send({
                    message: 'No Data found',
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
                let sqlQuery = `call registeruser(?,?,?)`;  // stored procedure on phpmyadmin
        
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

//////////////////// BULK ADD BOOKS ///////////////////////////
userRouter.post('/register-bulk', authenticate, (req: Request, res: Response) => { 
    for (let i = 10; i < 17; i++) {
        axios.post('http://localhost:5000/users/register', {
            email: `testbulk${i++}@gmail.com`,
            phone: `44444${i++}9999`,
            password: 'Testing123',
        })
        .then((response) => {
            console.log('response from axios -->' + response);    
        })
        .catch((error) => {
            console.log('error from axios -->' + error);    
        });
        
    }

    res.send({
        message: 'Success',
        statusCode: 200,
    });
});

export default userRouter;