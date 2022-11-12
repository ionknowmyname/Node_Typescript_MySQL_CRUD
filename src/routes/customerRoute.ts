import { Router, Request, Response } from 'express'
import pool from '../config/dbConnection';
import authenticate from '../config/authentication';


const customerRouter = Router();

customerRouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});

customerRouter.get('/details/:id', authenticate, (req: Request, res: Response) => { // , next: NextFunction 
  
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
    
            if(rows.length < 1){   // selected customerNumber dont exist
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

export default customerRouter;