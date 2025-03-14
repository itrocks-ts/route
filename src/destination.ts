import { appDir } from '@itrocks/app-dir'
import { Type }   from '@itrocks/class-type'

export type Destination = string

export function isDestination(destination: any): destination is Destination
{
	return typeof destination === 'string'
}

export function resolveDestination(destination: Destination): Function | Type | undefined
{
	const module = require((destination[0] === '/') ? (appDir + destination) : destination)
	return module.default ?? Object.values(module)[0]
}
