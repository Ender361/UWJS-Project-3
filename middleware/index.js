// Basic starter middleware
export default function basicMiddleware(req, res, next) {
  // Example: log each request
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
}
