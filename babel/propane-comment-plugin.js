'use strict';

module.exports = function propaneCommentPlugin() {
  return {
    name: 'propane-comment-plugin',
    visitor: {
      Program(path) {
        const existing = (path.node.leadingComments || []).some(
          (comment) => comment.value.trim() === 'transpiled'
        );

        if (!existing) {
          path.addComment('leading', ' transpiled', true);
        }
      },
    },
  };
};
