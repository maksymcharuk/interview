"use strict";

/**
 * interview controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const validateRequired = (data, fields) => {
  fields.forEach((key) => {
    if (fields.includes(key) && !data[key]) {
      throw new Error(`Missing required property ${key}`);
    }
  });
};

module.exports = createCoreController(
  "api::interview.interview",
  ({ strapi }) => ({
    async create(ctx) {
      const { templateId, candidateId, projectId, notes } = ctx.request.body;
      validateRequired(ctx.request.body, [
        "templateId",
        "candidateId",
        "projectId",
        "notes",
      ]);
      const entity = await strapi
        .service("api::interview-template.interview-template")
        .findOne(templateId, {
          populate: {
            blocks: {
              populate: {
                questions: true,
              },
            },
            tags: true,
          },
        });

      try {
        await strapi.service("api::candidate.candidate").findOne(candidateId);
      } catch (error) {
        throw new Error(error);
      }

      try {
        await strapi.service("api::project.project").findOne(projectId);
      } catch (error) {
        throw new Error(error);
      }

      let { blocks } = entity;
      blocks.forEach((block) => {
        delete block.id;
        block.questions.forEach((question) => {
          delete question.id;
        });
      });
      const interviewProcess = await strapi
        .service("api::interview-process.interview-process")
        .create({ data: { blocks } });
      const interview = await strapi.service("api::interview.interview").create(
        {
          data: {
            interviewProcess: interviewProcess.id,
            candidate: candidateId,
            project: projectId,
            notes,
          },
        },
        { populate: "*" }
      );

      return interview;
    },
  })
);
