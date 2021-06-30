export type DefaultErrorMessages = Partial<{
  object: Partial<{
    notAnObject: string;
  }>;
  array: Partial<{
    notAnArray: string;
    lessThanMinimum: (minLength: number) => string;
    moreThanMaximum: (maxLength: number) => string;
  }>;
  base: Partial<{
    isNull: string;
    isUndefined: string;
  }>;
  equals: Partial<{
    notEqual: string;
  }>;
  number: Partial<{
    notANumber: string;
    isNotInteger: string;
  }>;
  string: Partial<{
    notAString: string;
    notFilled: string;
  }>;
  date: Partial<{
    notADate: string;
    invalidDate: string;
  }>;
  boolean: Partial<{
    notABoolean: string;
  }>;
  null: Partial<{
    notNull: string;
  }>;
}>;