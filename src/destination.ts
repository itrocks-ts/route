import { isAnyFunctionOrType, Type } from '@itrocks/class-type'

export type Destination = string

export function isDestination(destination: any): destination is Destination
{
	return typeof destination === 'string'
}

export function resolveDestination(destination: Destination): Function | Type | undefined
{
	const module  = require(destination)
	const feature = module.default ?? Object.values(module)[0]
	return isAnyFunctionOrType(feature)
		? feature
		: undefined
}
