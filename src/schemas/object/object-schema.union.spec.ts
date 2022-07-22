import { boolean } from "../boolean/boolean-schema";
import { equals } from "../equals/equals-schema";
import { number } from "../number/number-schema";
import { ValidationResult, InferType, Schema } from "../schema";
import { string } from "../string/string-schema";
import { object } from "./object-schema";

describe("Object Schema - Union", () => {
  describe("Simple Union", () => {
    const schema: Schema<
      { common: string } & ({ a: "a"; c: number } | { a: "b"; d: boolean })
    > = object({
      common: equals(["common"]).required(),
      a: equals(["a", "b"] as const).required(),
    })
      .union((v) => {
        if (v.a === "a") {
          return {
            a: equals(["a"] as const).required(),
            c: equals([0]).required(),
          };
        } else {
          return {
            a: equals(["b"] as const).required(),
            d: equals([false]).required(),
          };
        }
      })
      .required();

    it("valid", () => {
      type Expected = InferType<typeof schema>;

      const input: Expected = { common: "common", a: "a", c: 0 };

      const result: ValidationResult<Expected> = schema.validate(input);

      if (result.errors) {
        throw new Error();
      } else {
        const value: Expected = result.value;

        expect(value).toEqual({ common: "common", a: "a", c: 0 });
      }
    });

    it("valid 2", () => {
      type Expected = InferType<typeof schema>;

      const input: Expected = { common: "common", a: "b", d: false };
      const result = schema.validate(input);

      if (result.errors) {
        throw new Error();
      } else {
        const value: Expected = result.value;

        expect(value).toEqual({ common: "common", a: "b", d: false });
      }
    });

    it("valid 3", () => {
      type Expected = InferType<typeof schema>;

      const input = { common: "common", a: "b", c: 0, d: false };
      const result = schema.validate(input);

      if (result.errors) {
        throw new Error();
      } else {
        const value: Expected = result.value;

        expect(value).toEqual({ common: "common", a: "b", d: false });
      }
    });

    it("errors", () => {
      const input = { common: "common", a: "b", c: 0 };

      const result = schema.validate(input);

      expect(result).toEqual({
        errors: true,
        messagesTree: [
          {
            d: ["Required"],
          },
        ],
      });
    });

    it("errors 2", () => {
      const input = { common: "common", a: "b", d: 0 };

      const result = schema.validate(input);

      expect(result).toEqual({
        errors: true,
        messagesTree: [
          {
            d: ["Must be one of the allowed values"],
          },
        ],
      });
    });

    it("Unions should not disrupt nullabilty type of result", () => {
      const schema: Schema<
        | {
            a: true;
            b: number;
          }
        | {
            a?: false | null;
            c: string;
          }
      > = object({
        a: boolean(),
      })
        .required()
        .union((v) => {
          if (v.a) {
            return {
              a: equals([true]).required(),
              b: number().required(),
            };
          } else {
            return {
              a: equals([false]),
              c: string().required(),
            };
          }
        });

      // NO-OP test
      expect(!!schema).toBe(true);
    });
  });

  it("should return cloned objects when validating them", () => {
    const obj = { type: "a", nestedObj: { type: "a", hello: "world" } };

    const schema = object({ type: equals(["a", "b"] as const).required() })
      .required()
      .union((value) => {
        if (value.type === "a") {
          return {
            type: equals(["a"] as const).required(),
            nestedObj: object({ type: equals(["a", "b"] as const).required() })
              .required()
              .union((value) => {
                if (value.type === "a") {
                  return {
                    type: equals(["a"] as const).required(),
                    hello: equals(["world"]).required(),
                  };
                } else {
                  throw new Error();
                }
              }),
          };
        } else {
          throw new Error();
        }
      });

    const validationResult = schema.validate(obj);

    if (validationResult.errors) {
      throw new Error();
    }

    expect(validationResult.value).not.toBe(obj);
    expect(validationResult.value.nestedObj).not.toBe(obj.nestedObj);
  });

  it("should not run union callback when value is undefined or null", () => {
    const unionCallback = jest.fn();

    const schema = object({
      type: equals(["a", "b"] as const).required(),
    }).union(unionCallback);

    const undefinedValidationResult = schema.validate(undefined);
    const nullValidationResult = schema.validate(null);

    if (undefinedValidationResult.errors) {
      throw new Error();
    }

    if (nullValidationResult.errors) {
      throw new Error();
    }

    expect(unionCallback).not.toHaveBeenCalled();
  });

  it("should strip unknown fields", () => {
    const obj = {
      unknownField: "value",
      type: "a",
      nestedObj: { unknownField: "value", type: "a", hello: "world" },
    };

    const schema = object({ type: equals(["a", "b"] as const).required() })
      .required()
      .union((value) => {
        if (value.type === "a") {
          return {
            type: equals(["a"] as const).required(),
            nestedObj: object({ type: equals(["a", "b"] as const).required() })
              .required()
              .union((value) => {
                if (value.type === "a") {
                  return {
                    type: equals(["a"] as const).required(),
                    hello: equals(["world"]).required(),
                  };
                } else {
                  throw new Error();
                }
              }),
          };
        } else {
          throw new Error();
        }
      });

    const result = schema.validate(obj);

    expect(result).toEqual({
      errors: false,
      value: { type: "a", nestedObj: { type: "a", hello: "world" } },
    });
  });

  it("Shoud keep previously validated values that are not set in the latest union() call", () => {
    const schema = object({
      a: string().required(),
      b: string().required(),
      discriminator1: equals(["c", "d"] as const).required(),
      discriminator2: equals(["e", "f"] as const).required(),
    })
      .required()
      .union((v) => {
        if (v.discriminator1 === "c") {
          return {
            discriminator1: equals(["c"] as const).required(),
            c: string().required(),
          };
        } else {
          return {
            discriminator1: equals(["d"] as const).required(),
            d: string().required(),
          };
        }
      })
      .union((v) => {
        if (v.discriminator2 === "e") {
          return {
            discriminator2: equals(["e"] as const).required(),
            e: string().required(),
          } as const;
        } else {
          return {
            discriminator2: equals(["f"] as const).required(),
            f: string().required(),
          } as const;
        }
      });

    const validationResult = schema.validate({
      a: "hello",
      b: "world",
      discriminator1: "c",
      c: "hello",
      discriminator2: "e",
      e: "world",
    });

    expect(validationResult).toEqual({
      errors: false,
      value: {
        a: "hello",
        b: "world",
        discriminator1: "c",
        c: "hello",
        discriminator2: "e",
        e: "world",
      },
    });
  });

  it("Shoud transform previously validated values if latest union() call says so", () => {
    const schema = object({
      a: number().required(),
      discriminator1: equals(["c", "d"] as const).required(),
    })
      .union((v) => {
        if (v.discriminator1 === "c") {
          return {
            a: number()
              .required()
              .transform(() => "hello"),
            discriminator1: equals(["c"] as const).required(),
            c: string().required(),
          };
        } else {
          return {
            a: number()
              .required()
              .transform(() => "hello"),
            discriminator1: equals(["d"] as const).required(),
            d: string().required(),
          };
        }
      })
      .required();

    const validationResult = schema.validate({
      a: 1,
      discriminator1: "c",
      c: "hello",
    });

    if (validationResult.errors) {
      throw new Error();
    }

    const value: { a: string } & (
      | { discriminator1: "c"; c: string }
      | { discriminator1: "d"; c?: undefined }
    ) = validationResult.value;

    expect(value).toEqual({
      a: "hello",
      discriminator1: "c",
      c: "hello",
    });
  });
});
