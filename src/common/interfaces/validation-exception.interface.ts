/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: { [type: string]: string }; // Tip tanımını düzelttik
}
