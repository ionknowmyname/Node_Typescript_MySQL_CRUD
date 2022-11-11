import express, { Request, Response } from 'express';
import dotenv from 'dotenv'

import routes from './routes'; 

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);



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