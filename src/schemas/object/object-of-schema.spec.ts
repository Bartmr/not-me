import { equals } from "../equals/equals-schema";
import { ValidationResult } from "../schema";
import { string } from "../string/string-schema";
import { objectOf } from "./object-of-schema";

describe("Object Of Schema", () => {
  const schema = objectOf(equals(["a"] as const).required()).required();

  it("valid", () => {
    const result: ValidationResult<{ [key: string]: "a" }> = schema.validate({
      b: "a",
    });

    expect(result).toEqual({
      errors: false,
      value: { b: "a" },
    });
  });

  it("errors", () => {
    const result: ValidationResult<{ [key: string]: "a" }> = schema.validate({
      b: "b",
    });

    expect(result).toEqual({
      errors: true,
      messagesTree: [
        {
          b: ["Input must be one of the allowed values"],
        },
      ],
    });
  });

  it("is not an object", () => {
    const result: ValidationResult<{ [key: string]: "a" }> =
      schema.validate(true);

    expect(result).toEqual({
      errors: true,
      messagesTree: ["Input must be an object"],
    });
  });

  it("should return cloned objects when validating them", () => {
    const obj = { nestedObj: { hello: "world" } };

    const schema = objectOf(objectOf(string().required())).required();

    const validationResult = schema.validate(obj);

    if (validationResult.errors) {
      throw new Error();
    }

    expect(validationResult.value).not.toBe(obj);
    expect(validationResult.value.nestedObj).not.toBe(obj.nestedObj);
  });
});
