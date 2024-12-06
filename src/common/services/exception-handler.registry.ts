/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { Injectable } from '@nestjs/common';

// Define a specific type for the exception class or constructor
type ExceptionConstructor = new (...args: any[]) => Error;

// Define a specific type for the handler function
type ExceptionHandlerFunction = (exception: Error) => void;
@Injectable()
export class ExceptionHandlerRegistry {
  private readonly handlers: Map<
    ExceptionConstructor,
    ExceptionHandlerFunction
  > = new Map();

  register(
    exceptionType: ExceptionConstructor,
    handler: ExceptionHandlerFunction,
  ) {
    this.handlers.set(exceptionType, handler);
  }

  getHandler(exception: Error): ExceptionHandlerFunction | undefined {
    const handler = Array.from(this.handlers.entries()).find(
      ([key]) => exception instanceof key,
    );
    return handler ? handler[1] : undefined;
  }
}
