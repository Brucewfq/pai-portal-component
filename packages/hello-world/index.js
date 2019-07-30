import HelloWorld from './src/hello-world'

HelloWorld.install = function (Vue) {
  Vue.component(HelloWorld.name, HelloWorld)
}

export default HelloWorld
