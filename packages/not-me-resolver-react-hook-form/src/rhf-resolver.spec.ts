import { number } from "not-me/lib/schemas/number/number-schema";
import { object } from "not-me/lib/schemas/object/object-schema";
import { string } from "not-me/lib/schemas/string/string-schema";
import { rhfResolver } from "./rhf-resolver";
import {array} from "not-me/lib/schemas/array/array-schema";
import {ResolverResult} from "react-hook-form";

describe("React-Hook-Form resolver", () => {
  const schema = object({
    a: number().defined(),
    b: string().defined(),
    c: object({
      d: number().defined()
    }),
    e: object({
      f: object({
        g: string().defined()
      })
    }).defined(),
    h: array(object({
      h1: string().defined(),
      h2: number().defined()
    })).defined()
  }).defined();
  let resolver: (values: unknown) => (ResolverResult);

  beforeEach(() => {
    resolver = rhfResolver(schema) as (values: unknown) => (ResolverResult);
  })

  it("Return undefined if form value is valid", () => {
    const test = {
      a: 2,
      b: 'string',
      c: {
        d: 666
      },
      e: {
        f: {
          g: 'also a string'
        }
      },
      h: [{ h1: 'string in array', h2: 1 }, { h1: 'another string in array', h2: 2 }]
    }
    expect(resolver(test)).toEqual({ errors: {}, values: test });
  });

  it("Return a RhfError if form value is invalid", () => {
    const test = {
      a: "not a number",
      b: 666,
      c: {
        d: 'not a number as well'
      },
      e: {
        f: {
          g: 2
        }
      },
      h: [{ h2: 'string in array', h1: 1 }, { h1: 'another string in array', h2: 2 }, { h2: 'string in array', h1: 1 }]
    }

    expect(resolver(test)).toEqual({
      errors: expect.objectContaining({
        a: expect.objectContaining({ message: expect.any(String) as unknown  }) as unknown,
        b: expect.objectContaining({ message: expect.any(String) as unknown  }) as unknown,
        'c.d': expect.objectContaining({ message: expect.any(String) as unknown  }) as unknown,
        'e.f.g': expect.objectContaining({ message: expect.any(String) as unknown  }) as unknown,
        'h.0.h1': expect.objectContaining({ message: expect.any(String) as unknown }) as unknown,
        'h.0.h2': expect.objectContaining({ message: expect.any(String) as unknown }) as unknown,
        'h.2.h1': expect.objectContaining({ message: expect.any(String) as unknown }) as unknown,
        'h.2.h2': expect.objectContaining({ message: expect.any(String) as unknown }) as unknown,
      }) as unknown,
      values: expect.objectContaining({}) as unknown
    });
  });
});
