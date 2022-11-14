"use strict";

/**
 * interview controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::interview.interview",
  ({ strapi }) => ({
    async updateQuestion(ctx) {
      const { interviewId, questionId, data } = ctx.request.body;
      let interview;

      try {
        interview = await strapi
          .service("api::interview.interview")
          .findOne(interviewId, {
            populate: {
              interviewProcess: {
                populate: {
                  blocks: {
                    populate: {
                      questions: true,
                    },
                  },
                },
              },
            },
          });
      } catch (error) {
        throw new Error(error);
      }

      let interviewProcessScore = 0;
      interview.interviewProcess.blocks.forEach((block) => {
        let blockScore = 0;
        block.questions.forEach((q) => {
          if (q.id === questionId) {
            q.notes = data.notes;
            q.score = data.score;
          }
          blockScore += q.score;
        });
        block.score = blockScore;
        interviewProcessScore += blockScore;
      });
      interview.interviewProcess.score = interviewProcessScore;

      const interviewProcessId = interview.interviewProcess.id;
      delete interview.interviewProcess.id;

      await strapi
        .service("api::interview-process.interview-process")
        .update(interviewProcessId, {
          data: interview.interviewProcess,
        });

      return await strapi
        .service("api::interview.interview")
        .findOne(interviewId, {
          populate: {
            project: true,
            candidate: true,
            interviewProcess: {
              populate: {
                blocks: {
                  populate: {
                    questions: true,
                  },
                },
              },
            },
          },
        });
    },
  })
);
