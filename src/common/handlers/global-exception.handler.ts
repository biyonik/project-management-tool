/* @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { BusinessException } from '../exceptions/business-exception';
import { ExceptionHandler } from '../decorators/exception-handlers';
import { ErrorResponse } from '../dto/error-response.dto';
import { ValidationException } from '../exceptions/validation-exception';

@Injectable()
export class GlobalExceptionHandlers {
  @ExceptionHandler(BusinessException)
  handleBusinessException(exception: BusinessException): ErrorResponse {
    return ErrorResponse.of(
      exception.code,
      exception.message,
      exception.details,
    );
  }

  @ExceptionHandler(ValidationException)
  handleValidationException(exception: ValidationException): ErrorResponse {
    return ErrorResponse.of(
      'VALIDATION_ERROR',
      exception.message,
      this.formatValidationErrors(exception.errors),
    );
  }

  @ExceptionHandler(NotFoundException)
  handleNotFoundException(exception: NotFoundException): ErrorResponse {
    return ErrorResponse.of('NOT_FOUND', exception.message);
  }

  private formatValidationErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      field: error.property,
      message: this.getErrorMessages(error),
      value: error.value,
      constraints: error.constraints,
      children: error.children?.length
        ? this.formatValidationErrors(error.children)
        : undefined,
    }));
  }

  private getErrorMessages(error: ValidationError): string {
    const messages: string[] = [];

    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children) {
      for (const child of error.children) {
        messages.push(this.getErrorMessages(child));
      }
    }

    return messages.join(', ');
  }
}
