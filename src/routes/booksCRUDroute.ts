import { Router, Request, Response } from 'express';
import pool from '../config/dbConnection';
import authenticate from '../config/authentication';


const CRUDrouter = Router();

CRUDrouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});

//////////////////// GET ALL BOOKS ///////////////////////////
CRUDrouter.get('/all', authenticate, (req: Request, res: Response) => {

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

        const sqlQuery = 'SELECT * FROM books';
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


//////////////////// GET BOOK BY ID ///////////////////////////
CRUDrouter.get('/isbn/:isbn', authenticate, (req: Request, res: Response) => { 
  
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
  
        console.log('isbn from req.params: ' + req.params.isbn);
  
        pool.query('SELECT * FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }
    
            if(rows.length < 1){   // selected isbn dont exist
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


//////////////////// ADD TO BOOKS ///////////////////////////
CRUDrouter.post('/add', authenticate, (req: Request, res: Response) => { 
  
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

        console.log('isbn from req.body: ' + req.body.isbn);
  
        pool.query('SELECT * FROM books WHERE isbn=?', [req.body.isbn], (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }
    
            if(rows.length >= 1){   // ISBN already exists
                conn.release();

                return res.send({
                    message: 'Book with ISBN already exists',
                    statusCode: 409,
                });
            } else {
                const sqlQuery = `INSERT INTO books(isbn, title, author, year_published) VALUES (?,?,?,?)`;
                const { isbn, title, author, yearPublished } = req.body;

                pool.query(sqlQuery, [isbn, title, author, yearPublished], (err: any, rows: any) => {
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

//////////////////// UPDADE BOOK BY ISBN ///////////////////////////
CRUDrouter.put('/update/:isbn', authenticate, (req: Request, res: Response) => { 
  
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

        // console.log('isbn from req.params: ' + req.params.isbn);
  
        pool.query('SELECT * FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }
    
            if(rows.length < 1){   // ISBN already exists
                conn.release();

                return res.send({
                    message: 'Book with ISBN not found',
                    statusCode: 404,
                });
            }  

            const sqlQuery = `UPDATE books SET title=?, author=?, year_published=? WHERE isbn=?`;
            const { title, author, yearPublished } = req.body;
            const { isbn } = req.params;

            pool.query(sqlQuery, [ title, author, yearPublished, isbn], (err: any, rows: any) => {
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
                    // data: rows     // returns result from update query
                    data: { isbn, title, author, yearPublished }
                });
        
                conn.release();   // close connection
            });            
    
        });
      
    });
}); 


//////////////////// DELETE BOOK BY ISBN ///////////////////////////
CRUDrouter.delete('/delete/:isbn', authenticate, (req: Request, res: Response) => { 
  
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

        // console.log('isbn from req.params: ' + req.params.isbn);
  
        pool.query('DELETE FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
            if(err){
                console.log('Encountered an error: ', err);
                conn.release();
        
                return res.send({
                    success: false,
                    statusCode: 400
                });      
            }

            /*
                This method can also be used in UPDATE, instead of SELECT query before UPDATE, 
                you can run UPDATE query once and check for changedRows/affectedRows; if 0 rows
                changed/updated, conclude that no row with that isbn id was found
            
            */
    
            if(rows.affectedRows < 1){   // means nothing was deleted
                conn.release();

                return res.send({
                    message: 'Book with ISBN not found',
                    statusCode: 404,
                });
            }  

            res.send({
                message: 'Deleted Successully',
                statusCode: 200,
                // data: rows
            });
    
            conn.release();   // close connection           
    
        });
      
    });
}); 

export default CRUDrouter;