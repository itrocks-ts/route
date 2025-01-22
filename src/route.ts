import { ObjectOrType }          from '@itrocks/class-type'
import { decorate, decoratorOf } from '@itrocks/decorator/class'

const ROUTE = Symbol('route')

export function objectRouteOf(target: object)
{
	return routeOf(target) + (('id' in target) ? ('/' + target.id) : '')
}

export default Route
export function Route(route: string)
{
	return decorate(ROUTE, route)
}

export function routeOf(target: ObjectOrType)
{
	return decoratorOf(target, ROUTE, '')
}

export {
	accessModule,
	getActionModule,
	getModule,
	getRoute,
	initRoutes
} from './routes'

export {
	staticRoutes
} from './static-routes'
