import { Schema } from "../schema";
import { string } from "./string-schema";

describe("String Schema", () => {
  it("Fail when value is not a string", () => {
    const schema: Schema<string> = string().required();

    expect(schema.validate({})).toEqual({
      errors: true,
      messagesTree: ["Input must be a string"],
    });
  });

  it("Fail when it's not filled string", () => {
    const schema: Schema<string> = string().filled().required();

    expect(schema.validate("   ")).toEqual({
      errors: true,
      messagesTree: ["Input must be filled"],
    });
  });
});
