<template>
  <div>
    <b-container>
      <b-row>
        <b-col class="pt-1">
          <b-alert variant="danger"
               dismissible
               :show="alert.show"
               @dismissed="alert.show=false">
                {{alert.message}}
          </b-alert>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="4" class="pt-2">
          <h2>{{$t('components.projects.projectEdit.name')}}</h2>
        </b-col>
      </b-row>
        <b-form @submit="onSubmit">
          <b-form-group id="nameInputGroup"
                        :label="this.$t('general.name')+':'"
                        label-for="nameInput">
            <b-form-input id="nameInput"
                          type="text"
                          v-model="form.name"
                          required
                          placeholder="Enter name">
            </b-form-input>
          </b-form-group>
          <b-form-group id="locationInputGroup"
                        :label="this.$t('general.location')+':'"
                        label-for="latitudeInput">
            <b-form-input id="latitudeInput"
                          type="text"
                          v-model="form.latitude"
                          required
                          placeholder="Enter latitude">
            </b-form-input>
            <b-form-input id="longitudeInput"
                          type="text"
                          v-model="form.longitude"
                          required
                          placeholder="Enter longitude">
            </b-form-input>
          </b-form-group>
          <b-form-group id="zoomInputGroup"
                        :label="this.$t('general.zoom')+':'"
                        label-for="zoomInput">
            <b-form-input id="zoomInput"
                          type="text"
                          v-model="form.zoom"
                          required
                          placeholder="Enter zoom">
            </b-form-input>
          </b-form-group>
          <b-form-group id="statusInputGroup"
                        :label="this.$t('general.status')+':'"
                        label-for="statusInput">
            <b-form-select id="statusInput" v-model="form.status" :options="statusList" class="mb-3" />
          </b-form-group>
          <b-form-group id="zoneInputGroup"
                        :label="this.$t('general.zone')+':'"
                        label-for="zoneInput">
            <fiberfy-autocomplete type="remote"
                                  :url="this.zoneUrl"
                                  selectedField="title" returnedField="id"
                                  required="true"
                                  v-model="form.defaultZone"/>
          </b-form-group>
          <b-button type="submit" variant="primary">{{$t('general.update')}}</b-button>
        </b-form>
    </b-container>
  </div>
</template>
<script>
import FiberfyAutocomplete from '@/components/shared/fiberfy-autocomplete'

export default {
  name: 'ProjectEdit',
  components: {
    'fiberfy-autocomplete': FiberfyAutocomplete
  },
  data () {
    return {
      form: {
        id: null,
        name: null,
        latitude: null, // eslint-disable-line
        longitude: null, // eslint-disable-line
        zoom: null, // eslint-disable-line
        defaultZone: null,
        status: null
      },
      zoneUrl: fiberfy.constants.BASE_URL + fiberfy.constants.API_VERSION + '/zone/', // eslint-disable-line
      alert: {
        show: false,
        message: ''
      }
    }
  },
  mounted () {
    let project = this.$store.getters['projects/current']
    this.form.id = project.id
    this.form.name = project.name
    this.form.latitude = project.latitude
    this.form.longitude = project.longitude
    this.form.zoom = project.zoom
    this.form.defaultZone = project.defaultZone
    this.form.status = project.status
  },
  computed: {
    statusList () {
      let output = []
      let statusList = this.$store.state.templates.statusList
      for (let x in statusList) {
        output[x] = {
          value: statusList[x],
          text: this.$t('general.statusList.' + statusList[x])
        }
      }
      return output
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      this.$store.dispatch('projects/updateCurrent', this.form).then(response => {
        this.$router.go(-1)
      }, error => {
        this.alert.message = error.msg
        this.alert.show = true
        console.log(error)
      })
    }
  }
}
</script>
