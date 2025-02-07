import { Type }               from '@itrocks/class-type'
import { sep }                from 'path'
import { Destination }        from './destination'
import { isDestination }      from './destination'
import { resolveDestination } from './destination'

export type RouteTree = { [name: string]: Destination | RouteTree }

export class Routes
{
	routes: RouteTree = {}

	add(path: string, destination: Destination)
	{
		let   route  = this.routes
		const names  = path.split(sep).slice(1).reverse()
		const length = names.length - 1
		for (let index = 0; index < length; index ++) {
			const name = names[index]
			let   step = route[name]
			if (!step) {
				step = {}
			}
			if (isDestination(step)) {
				step = { '.': step }
			}
			route = route[name] = step
		}
		const name = names[length]
		if (route[name]) {
			Object.assign(route[name], { '.': destination })
		}
		else {
			route[name] = destination
		}
	}

	destination(route: string): Destination | undefined
	{
		let position: Destination | RouteTree = this.routes
		for (const name of route.slice(1).split('/').reverse()) {
			if (isDestination(position)) {
				return position
			}
			const step: Destination | RouteTree | undefined = position[name]
			if (step) {
				position = step
			}
		}
		if ((typeof position === 'object') && position['.']) {
			position = position['.']
		}
		return isDestination(position)
			? position
			: undefined
	}

	resolve(route: string): Function | Type | undefined
	{
		const destination = this.destination(route)
		if (!destination) {
			return undefined
		}
		return resolveDestination(destination)
	}

	simplify()
	{
		function simplifyStep(step: Destination | RouteTree, parentStep: RouteTree, parentName: string)
		{
			if (isDestination(step)) {
				return
			}
			for (const [name, nextStep] of Object.entries(step)) {
				simplifyStep(nextStep, step, name)
			}
			const steps = Object.values(step)
			if (steps.length === 1) {
				parentStep[parentName] = steps[0]
			}
		}
		for (const [name, step] of Object.entries(this.routes)) {
			simplifyStep(step, this.routes, name)
		}
	}

	summarize(route: string)
	{
		let position: Destination | RouteTree = this.routes
		let summary = ''
		for (const name of route.slice(1).split('/').reverse()) {
			if (isDestination(position)) {
				return summary
			}
			const step: Destination | RouteTree | undefined = position[name]
			if (step) {
				summary += '/' + name
				position = step
			}
		}
		if ((typeof position === 'object') && position['.']) {
			position = position['.']
		}
		return summary
	}

}
