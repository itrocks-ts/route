import { isObject, ObjectOrType } from '@itrocks/class-type'
import { decorate, decoratorOf }  from '@itrocks/decorator/class'

const ROUTE = Symbol('route')

export default Route
export function Route(route: string)
{
	return decorate(ROUTE, route)
}

export function routeOf(target: ObjectOrType, action?: string)
{
	return decoratorOf(target, ROUTE, '')
		+ ((isObject(target) && ('id' in target)) ? ('/' + target.id) : '')
		+ (action ? ('/' + action) : '')
}
