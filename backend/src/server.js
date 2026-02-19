import express from 'express'
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/', (req, res) => {
    res.json({ message: "Backend work!!!!!!"});
});

app.listen(3000, () => {
    console.log('Started server on port 3000');
});