import express from 'express';
import { Request, Response } from 'express';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('Its working');
})

app.post('/', (req: Request, res: Response) => {
  res.send({ data: req.body });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});