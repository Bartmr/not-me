import { throwError } from "../../utils/throw-error";
import {
  ValidationResult,
  Schema,
  ValidationOptions,
  AcceptedValueValidationResult,
  InferType,
} from "../schema";

enum FilterType {
  BaseType = "base-type",
  Shape = "shape",
  Test = "test",
  Transform = "transform",
  UndefinedCatching = "undefined-catching",
}

type BaseTypeFilter<BaseType> = {
  type: FilterType.BaseType;
  filterFn: (
    input: unknown,
    options: ValidationOptions
  ) => ValidationResult<BaseType>;
};

type ShapeFilter<Type> = {
  type: FilterType.Shape;
  filterFn: (input: Type, options: ValidationOptions) => ValidationResult<Type>;
};

type TestFilter<V> = {
  type: FilterType.Test;
  filterFn: (value: V) => null | string;
};

type TransformFilter<V, R> = {
  type: FilterType.Transform;
  filterFn: (value: V) => R;
};

type UndefinedCatchingFilter = {
  type: FilterType.UndefinedCatching;
  message: string;
};

export abstract class BaseSchema<
  BaseType,
  Shape extends BaseType = BaseType,
  _Output = Shape | undefined
> implements Schema<_Output> {
  _outputType!: _Output;

  protected wrapValueBeforeValidation?: (input: unknown) => unknown;

  private baseTypeFilter: BaseTypeFilter<BaseType>;
  private shapeFilters: ShapeFilter<BaseType>[] = [];
  private otherFilters: Array<
    | TestFilter<InferType<this>>
    | TransformFilter<InferType<this>, unknown>
    | UndefinedCatchingFilter
  > = [];

  protected mapMode?: boolean;

  constructor(typeFilterFn: BaseTypeFilter<BaseType>["filterFn"]) {
    this.baseTypeFilter = {
      type: FilterType.BaseType,
      filterFn: typeFilterFn,
    };
  }

  protected addShapeFilter(filterFn: ShapeFilter<BaseType>["filterFn"]): void {
    this.shapeFilters.push({
      type: FilterType.Shape,
      filterFn,
    });
  }

  validate(
    input: unknown,
    options?: ValidationOptions
  ): ValidationResult<_Output> {
    const _options: ValidationOptions = {
      // Use typeof to avoid 'process is not defined' error
      abortEarly: typeof process === "undefined" ? false : true,
      ...options,
    };

    let _currentValue = input;

    if (this.wrapValueBeforeValidation) {
      _currentValue = this.wrapValueBeforeValidation(_currentValue);
    }

    if (_currentValue !== undefined) {
      /*
        BASE TYPE FILTER
      */

      const typeFilterResponse = this.baseTypeFilter.filterFn(
        _currentValue,
        _options
      );

      if (typeFilterResponse.errors) {
        return typeFilterResponse;
      } else {
        _currentValue = typeFilterResponse.value;
      }

      /*
        SHAPE FILTERS
      */

      let shapedValue: BaseType;

      if (this.mapMode) {
        shapedValue = {} as BaseType;
        let shapedValueWithUnknownProperties = _currentValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(
            shapedValueWithUnknownProperties,
            _options
          );

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = Object.assign(shapedValue, filterRes.value);
            shapedValueWithUnknownProperties = Object.assign(
              shapedValueWithUnknownProperties,
              filterRes.value
            );
          }
        }
      } else {
        shapedValue = _currentValue as BaseType;

        for (let i = 0; i < this.shapeFilters.length; i++) {
          const shapeFilter = this.shapeFilters[i] || throwError();

          const filterRes = shapeFilter.filterFn(shapedValue, _options);

          if (filterRes.errors) {
            return filterRes;
          } else {
            shapedValue = filterRes.value;
          }
        }
      }

      _currentValue = shapedValue;
    }

    /*
      OTHER FILTERS
    */
    const testFiltersErrors: string[] = [];

    for (const filter of this.otherFilters) {
      if (filter.type === FilterType.Test) {
        const result = filter.filterFn(_currentValue as InferType<this>);

        if (result === null) {
          continue;
        } else {
          if (_options.abortEarly) {
            return {
              errors: true,
              messagesTree: [result],
            };
          } else {
            testFiltersErrors.push(result);
            continue;
          }
        }
      } else if (filter.type === FilterType.Transform) {
        _currentValue = filter.filterFn(_currentValue as InferType<this>);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (filter.type === FilterType.UndefinedCatching) {
        if (_currentValue === undefined) {
          return {
            errors: true,
            messagesTree: [filter.message],
          };
        }

        continue;
      } else {
        throw new Error();
      }
    }

    if (testFiltersErrors.length > 0) {
      return {
        errors: true,
        messagesTree: testFiltersErrors,
      };
    }

    return {
      errors: false,
      value: _currentValue,
    } as AcceptedValueValidationResult<InferType<this>>;
  }

  protected markAsRequiredInternally(message: undefined | string): void {
    this.otherFilters.push({
      type: FilterType.UndefinedCatching,
      message: message ?? "Input is required",
    });
  }

  public abstract required(message?: string): Schema<Shape>;

  test(testFunction: (value: _Output) => null | string): this {
    this.otherFilters.push({
      type: FilterType.Test,
      filterFn: testFunction,
    });

    return this;
  }

  transform<TransformFunction extends (value: _Output) => unknown>(
    transformFunction: TransformFunction
  ): Schema<ReturnType<TransformFunction>> {
    this.otherFilters.push({
      type: FilterType.Transform,
      filterFn: transformFunction,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
    return this as any;
  }
}
