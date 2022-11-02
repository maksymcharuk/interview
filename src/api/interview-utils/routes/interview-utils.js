module.exports = {
  routes: [
    {
      method: "POST",
      path: "/interview-utils/create-interview-from-template",
      handler: "interview-utils.createInterviewFromTemplate",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
