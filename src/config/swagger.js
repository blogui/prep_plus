const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Prep Plus Test Series API",
      version: "0.1.0",
      description:
        "This is a Test series for Prep Plus application backend",
    
      contact: {
        name: "Prep Plus",
        url: "https://prepplus.online",
        email: "info@email.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: [__dirname + '/../routes/*.js'],
};

module.exports=options;