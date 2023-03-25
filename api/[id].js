export default function handler(req, res) {
    res.statusCode = 200;
    const id = req.query.id;

    res.setHeader('Content-Type', 'application/json');
    res.json({ name: 'John Doe', id: id });
  }