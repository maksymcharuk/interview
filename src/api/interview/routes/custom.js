module.exports = {
  routes: [
    {
      method: "POST",
      path: "/interviews/update-question",
      handler: "interview.updateQuestion",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
