import { appDir }              from '@itrocks/app-dir'
import { isAnyFunctionOrType } from '@itrocks/class-type'
import { Type }                from '@itrocks/class-type'

export type Destination = string

export function isDestination(destination: any): destination is Destination
{
	return typeof destination === 'string'
}

export function resolveDestination(destination: Destination): Function | Type | undefined
{
	let rightPart: string
	[destination, rightPart] = destination.split(':')
	const exportName = rightPart ?? 'default'
	const module = require((destination[0] === '/') ? (appDir + destination) : destination)
	return module[exportName]
		?? (!rightPart && Object.values(module).find(destination => isAnyFunctionOrType(destination)))
}
