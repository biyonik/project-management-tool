/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { ErrorResponse } from '../dto/error-response.dto';

export interface ExceptionHandlerFunction {
  (exception: Error): ErrorResponse;
}
