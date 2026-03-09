const validate = (schema) => {
  return (req, res, next) => {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const errors = [];

        result.error.issues.forEach((issue) => {
            const field = issue.path[0];
            errors[field] = issue.message;
        });

        return res.status(400).json({
            message: "Validation error",
            errors
        })
      }

      req.body = result.data;
      next();
  }
};

export {validate};