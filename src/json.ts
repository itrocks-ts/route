import appDir                from '@itrocks/app-dir'
import { readdir, readFile } from 'fs/promises'
import { join, normalize }   from 'path'
import { isDestination }     from './destination'
import { RawRoutes }         from './raw'

export async function jsonRoutes(path = appDir, fileName = 'routes.json', recursive = true)
{
	const routes: RawRoutes = {}
	const entries = await readdir(path, { withFileTypes: true })
	await Promise.all(entries.map(async entry => {
		const filePath = join(path, entry.name)
		if (entry.isDirectory()) {
			if (recursive) {
				Object.assign(routes, await jsonRoutes(filePath, fileName))
			}
		}
		else if (entry.isFile() && (entry.name === fileName)) {
			for (const [route, module] of Object.entries(JSON.parse((await readFile(join(path, fileName))).toString()))) {
				if (!isDestination(module)) continue
				routes[route] = (module[0] === '.')
					? normalize(join(path, module)).slice(appDir.length)
					: module
			}
		}
		return entry
	}))
	return routes
}
