import { Schema } from "../schema";
import { number } from "./number-schema";

describe("Number Schema", () => {
  it("Fail with unparsable number string", () => {
    const schema: Schema<number> = number().required();

    expect(schema.validate("abc")).toEqual({
      errors: true,
      messagesTree: ["Input must be a number"],
    });
  });

  it("Parsable number string", () => {
    const schema: Schema<number> = number().required();

    expect(schema.validate("123.3")).toEqual({
      errors: false,
      value: 123.3,
    });
  });

  it("Let undefined pass an integer check, if number is not required", () => {
    const schema: Schema<number | undefined | null> = number().integer();

    expect(schema.validate(undefined)).toEqual({
      errors: false,
      value: undefined,
    });
  });
});
