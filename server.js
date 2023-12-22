//* This function is used when we want to run the server on a local machine
const app = require("./index");

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
