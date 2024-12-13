/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 09/12/2024
 */

export default interface FindAllParams {
	sort: Array<{ field: string; order: 'ASC' | 'DESC' }>
	page: number
	limit: number
}
