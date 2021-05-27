import { ResolverResult, ResolverError, DeepMap, FieldError } from 'react-hook-form';
import { AnyErrorMessagesTree } from "not-me/lib/error-messages/error-messages-tree";
import { Schema } from "not-me/lib/schemas/schema";

type ErrorObject = { [key: string]: AnyErrorMessagesTree }

type FormErrorMessages = {[p: string]: AnyErrorMessagesTree};

const formatKey = (currentKey: string, key: string) => {
  if (currentKey === '')
    return key;
  return `${currentKey}.${key}`
}

export function messagesTreeToRhfErrors(formErrorMessagesTree: FormErrorMessages): ResolverError {

  const parseObject = (current: ErrorObject, currentKey = '', currentParsed = {} as unknown as ResolverError): ResolverError => {
    Object.keys(current).forEach((key: string) => {
      const field = current[key];
      const _key = formatKey(currentKey, key) as keyof ResolverError;
      if (field instanceof Array) {
        currentParsed[_key] = { message: field[0] }
      } else if (typeof field === 'object') {
        currentParsed = parseObject(field as ErrorObject, _key, currentParsed)
      }
    });
    return currentParsed;
  };

  return parseObject(formErrorMessagesTree);
}

export function rhfResolver<S extends Schema<unknown>>(schema: S) {
  return (values: unknown): undefined | ResolverResult<S> => {
    const result = schema.validate(values);
    if (result.errors) {
      if (result.messagesTree instanceof Array) {
        throw new Error(
          "Messages tree should be an object. Make sure you're using an object schema to validate your form."
        );
      } else {
        return {
          values: {},
          errors: messagesTreeToRhfErrors(result.messagesTree as FormErrorMessages) as unknown as DeepMap<S, FieldError>
        };
      }
    } else {
      return {
        values: {},
        errors: {}
      };
    }
  };
}
