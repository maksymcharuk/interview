"use strict";

/**
 * A set of functions called "actions" for `interview-utils`
 */

const validateRequired = (data, fields) => {
  fields.forEach((key) => {
    if (
      (fields.includes(key) && data[key] == null) ||
      data[key] === undefined
    ) {
      throw new Error(`Missing required property ${key}`);
    }
  });
};

module.exports = {
  createInterviewFromTemplate: async (ctx, next) => {
    const { templateId, candidateId, projectId, notes } = ctx.request.body.data;
    validateRequired(ctx.request.body.data, [
      "templateId",
      "candidateId",
      "projectId",
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
};
