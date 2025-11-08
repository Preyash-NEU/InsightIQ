"use client";

import { ChangeEvent, FormEvent, useCallback, useMemo, useRef, useState } from "react";

type FieldError = {
  message?: string;
};

type FieldErrors<TFieldValues extends Record<string, unknown>> = Partial<
  Record<keyof TFieldValues & string, FieldError>
>;

type RegisterOptions<TFieldValues extends Record<string, unknown>, TName extends keyof TFieldValues & string> = {
  required?: string | boolean;
  minLength?: { value: number; message?: string };
  validate?: (value: TFieldValues[TName], values: TFieldValues) => string | null | undefined;
};

type UseFormOptions<TFieldValues extends Record<string, unknown>> = {
  defaultValues: TFieldValues;
};

type RegisteredField<TFieldValues extends Record<string, unknown>> = {
  name: keyof TFieldValues & string;
  options?: RegisterOptions<TFieldValues, keyof TFieldValues & string>;
};

function getValueFromEvent(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  return event.target.type === "checkbox"
    ? (event.target as HTMLInputElement).checked
    : event.target.value;
}

function evaluateRules<TFieldValues extends Record<string, unknown>, TName extends keyof TFieldValues & string>(
  value: TFieldValues[TName],
  values: TFieldValues,
  options?: RegisterOptions<TFieldValues, TName>,
): string | undefined {
  if (!options) {
    return undefined;
  }

  if (options.required && (value === undefined || value === null || value === "")) {
    return typeof options.required === "string"
      ? options.required
      : "This field is required";
  }

  if (
    options.minLength &&
    typeof value === "string" &&
    value.length < options.minLength.value
  ) {
    return options.minLength.message ?? `Must be at least ${options.minLength.value} characters`;
  }

  if (options.validate) {
    const message = options.validate(value, values);
    if (message) {
      return message;
    }
  }

  return undefined;
}

export function useForm<TFieldValues extends Record<string, unknown>>({
  defaultValues,
}: UseFormOptions<TFieldValues>) {
  const [values, setValues] = useState<TFieldValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors<TFieldValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registeredFields = useRef<Map<string, RegisteredField<TFieldValues>>>(
    new Map(),
  );

  const setFieldError = useCallback(
    (name: keyof TFieldValues & string, message?: string) => {
      setErrors((prev) => {
        if (!message) {
          if (!(name in prev)) {
            return prev;
          }

          const next = { ...prev };
          delete next[name];
          return next;
        }

        return {
          ...prev,
          [name]: { message },
        };
      });
    },
    [],
  );

  const register = useCallback(
    <TName extends keyof TFieldValues & string>(
      name: TName,
      options?: RegisterOptions<TFieldValues, TName>,
    ) => {
      registeredFields.current.set(name, { name, options });

      return {
        name,
        value: (values as TFieldValues)[name] ?? "",
        onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const newValue = getValueFromEvent(event);

          setValues((prev) => ({
            ...prev,
            [name]: newValue,
          }));
        },
        onBlur: () => {
          const message = evaluateRules(
            (values as TFieldValues)[name],
            values,
            options,
          );

          setFieldError(name, message);
        },
      };
    },
    [setFieldError, values],
  );

  const handleSubmit = useCallback(
    (onValid: (values: TFieldValues) => Promise<void> | void) =>
      async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();

        const nextErrors: FieldErrors<TFieldValues> = {};
        for (const { name, options } of registeredFields.current.values()) {
          const message = evaluateRules(
            values[name as keyof TFieldValues & string],
            values,
            options,
          );

          if (message) {
            nextErrors[name as keyof TFieldValues & string] = { message };
          }
        }

        if (Object.keys(nextErrors).length > 0) {
          setErrors(nextErrors);
          return;
        }

        setIsSubmitting(true);
        try {
          await onValid(values);
        } finally {
          setIsSubmitting(false);
        }
      },
    [values],
  );

  const setError = useCallback(
    (name: keyof TFieldValues & string, error: FieldError) => {
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [],
  );

  const reset = useCallback((nextValues?: Partial<TFieldValues>) => {
    setValues(() => ({
      ...defaultValues,
      ...nextValues,
    }));
    setErrors({});
  }, [defaultValues]);

  const formState = useMemo(
    () => ({
      errors,
      isSubmitting,
      isValid: Object.keys(errors).length === 0,
    }),
    [errors, isSubmitting],
  );

  return {
    register,
    handleSubmit,
    formState,
    setError,
    reset,
  };
}

export type UseFormReturn<TFieldValues extends Record<string, unknown>> = ReturnType<
  typeof useForm<TFieldValues>
>;
