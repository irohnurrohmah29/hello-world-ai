function createProblemDetails({ status, code, title, detail, instance, errors }) {
  const problem = {
    type: `https://api.example.com/problems/${code.toLowerCase().replace(/_/g, "-")}`,
    title,
    status,
    detail,
    instance,
    code
  };

  if (errors?.length) problem.errors = errors;
  return problem;
}

module.exports = { createProblemDetails };
