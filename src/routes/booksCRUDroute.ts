import { Router, Request, Response } from 'express';
import axios from 'axios';
import pool from '../config/dbConnection';
import authenticate from '../config/authentication';
var cacheService = require("express-api-cache");
var cache = cacheService.cache;


const CRUDrouter = Router();

CRUDrouter.get('/', (req: Request, res: Response) => {
    return res.json("OK");
});


//////////////////// GET ALL BOOKS ///////////////////////////
CRUDrouter.get('/all', authenticate, cache("10 minutes"), (req: Request, res: Response) => {
    console.log("(<any>req).user from Books: " + (<any>req).user);

    const sqlQuery = 'SELECT * FROM books';
    pool.query(sqlQuery, (err: any, rows: any) => {
        if(err){
            console.log('Encountered an error: ', err);
    
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

        // pool.query closes connection by itself  
    });

});


//////////////////// GET BOOK BY ID ///////////////////////////
CRUDrouter.get('/isbn/:isbn', authenticate, (req: Request, res: Response) => { 
   
    console.log('isbn from req.params: ' + req.params.isbn);

    pool.query('SELECT * FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
        if(err){
            console.log('Encountered an error: ', err);
    
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

        // pool.query closes connection by itself  
    });
}); 


//////////////////// ADD TO BOOKS ///////////////////////////
CRUDrouter.post('/add', authenticate, (req: Request, res: Response) => { 
  
    pool.query('SELECT * FROM books WHERE isbn=?', [req.body.isbn], (err: any, rows: any) => {
        if(err){
            console.log('Encountered an error: ', err);            
    
            return res.send({
                success: false,
                statusCode: 400
            });      
        }

        if(rows.length >= 1){   // ISBN already exists                

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
        
                // pool.query closes connection by itself                   
            });
        }

    });
}); 

//////////////////// UPDADE BOOK BY ISBN ///////////////////////////
CRUDrouter.put('/update/:isbn', authenticate, (req: Request, res: Response) => { 
  
    // console.log('isbn from req.params: ' + req.params.isbn);
  
    pool.query('SELECT * FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
        if(err){
            console.log('Encountered an error: ', err);
    
            return res.send({
                success: false,
                statusCode: 400
            });      
        }

        if(rows.length < 1){   // ISBN already exists

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
    
            // pool.query closes connection by itself  
        });            
    });      
}); 


//////////////////// DELETE BOOK BY ISBN ///////////////////////////
CRUDrouter.delete('/delete/:isbn', authenticate, (req: Request, res: Response) => { 
  
    

    // console.log('isbn from req.params: ' + req.params.isbn);
  
    pool.query('DELETE FROM books WHERE isbn=?', [req.params.isbn], (err: any, rows: any) => {
        if(err){
            console.log('Encountered an error: ', err);
    
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

        // pool.query closes connection by itself         

    });  
}); 


//////////////////// BULK ADD BOOKS ///////////////////////////
CRUDrouter.post('/add-bulk', authenticate, (req: Request, res: Response) => { 
    for (let i = 17; i < 25; i++) {
        axios.post('http://localhost:5000/books/add', {
            // isbn: `${i.toString().repeat(10)}`,
            isbn: `5555${i++}66666`,
            title: `Test title ${i++}`,
            author: `Test Author ${i++}`,
            yearPublished: 2022
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

export default CRUDrouter;