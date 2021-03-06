import { equals } from "../equals/equals-schema";
import { number } from "../number/number-schema";
import { objectOf } from "../object/object-of-schema";
import { InferType, Schema } from "../schema";
import { string } from "../string/string-schema";
import { array } from "./array-schema";

describe("Array Schema", () => {
  const objSchema: Schema<{ [key: string]: "a" | "b" } | undefined | null> =
    objectOf(equals(["a", "b"] as const).required());

  const arraySchema = array(objSchema);

  const schema: Schema<Array<InferType<typeof objSchema>> | undefined | null> =
    arraySchema;

  it("Should pass with correct values", () => {
    expect(schema.validate([undefined, undefined])).toEqual({
      errors: false,
      value: [undefined, undefined],
    });

    expect(schema.validate([undefined, { someProp: "a" }])).toEqual({
      errors: false,
      value: [undefined, { someProp: "a" }],
    });
  });

  it("Should fail when input is not an array", () => {
    expect(schema.validate(4)).toEqual({
      errors: true,
      messagesTree: ["Must be an array"],
    });
  });

  it("Should fail with wrong values", () => {
    expect(schema.validate([undefined, undefined, { someProp: "c" }])).toEqual({
      errors: true,
      messagesTree: [
        {
          2: [{ someProp: ["Must be one of the allowed values"] }],
        },
      ],
    });
  });

  it("Should fail if array length is over maximum", () => {
    expect(arraySchema.max(1).validate([undefined, undefined])).toEqual({
      errors: true,
      messagesTree: ["Cannot have more than 1 item"],
    });
  });

  it("Should fail if array length is below minimum", () => {
    expect(arraySchema.min(1).validate([])).toEqual({
      errors: true,
      messagesTree: ["Must have at least 1 item"],
    });
  });

  it("Should transform undefined into empty array", () => {
    const schema: Schema<string[]> = array(string().required())
      .wrapIfNotAnArray()
      .required();

    const result = schema.validate(undefined);

    expect(result).toEqual({
      errors: false,
      value: [],
    });
  });

  it("Should wrap string value in an array", () => {
    const schema: Schema<string[]> = array(string().required())
      .wrapIfNotAnArray()
      .required();

    const result = schema.validate("hello");

    expect(result).toEqual({
      errors: false,
      value: ["hello"],
    });
  });

  it("Should convert null and undefined to empty array", () => {
    const schema: Schema<null[]> = array(
      equals([null]).required()
    ).wrapIfNotAnArray();

    const result = schema.validate(null);

    expect(result).toEqual({
      errors: false,
      value: [],
    });
  });

  it("should return cloned array when validating it", () => {
    const ar = [1, 2, 3];

    const schema = array(number().required()).required();

    const validationResult = schema.validate(ar);

    if (validationResult.errors) {
      throw new Error();
    }

    expect(validationResult.value).not.toBe(ar);
  });
});
