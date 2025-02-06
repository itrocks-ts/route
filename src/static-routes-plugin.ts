import appDir            from '@itrocks/app-dir'
import { readFileSync }  from 'fs'
import { writeFileSync } from 'fs'
import ts                from 'typescript'

// TODO support aliasing: import { Route as Alias } from './route' ; @Alias('/')

const scanPath         = appDir
const staticRoutesFile = appDir + '/static-routes.json'

let source: string
try   { source = readFileSync(staticRoutesFile) + '' }
catch { source = '{}' }
const routes: Record<string, string> = JSON.parse(source)

const modules: Record<string, string[]> = {}
for (const [path, module] of Object.entries(routes)) {
	(modules[module] ?? (modules[module] = [])).push(path)
}

function saveStaticRoutes()
{
	return writeFileSync(staticRoutesFile, JSON.stringify(routes, null, '\t') + '\n')
}

export default () => (context: ts.TransformationContext) => (sourceFile: ts.SourceFile) =>
{
	let   hasRoute = false
	const module   = sourceFile.fileName.slice(scanPath.length, -3)
	const validRoutes: Record<string, string> = {}

	function isRoute(node: ts.Node): boolean
	{
		if (!ts.isImportDeclaration(node)) return false
		if (!node.importClause) return false
		const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral
		if (moduleSpecifier.text !== '@itrocks/route') return false

		if (node.importClause.name?.getText() === 'Route') {
			return true
		}

		const namedBindings = node.importClause.namedBindings
		if (!namedBindings || !ts.isNamedImports(namedBindings)) return false
		for (const importSpecifier of namedBindings.elements) {
			if (importSpecifier.name.getText() === 'Route') {
				return true
			}
		}

		return false
	}

	function routeDecoratorValues(node: ts.Node)
	{
		const routes: string[] = []
		if (!ts.canHaveDecorators(node)) return []
		for (const decorator of ts.getDecorators(node) ?? []) {
			if (!ts.isCallExpression(decorator.expression)) continue
			if (decorator.expression.expression.getText() !== 'Route') continue
			const argument = decorator.expression.arguments[0]
			if (!argument || !ts.isStringLiteral(argument)) continue
			routes.push(argument.text)
		}
		return routes
	}

	const visit: ts.Visitor = (node: ts.Node): ts.Node =>
	{
		if (hasRoute ||= isRoute(node)) {
			for (const path of routeDecoratorValues(node)) {
				if (!path) continue
				validRoutes[path] = module
				if (module === routes[path]) continue
				if (routes[path]) {
					const moduleRoutes = modules[routes[path]]
					delete moduleRoutes[moduleRoutes.indexOf(path)]
				}
				(modules[module] ?? (modules[module] = [])).push(path)
				routes[path] = module
			}
		}
		return ts.visitEachChild(node, visit, context)
	}

	const resultNode = ts.visitNode(sourceFile, visit)

	const moduleRoutes = modules[module]
	if (moduleRoutes) {
		let deletions = 0
		for (const path of moduleRoutes) {
			if (validRoutes[path]) continue
			delete moduleRoutes[moduleRoutes.indexOf(path)]
			delete routes[path]
			deletions ++
		}
		if (deletions) {
			modules[module] = moduleRoutes.filter(path => path)
			if (!modules[module].length) {
				delete modules[module]
			}
			saveStaticRoutes()
		}
		else if (Object.keys(validRoutes).length) {
			saveStaticRoutes()
		}
	}

	return resultNode
}
