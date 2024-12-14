const messages = {
	en: {
		// String validasyonları
		isString: 'Field must be a string',
		isNotEmpty: 'Field cannot be empty',
		isEmpty: 'Field must be empty',
		minLength: 'Field must be at least $constraint1 characters long',
		maxLength: 'Field must be at most $constraint1 characters long',
		isLength:
			'Field must be between $constraint1 and $constraint2 characters long',
		contains: 'Field must contain the text "$constraint1"',
		equals: 'Field must be equal to "$constraint1"',
		matches: 'Field must match pattern "$constraint1"',

		// Sayı validasyonları
		isNumber: 'Field must be a number',
		isInt: 'Field must be an integer number',
		isPositive: 'Field must be a positive number',
		isNegative: 'Field must be a negative number',
		min: 'Field value must be greater than or equal to $constraint1',
		max: 'Field value must be less than or equal to $constraint1',
		isDivisibleBy: 'Field must be divisible by $constraint1',

		// Tarih validasyonları
		isDate: 'Field must be a valid date',
		minDate: 'Field date must be after $constraint1',
		maxDate: 'Field date must be before $constraint1',

		// Boolean validasyonları
		isBoolean: 'Field must be a boolean value',

		// Array validasyonları
		isArray: 'Field must be an array',
		arrayMinSize: 'Field must contain at least $constraint1 elements',
		arrayMaxSize: 'Field must contain at most $constraint1 elements',
		arrayUnique: 'All field elements must be unique',

		// Nesne validasyonları
		isObject: 'Field must be an object',
		isNotEmptyObject: 'Field must be a non-empty object',

		// E-posta ve iletişim validasyonları
		isEmail: 'Field must be a valid email address',
		isPhoneNumber: 'Field must be a valid phone number',
		isUrl: 'Field must be a valid URL address',
		isFQDN: 'Field must be a valid domain name',

		// Parola
		isStrongPassword: 'Field must be a strong password',
		isPassword:
			'Field must be a valid password with at least $constraint1 characters',
		hasUppercase:
			'Field must contain at least $constraint1 uppercase letter(s)',
		hasLowercase:
			'Field must contain at least $constraint1 lowercase letter(s)',
		hasDigit: 'Field must contain at least $constraint1 digit(s)',
		hasSpecialCharacter:
			'Field must contain at least $constraint1 special character(s)',
		hasNonAlphanumeric:
			'Field must contain at least $constraint1 non-alphanumeric character(s)',

		// Özel format validasyonları
		isAlpha: 'Field must contain only letters',
		isAlphanumeric: 'Field must contain only letters and numbers',
		isNumeric: 'Field must contain only numbers',
		isDecimal: 'Field must be a valid decimal number',
		isHexadecimal: 'Field must be a valid hexadecimal number',
		isHexColor: 'Field must be a valid hex color',
		isUUID: 'Field must be a valid UUID',
		isJSON: 'Field must be a valid JSON string',
		isBIC: 'Field must be a valid BIC (Bank Identifier Code)',
		isIBAN: 'Field must be a valid IBAN',
		isISBN: 'Field must be a valid ISBN',
		isEthereumAddress: 'Field must be a valid Ethereum address',
		isBtcAddress: 'Field must be a valid Bitcoin address',
		isCreditCard: 'Field must be a valid credit card number',

		// Dosya validasyonları
		isDataURI: 'Field must be a valid data URI',
		isMimeType: 'Field must be a valid MIME type format',
		isBase64: 'Field must be base64 encoded',
		isBase32: 'Field must be base32 encoded',

		// Coğrafi validasyonları
		isLatitude: 'Field must be a valid latitude coordinate',
		isLongitude: 'Field must be a valid longitude coordinate',
		isPostalCode: 'Field must be a valid postal code',

		// Genel validasyonlar
		isIn: 'Field value must be one of the following: $constraint1',
		isNotIn: 'Field value must not be one of the following: $constraint1',
		isEnum: 'Field must be one of defined enum values',
	},
	tr: {
		// String validasyonları
		isString: 'Alan metin tipinde olmalıdır',
		isNotEmpty: 'Alan boş bırakılamaz',
		isEmpty: 'Alan boş olmalıdır',
		minLength: 'Alan en az $constraint1 karakter uzunluğunda olmalıdır',
		maxLength: 'Alan en fazla $constraint1 karakter uzunluğunda olmalıdır',
		isLength:
			'Alan $constraint1 ile $constraint2 karakter arasında olmalıdır',
		contains: 'Alan "$constraint1" metnini içermelidir',
		equals: 'Alan "$constraint1" değerine eşit olmalıdır',
		matches: 'Alan "$constraint1" desenine uymalıdır',

		// Sayı validasyonları
		isNumber: 'Alan bir sayı olmalıdır',
		isInt: 'Alan tam sayı olmalıdır',
		isPositive: 'Alan pozitif bir sayı olmalıdır',
		isNegative: 'Alan negatif bir sayı olmalıdır',
		min: 'Alan değeri $constraint1 değerinden büyük veya eşit olmalıdır',
		max: 'Alan değeri $constraint1 değerinden küçük veya eşit olmalıdır',
		isDivisibleBy: 'Alan $constraint1 ile tam bölünebilir olmalıdır',

		// Tarih validasyonları
		isDate: 'Alan geçerli bir tarih olmalıdır',
		minDate: 'Alan tarihi $constraint1 tarihinden sonra olmalıdır',
		maxDate: 'Alan tarihi $constraint1 tarihinden önce olmalıdır',

		// Boolean validasyonları
		isBoolean: 'Alan boolean tipinde olmalıdır',

		// Array validasyonları
		isArray: 'Alan bir dizi olmalıdır',
		arrayMinSize: 'Alan en az $constraint1 eleman içermelidir',
		arrayMaxSize: 'Alan en fazla $constraint1 eleman içermelidir',
		arrayUnique: 'Dizideki tüm elemanlar benzersiz olmalıdır',

		// Nesne validasyonları
		isObject: 'Alan bir nesne olmalıdır',
		isNotEmptyObject: 'Alan boş bir nesne olmamalıdır',

		// E-posta ve iletişim validasyonları
		isEmail: 'Alan geçerli bir e-posta adresi olmalıdır',
		isPhoneNumber: 'Alan geçerli bir telefon numarası olmalıdır',
		isUrl: 'Alan geçerli bir URL adresi olmalıdır',
		isFQDN: 'Alan geçerli bir domain adı olmalıdır',

		// Parola
		isStrongPassword: 'Parola zayıf olmamalıdır',
		isPassword: 'Parola en az $constraint1 karakter uzunluğunda olmalıdır',
		hasLowercase: 'Parola en az bir küçük harf içermelidir',
		hasUppercase: 'Parola en az bir büyük harf içermelidir',
		hasNumber: 'Parola en az bir rakam içermelidir',
		hasSpecialCharacter: 'Parola en az bir özel karakter içermelidir',

		// Özel format validasyonları
		isAlpha: 'Alan sadece harflerden oluşmalıdır',
		isAlphanumeric: 'Alan sadece harf ve rakamlardan oluşmalıdır',
		isNumeric: 'Alan sadece rakamlardan oluşmalıdır',
		isDecimal: 'Alan geçerli bir ondalık sayı olmalıdır',
		isHexadecimal: 'Alan geçerli bir onaltılık sayı olmalıdır',
		isHexColor: 'Alan geçerli bir hex renk kodu olmalıdır',
		isUUID: 'Alan geçerli bir UUID olmalıdır',
		isJSON: 'Alan geçerli bir JSON metni olmalıdır',
		isBIC: 'Alan geçerli bir BIC (Banka Tanımlayıcı Kodu) olmalıdır',
		isIBAN: 'Alan geçerli bir IBAN olmalıdır',
		isISBN: 'Alan geçerli bir ISBN olmalıdır',
		isEthereumAddress: 'Alan geçerli bir Ethereum adresi olmalıdır',
		isBtcAddress: 'Alan geçerli bir Bitcoin adresi olmalıdır',
		isCreditCard: 'Alan geçerli bir kredi kartı numarası olmalıdır',

		// Dosya validasyonları
		isDataURI: 'Alan geçerli bir data URI olmalıdır',
		isMimeType: 'Alan geçerli bir MIME tipi formatında olmalıdır',
		isBase64: 'Alan base64 ile kodlanmış olmalıdır',
		isBase32: 'Alan base32 ile kodlanmış olmalıdır',

		// Coğrafi validasyonları
		isLatitude: 'Alan geçerli bir enlem koordinatı olmalıdır',
		isLongitude: 'Alan geçerli bir boylam koordinatı olmalıdır',
		isPostalCode: 'Alan geçerli bir posta kodu olmalıdır',

		// Genel validasyonlar
		isIn: 'Alan değeri şunlardan biri olmalıdır: $constraint1',
		isNotIn: 'Alan değeri şunlardan biri olmamalıdır: $constraint1',
		isEnum: 'Alan tanımlı enum değerlerinden biri olmalıdır',
	},
}

export const getValidationMessages = (locale: string) => {
	return messages[locale] || messages.en
}
