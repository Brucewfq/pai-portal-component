<template>
    <div>
        <h2>{{name}}</h2>
      <ChoosePerson :childDataUrl="childDataUrl"></ChoosePerson>
    </div>
</template>

<script>
  import ChoosePerson from './../../choose-person'
export default {
    name: "hello-world",
  components: {
    ChoosePerson
  },
    props: {
        name: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
          childDataUrl: {
            url: '',
            getTree: 'getTree',
            companytree: 'companytree/page'
          }
        }
    },
    mounted() {

    },
    methods: {},
    destroyed() {
    }
}
</script>

<style scoped>
.test{
    background-color: #fff;
    color: #000;
}
</style>
