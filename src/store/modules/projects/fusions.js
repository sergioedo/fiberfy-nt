import VueResource from 'vue-resource'
import Vue from 'vue'
import InitialStates from '../../initial-states.js'

Vue.use(VueResource)

/* eslint-disable */
export default {
  state: InitialStates.fusions(),
  getters: {
    getPossibleFusions: state => data => {
      let result = {}
      if (data.box) { // It can be a box
        if (data.box.id) {
          // Llistar tots - les fusions ja fetes i ell mateix
          //result.boxes = Object.assign({}, state.boxes)
          result.boxes = JSON.parse(JSON.stringify(state.boxes)); // Deep copy object
          result.fibers = Object.assign({}, state.fibers)
          if (data.box.in) {
            Vue.delete(result.boxes[data.box.id].inputs, data.box.in)
          } else if (data.box.out) {
            Vue.delete(result.boxes[data.box.id].outputs, data.box.out)
          }
        }
      } else if (data.fiber) { // It can be a fiber
        // Llistar tots - les fusions ja fetes i ell mateix
        result.boxes = Object.assign({}, state.boxes)
        result.fibers = Object.assign({}, state.fibers)
        Vue.delete(result.fibers, data.fiber)
      }
      return result
    },
    getFusionByFiber: state => fiber => {
      let fusionPos = state.fusions.fibers[fiber]
      if (fusionPos) return state.fusions.data[fusionPos.id][fusionPos.pos]
      else return null
    },
    getFusionByBox: state => box => {
      let type = (box.in ? 'inputs' : 'outputs')
      let content = (box.in ? box.in : box.out)
      if (state.fusions.boxes[box.id]) {
        if (state.fusions.boxes[box.id][type]) {
          let fusionPos = state.fusions.boxes[box.id][type][content]
          if (fusionPos) return state.fusions.data[fusionPos.id][fusionPos.pos]
        }
        return null
      }
      return null
    },
    getFusions: state => {
      return state.fusions.data
    },
    currentSite: state => {
      return state.site
    }
  },
  mutations: {
    addFiberToFusions(state, fiber) {
      Vue.set(state.fibers, fiber.id, fiber)
    },
    addBoxToFusions(state, box) {
      box.inputs = {}
      for (let x = 1; x <= box.inputFO; ++x) {
        box.inputs[x] = x
      }
      box.outputs = {}
      for (let x = 1; x <= box.outputFO; ++x) {
        box.outputs[x] = x
      }
      Vue.set(state.boxes, box.id, box)
    },
    addNewFusion (state, fusion) {
      Vue.set(state.fusions.data, fusion.id, [fusion.fdata, fusion.sdata])
      if (fusion.fdata.type === 'box') {
        let box = fusion.fdata.id
        let boxes = state.fusions.boxes
        Vue.set(boxes, box, boxes[box] || {})
        if (fusion.fdata.in) { // If it's an input
          Vue.set(boxes[box], 'inputs', boxes[box]['inputs'] || {})
          Vue.set(boxes[box]['inputs'], fusion.fdata.in, {id: fusion.id, pos: 1})
        } else if (fusion.fdata.out) {
          Vue.set(boxes[box], 'outputs', boxes[box]['outputs'] || {})
          Vue.set(boxes[box]['outputs'], fusion.fdata.out, {id: fusion.id, pos: 1})
        }
      } else if (fusion.fdata.type === 'fiber') {
        let fiber = fusion.fdata.id
        Vue.set(state.fusions.fibers, fiber, {id: fusion.id, pos: 1})
      }
      if (fusion.sdata.type === 'box') {
        let box = fusion.sdata.id
        let boxes = state.fusions.boxes
        Vue.set(boxes, box, boxes[box] || {})
        if (fusion.sdata.in) { // If it's an input
          Vue.set(boxes[box], 'inputs', boxes[box]['inputs'] || {})
          Vue.set(boxes[box]['inputs'], fusion.sdata.in, {id: fusion.id, pos: 0})
        } else if (fusion.sdata.out) {
          Vue.set(boxes[box], 'outputs', boxes[box]['outputs'] || {})
          Vue.set(boxes[box]['outputs'], fusion.sdata.out, {id: fusion.id, pos: 0})
        }
      } else if (fusion.sdata.type === 'fiber') {
        let fiber = fusion.sdata.id
        Vue.set(state.fusions.fibers, fiber, {id: fusion.id, pos: 0})
      }
    },
    setFusionSite (state, site) {
      Vue.set(state, 'site', site)
    },
    updateFusion (state, data) {
      Vue.set(state.fibers, data.id, data.fiber)
    },
    resetFusions (state) {
      state.fusions = InitialStates.fusions().fusions
      state.boxes = InitialStates.fusions().boxes
      state.fibers = InitialStates.fusions().fibers
    }
  },
  actions: {
    loadFusions (context, site) {
      return new Promise((resolve, reject) => {
        context.commit('resetFusions')
        Vue.http.get(fiberfy.constants.BASE_URL + fiberfy.constants.API_VERSION + '/fusion/?project=' + context.getters.currentId
        + '&limit=10000&populate=null&site=' + site).then(response => {
          context.commit('setFusionSite', site)
          for (let x in response.body) {
            let fusion = response.body[x]
            context.commit('addNewFusion', fusion)
          }
          resolve(response)
        }, error => {
          reject(error)
        })
        /* let tubes = context.getters.tubes // We load existing tubes
        for (let x in tubes) context.commit('addSiteToFiber', tubes[x])
        Vue.http.get(fiberfy.constants.BASE_URL + fiberfy.constants.API_VERSION + '/fusions/?site=' + site + '&limit=10000&populate=null').then(response => {
          for (let x in response.body) {
            let fusion = response.body[x]
            context.commit('addNewFusion', fusion)
          }
          resolve(response)
        }, error => {
          reject(error)
        }) */
        /* let boxesIndexes = context.getters.boxesIndexes(site)
        for (let x in cablesIndexes) {
          let cable = context.getters.findCableById(cablesIndexes[x])
          context.commit('addNewFiber', cable)
        }

        for (let x in boxesIndexes) {
          let box = context.getters.findBoxById(BoxesIndexes[x])
          context.commit('addNewBox', box)
        } */

      })
    },
    addNewFusion (context, fusion) {
      return new Promise((resolve, reject) => {
        fusion.project = context.getters.currentId
        fusion.site = context.getters.currentSite
        Vue.http.post(fiberfy.constants.BASE_URL + fiberfy.constants.API_VERSION + '/fusion/', fusion).then(response => {
          Vue.http.get(fiberfy.constants.BASE_URL + fiberfy.constants.API_VERSION + '/fusion/' + response.body.id).then(response => {
            context.commit('addNewFusion', response.body)
            resolve(response)
          }, error => {
            reject(error)
          })
        }, error => {
          reject(error)
        })
      })
    },
    addFiberToFusions (context, fiber) {
      return new Promise((resolve, reject) => {
        context.commit('addFiberToFusions', fiber)
        resolve(true)
      })
    },
    addBoxToFusions (context, box) {
      return new Promise((resolve, reject) => {
        context.commit('addBoxToFusions', box)
        resolve(true)
      })
    },
    resetFusions (context) {
      return new Promise((resolve, reject) => {
        context.commit('resetFusions')
        resolve(true)
      })
    }
  }
}