import { readdir }   from 'node:fs/promises'
import { readFile }  from 'node:fs/promises'
import { stat }      from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'
import { join }      from 'node:path'

async function addJsExtensions(dir: string)
{
	for (const file of await readdir(dir)) {
		if (file === 'esm.js') continue
		const filePath = join(dir, file)
		if ((await stat(filePath)).isFile() && filePath.endsWith('.js')) {
			let content = (await readFile(filePath, 'utf-8')).toString()
			if (content.includes('require(')) {
				content =
					"import { createRequire } from 'module'\n"
					+ "const require = createRequire(import.meta.url)\n"
					+ content
			}
			content = content.replace(/from\s+['"](\..*?)(?<!\.js)['"]/g, "from '$1.js'")
			await writeFile(filePath, content, 'utf-8')
		}
	}
}
addJsExtensions('esm').catch(error => { throw error }).then()
