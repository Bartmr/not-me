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

    expect(schema.validate({ a: 1000.1 })).toEqual({
      errors: true,
      messagesTree: [
        {
          a: ["Input must be an integer", "Must be smaller than 1000"],
        },
      ],
    });
  });

  it("Fail at the first failed condition when abortEarly is true", () => {
    const schema = object({
      a: number()
        .integer()
        .required()
        .test((v) => (v < 1000 ? null : "Must be smaller than 1000")),
    }).required();

    expect(schema.validate({ a: 1000.1 }, { abortEarly: true })).toEqual({
      errors: true,
      messagesTree: [
        {
          a: ["Input must be an integer"],
        },
      ],
    });
  });

  it("Send transformed value to validations that follow, even when abortEarly is true", () => {
    const schema = number()
      .integer()
      .transform(() => "transformed-value")
      .test((v) => (v === "transformed-value" ? null : "invalid"));

    expect(schema.validate(1, { abortEarly: true })).toEqual({
      errors: false,
      value: "transformed-value",
    });
  });

  it("Stop validating a value if it didn't pass the required() condition", () => {
    const lastTransform = jest.fn();

    const schema = number().integer().required().test(lastTransform);

    schema.validate(undefined);

    expect(lastTransform).not.toHaveBeenCalled();
  });

  it("require() should catch both null and undefined", () => {
    const schema = number().integer().required();

    const undefinedRes = schema.validate(undefined);

    expect(undefinedRes).toEqual({
      errors: true,
      messagesTree: ["Input is required"],
    });

    const nullRes = schema.validate(null);

    expect(nullRes).toEqual({
      errors: true,
      messagesTree: ["Input is required"],
    });
  });

  it("Should still consider a value as invalid if the first condition fails but the last one passes", () => {
    const schema = object({})
      .test(() => "Failed")
      .test(() => null);

    const res = schema.validate(null);

    expect(res).toEqual({
      errors: true,
      messagesTree: ["Failed"],
    });
  });

  it("Should still consider a value as invalid if the first condition passes but the last one fails", () => {
    const schema = object({})
      .test(() => null)
      .test(() => "Failed");

    const res = schema.validate(null);

    expect(res).toEqual({
      errors: true,
      messagesTree: ["Failed"],
    });
  });
});
