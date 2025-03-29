const mongoURI = process.env.NODE_ENV === 'production'
    ? "mongodb+srv://motaviny140:1234@blogapp-prod.51yv1sl.mongodb.net/"
    : "mongodb://localhost/blogapp"

export default { mongoURI }
