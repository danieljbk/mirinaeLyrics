import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  console.log('hi');
});

console.log(1);

router.post('/', async (req, res) => {
  console.log('request received');
  console.log(req.body);
  res.status(200).send(req.body.data);
});

export default router;
