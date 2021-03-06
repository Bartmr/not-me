import { Schema } from "../schema";
import { equals } from "./equals-schema";

describe("Equals Schema", () => {
  it("Should accept input when it matches allowed values", () => {
    const schema = equals(["a"] as const).required();

    const result = schema.validate("a");

    if (result.errors) {
      throw new Error();
    } else {
      const value: "a" = result.value;

      expect(value).toBe(value);
    }
  });

  it("Should reject input when it does not match allowed values", () => {
    const schema: Schema<"a"> = equals(["a"] as const).required();

    const result = schema.validate("b");

    expect(result).toEqual({
      errors: true,
      messagesTree: ["Must be one of the allowed values"],
    });
  });
});
