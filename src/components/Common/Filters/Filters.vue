<template>
  <div>
    <div v-if="(!basicFilter && !rawFilter && !sorting) && quickFilterEnabled" class="card-panel card-header">
      <div class="row margin-bottom-0 filters">
        <quick-filter
          :search-term="searchTerm"
          :display-block-filter="displayBlockFilter"
          @filters-display-block-filter="displayBlockFilter = !displayBlockFilter">
        </quick-filter>
      </div>
    </div>

    <div v-if="(basicFilter || rawFilter || sorting) || !quickFilterEnabled" class="complex-search card-panel card-header filters">
      <div class="row margin-bottom-0">
        <div class="col s8 m6 l4" style="min-width: 520px">
          <div class="search-bar">
            <i class="fa fa-search search"></i>
            <div class="chip">
              <span class="label-chip" @click.prevent="displayBlockFilter = true">{{labelComplexQuery}}</span>
              <i class="close fa fa-close" v-if="quickFilterEnabled" @click.prevent="resetComplexSearch"></i>
            </div>
            <a v-if="!displayBlockFilter" href="#" class="fluid-hover" @click.prevent="displayBlockFilter = true">More query options</a>
            <a v-else href="#" class="fluid-hover" @click.prevent="displayBlockFilter = false">Less query options</a>
          </div>
        </div>
        <div class="col s4 m3 l3 actions-quicksearch">
          <button type="submit" class="btn btn-small waves-effect waves-light" @click="refreshSearch">{{labelSearchButton}}</button>
          <button class="btn-flat btn-small waves-effect waves-light" @click="resetComplexSearch">reset</button>
        </div>
      </div>
    </div>

    <div class="row card-panel open-search" v-show="displayBlockFilter">
      <i class="fa fa-times close" @click="displayBlockFilter = false"></i>
      <div class="col s12">
        <tabs @tab-changed="switchFilter" :active="tabActive" :is-displayed="displayBlockFilter">
          <tab name="basic"><a href="">Basic Mode</a></tab>
          <tab name="raw"><a href="">Raw JSON Mode</a></tab>

          <div slot="contents" class="card">
            <div class="col s12">
              <div v-show="tabActive === 'basic'">
                <basic-filter
                  :basic-filter="basicFilter"
                  :sorting-enabled="sortingEnabled"
                  :available-filters="availableFilters"
                  :label-search-button="labelSearchButton"
                  :sorting="sorting"
                  :set-basic-filter="setBasicFilter"
                  @filters-basic-search="complexSearch = true">
                </basic-filter>
              </div>

              <div v-show="tabActive === 'raw'">
                <raw-filter
                  :raw-filter="rawFilter"
                  :format-from-basic-search="formatFromBasicSearch"
                  :sorting-enabled="sortingEnabled"
                  :label-search-button="labelSearchButton"
                  :format-sort="formatSort"
                  :basic-filter-form="basicFilterForm">
                </raw-filter>
              </div>
            </div>
          </div>
        </tabs>
      </div>
    </div>
  </div>
</template>

<script>
  import Tabs from '../../Materialize/Tabs'
  import Tab from '../../Materialize/Tab'
  import QuickFilter from './QuickFilter'
  import BasicFilter from './BasicFilter'
  import RawFilter from './RawFilter'

  export default {
    name: 'Filters',
    props: {
      availableFilters: {
        type: Object,
        required: true
      },
      quickFilterEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      sortingEnabled: {
        type: Boolean,
        required: false,
        'default': true
      },
      labelSearchButton: {
        type: String,
        required: false,
        'default': 'search'
      },
      labelComplexQuery: {
        type: String,
        required: false,
        'default': 'Complex query here'
      },
      rawFilter: Object,
      basicFilter: Array,
      setBasicFilter: Function,
      basicFilterForm: Object,
      searchTerm: String,
      sorting: Object,
      formatFromBasicSearch: Function,
      formatSort: Function
    },
    components: {
      Tabs,
      Tab,
      QuickFilter,
      BasicFilter,
      RawFilter
    },
    watch: {
      'displayBlockFilter' () {
        this.$broadcast('json-editor-refresh')
      },
      'tabActive' () {
        this.$broadcast('json-editor-refresh')
      }
    },
    events: {
      'filters-basic-search' () {
        this.displayBlockFilter = false
      },
      'filters-raw-search' () {
        this.displayBlockFilter = false
      }
    },
    data () {
      return {
        displayBlockFilter: false,
        tabActive: 'basic',
        jsonInvalid: false
      }
    },
    methods: {
      switchFilter (name) {
        this.tabActive = name
      },
      resetComplexSearch () {
        this.$dispatch('filters-raw-search', {})
      },
      refreshSearch () {
        this.$dispatch('filters-refresh-search')
      }
    },
    ready () {
      window.document.addEventListener('keydown', this.handleEsc)
    },
    destroyed () {
      window.document.removeEventListener('keydown', this.handleEsc)
    }
  }
</script>

<style lang="scss" rel="stylesheet/scss">
  .filters {
    .actions-quicksearch {
      transform: translateY(50%);
    }
  }
  .search-bar {
    position: relative;
    height: 48px;

    a {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      text-decoration: underline;
    }
    i {
      position: absolute;
      font-size: 1.3rem;
      margin-left: 4px;
      color: grey;
      top: 50%;
      transform: translateY(-50%);
      &.remove-search {
        right: 20px;
        cursor: pointer;
      }
      &.search {
        pointer-events: none;
      }
    }

    input {
      height: 48px;
      padding-left: 34px;
      margin-bottom: 0;
      width: 100%;
      padding-right: 215px;
      box-sizing: border-box;
      border-bottom: solid 1px #e4e1e1;
    }
  }

  .quick-search {
    button {
      margin-top: 8px;
    }
  }

  .complex-search {
    button {
    }
    .search-bar {
      border-bottom: solid 1px #e4e1e1;
      .chip {
        margin-top: 9px;
        margin-left: 30px;
        cursor: pointer;
        .label-chip {
          display: inline-block;
          padding-right: 10px;
        }
        i {
          position: relative;
          cursor: pointer;
          float: right;
          font-size: 13px;
          line-height: 32px;
        }
      }
    }
  }

  .open-search {
    background-color: #fff;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    position: relative;

    i.close {
      float: right;
      font-size: 1.3em;
      cursor: pointer;
      color: grey;
      position: absolute;
      top: 10px;
      right: 16px;

      &:hover {
        color: #555;
        background: #EEE;
        border-radius: 3px;
      }
    }

    .filter-content {
      .dots {
        border-left: 1px dotted rgba(0, 0, 0, 0.26);
        padding-bottom: 5px;
      }
      a.btn {
        i.left {
          margin-right: 8px;
        }
        padding-left: 10px;
        padding-right: 10px;
        margin-left: 10px;
      }
      .button-or {
        margin-bottom: 10px;
      }
      .block-and {
        i.remove-filter {
          margin-top: 25px;
          color: grey;
          cursor: pointer;
        }

      }
      .block-sort {
        margin-top: 15px;
        margin-bottom: 0;
      }
      .block-content {
        margin-left: 5px;
        margin-bottom: 5px;
        .group {
          margin-bottom: 0;
        }
      }
      p {
        margin-bottom: 10px;
        margin-top: 10px;
        i {
          font-size: 1.1em;
          margin-right: 10px;
        }
      }
    }
    .card-action {
      padding: 15px;
      margin-bottom: 0;
      button {
        margin-right: 10px;
      }
    }

    .select-wrapper span.caret {
      top: 10px
    }
  }
  .pre_ace, .ace_editor {
    height: 250px;
  }
</style>