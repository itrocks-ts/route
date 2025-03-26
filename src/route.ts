import { Routes } from './routes'

export {
	Route,
	routeOf,
	routeOfDependsOn as routeDependsOn
} from './decorator'

export {
	Destination,
	isDestination,
	resolveDestination
} from './destination'

export {
	RouteTree,
	Routes
} from './routes'

export const routes = new Routes()

export async function loadRoutes(routes: Routes, config: Record<string, string>)
{
	for (const [route, destination] of Object.entries(config)) {
		routes.add(route, destination)
	}
	routes.simplify()
	return routes
}
