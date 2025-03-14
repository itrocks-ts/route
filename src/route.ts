import { appDir }     from '@itrocks/app-dir'
import { jsonRoutes } from './json'
import { Routes }     from './routes'

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
	jsonRoutes
} from './json'

export {
	RouteTree,
	Routes
} from './routes'

export async function loadRoutes(path = appDir, fileName = 'routes.json', recursive = true)
{
	const routes = new Routes()
	for (const [route, destination] of Object.entries(await jsonRoutes(path, fileName, recursive))) {
		routes.add(route, destination)
	}
	routes.simplify()
	return routes
}
