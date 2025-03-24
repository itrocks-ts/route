import { isObject }            from '@itrocks/class-type'
import { ObjectOrType }        from '@itrocks/class-type'
import { decorate  }           from '@itrocks/decorator/class'
import { DecoratorCallback }   from '@itrocks/decorator/class'
import { decoratorOfCallback } from '@itrocks/decorator/class'

type Dependencies = {
	calculate?: DecoratorCallback<object, string>
}

const depends: Dependencies = {
	calculate: () => ''
}

const ROUTE = Symbol('route')

export function Route(route: string)
{
	return decorate(ROUTE, route)
}

export function routeOf(target: ObjectOrType, action?: string)
{
	return decoratorOfCallback(target, ROUTE, depends.calculate)
		+ ((isObject(target) && ('id' in target)) ? ('/' + target.id) : '')
		+ (action ? ('/' + action) : '')
}

export function routeOfDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}
