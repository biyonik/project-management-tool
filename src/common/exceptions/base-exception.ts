/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

export class BaseException extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly details?: any,
  ) {
    super(message);
  }
}
