import appDir                  from '@itrocks/app-dir'
import { isAnyFunctionOrType } from '@itrocks/class-type'
import { Type }                from '@itrocks/class-type'

export type Destination = string

export function isDestination(destination: any): destination is Destination
{
	return typeof destination === 'string'
}

export function resolveDestination(destination: Destination): Function | Type | undefined
{
	try {
		const module  = require((destination[0] === '/') ? (appDir + destination) : destination)
		const feature = module.default ?? Object.values(module)[0]
		return isAnyFunctionOrType(feature)
			? feature
			: undefined
	}
	catch {
		return undefined
	}
}
