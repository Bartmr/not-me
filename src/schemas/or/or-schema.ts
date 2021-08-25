import { BaseSchema } from "../base/base-schema";
import { InferType, Schema } from "../schema";
import { AnyErrorMessagesTree } from "../../error-messages/error-messages-tree";

type ValuesSchemasBase = [Schema<unknown>, ...Array<Schema<unknown>>];

class OrSchemaImpl<
  ValuesSchemas extends ValuesSchemasBase,
  _Shape = InferType<ValuesSchemas[number]>,
  _Output = _Shape | undefined | null
> extends BaseSchema<_Shape, _Shape, _Output> {
  constructor(valuesSchemas: ValuesSchemas) {
    if (valuesSchemas.length === 0) {
      throw new Error("No schemas provided");
    }

    super((input, options) => {
      let acceptedResultValue: unknown;
      let isValid = false;
      let errorsFromSchemaIteration: AnyErrorMessagesTree = [];

      for (const schema of valuesSchemas) {
        const result = schema.validate(input, options);

        if (result.errors) {
          errorsFromSchemaIteration = errorsFromSchemaIteration.concat(
            result.messagesTree
          );
          continue;
        } else {
          acceptedResultValue = result.value;
          isValid = true;
          break;
        }
      }

      if (isValid) {
        return {
          errors: false,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          value: acceptedResultValue as any,
        };
      } else {
        return {
          errors: true,
          messagesTree: errorsFromSchemaIteration,
        };
      }
    });
  }

  required(
    message?: string
  ): OrSchemaImpl<
    ValuesSchemas,
    Exclude<_Shape, undefined | null>,
    Exclude<_Shape, undefined | null>
  > {
    this.markAsRequiredInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  notNull(
    message?: string
  ): OrSchemaImpl<
    ValuesSchemas,
    Exclude<_Shape, null>,
    Exclude<_Output, null>
  > {
    this.markAsNotNullInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }

  defined(
    message?: string
  ): OrSchemaImpl<
    ValuesSchemas,
    Exclude<_Shape, undefined>,
    Exclude<_Output, undefined>
  > {
    this.markAsDefinedInternally(message);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}

export class OrSchema<
  ValuesSchemas extends ValuesSchemasBase
> extends OrSchemaImpl<ValuesSchemas> {}

export function or<ValuesSchemas extends ValuesSchemasBase>(
  valuesSchemas: ValuesSchemas
): OrSchema<ValuesSchemas> {
  return new OrSchema<ValuesSchemas>(valuesSchemas);
}
