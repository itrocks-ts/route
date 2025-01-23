import appDir           from '@itrocks/app-dir'
import { readFileSync } from 'fs'

export const staticRoutes: Record<string, string | undefined>
	= JSON.parse(readFileSync(appDir + '/static-routes.json') + '')
