const Generator = require('yeoman-generator')

module.exports = class extends Generator {
	constructor(args, opts) {
		super(args, opts)

		this.argument('appname', { type: String, required: false })
	}

	async prompting() {
		const self = this
		if (!this.options.appname) {
			async function getName() {
				const answers = await self.prompt([
					{
						type: 'input',
						name: 'appname',
						message: 'Project name',
					},
				])

				const correct = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
					answers.appname,
				)
				if (!correct) {
					self.log(
						'Must be lowercase letters, numbers, or the following symbols: -._~',
					)
					return getName()
				}

				return answers.appname
			}

			const name = await getName()

			this.options.appname = name
		}

		const name = this.options.appname
		this.log(`generating project ${name}...`)
		this.destinationRoot(name)
	}

	definePackage() {
		const name = this.options.appname
		const packageJSON = {
			name,
			version: '0.0.1',
			license: 'MIT',
			main: 'lib/main.js',
			types: 'lib/main.d.ts',
			scripts: {
				prepack: 'gosub tsc',
				build: 'tsc',
				watch: 'gosub build --w',
				clean: 'shx -rf ./lib',
				test: 'echo "no tests"',
				start: 'node $npm_package_main',
				dev: 'ts-node src/main.ts',
			},
		}

		this.fs.extendJSON(this.destinationPath('package.json'), packageJSON)
	}

	install() {
		this.yarnInstall(['@types/node', 'typescript', 'ts-node', 'gosub', 'shx'], {
			dev: true,
		})
	}

	copy() {
		this.fs.copyTpl(
			this.templatePath(),
			this.destinationPath(),
			{},
			{},
			{ globOptions: { dot: true } },
		)
	}
}
