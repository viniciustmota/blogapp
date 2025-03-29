const mongoURI = process.env.NODE_ENV === 'production'
  ? "mongodb+srv://motaviny140:1234@blogapp-prod.51yv1sl.mongodb.net/blogapp?retryWrites=true&w=majority"
  : "mongodb://localhost/blogapp"


export default { mongoURI }
