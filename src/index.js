import HelloWorld from '../packages/hello-world/index'
import ChoosePerson from '../packages/choose-person/index'
import './assets/styles/pcCandidates.scss'
const components = [
  HelloWorld,
  ChoosePerson
]

const install = function (Vue, opts = {}) {
    components.map(component => {
        Vue.component(component.name, component);
    })
}
/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}
export {install, HelloWorld, ChoosePerson}
