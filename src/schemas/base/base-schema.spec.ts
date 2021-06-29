import { number } from "../number/number-schema";
import { object } from "../object/object-schema";

describe("Base Schema", () => {
  it("Fail with multiple error messages", () => {
    const schema = object({
      a: number()
        .integer()
        .required()
        .test((v) => (v < 1000 ? null : "Must be smaller than 1000")),
    }).required();

    expect(schema.validate({ a: 1000.1 }, { abortEarly: false })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input must be an integer", "Must be smaller than 1000"],
      },
    });
  });

  it("Fail with single error message on abort early", () => {
    const schema = object({
      a: number()
        .integer()
        .required()
        .test((v) => (v < 1000 ? null : "Must be smaller than 1000")),
    }).required();

    expect(schema.validate({ a: 1000.1 }, { abortEarly: true })).toEqual({
      errors: true,
      messagesTree: {
        a: ["Input must be an integer"],
      },
    });
  });

  it("Send transformed value to chained validations that follow", () => {
    const schema = number()
      .integer()
      .transform(() => true)
      .test((v) => (v === true ? null : "Must be true"));

    expect(schema.validate(1, { abortEarly: true })).toEqual({
      errors: false,
      value: true,
    });
  });

  it("Schemas that call required() should stop the value from continuing the validation chain", () => {
    const lastTransform = jest.fn();

    const schema = number().integer().required().test(lastTransform);

    schema.validate(undefined, { abortEarly: false });

    expect(lastTransform).not.toHaveBeenCalled();
  });
});
