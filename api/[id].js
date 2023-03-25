export default function handler(req, res) {
    res.statusCode = 200;
    const id = request.query.id;

    res.setHeader('Content-Type', 'application/json');
    res.json({ name: 'John Doe', id: id });
  }