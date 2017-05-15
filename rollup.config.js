import babel from 'rollup-plugin-babel';

export default {
	entry: './src/index.js',
	format: process.env.format,
	dest: `dist/bundle.${process.env.format}.js`,
	moduleName: 'ReduxThunkStateAdapter',
	plugins: [babel()]
}
