// file
let file = localStorage.getItem('file')
if (file) {
  file = JSON.parse(file)
}
// pathName
let pathName = localStorage.getItem('pathName')
if (pathName) {
  pathName = JSON.parse(pathName)
}
export const state = () => ({
  file,
  pathName,
  refreshFolder: null
})

export const mutations = {
  setFile (state, file) {
    state.file = file
    localStorage.setItem('file', JSON.stringify(file))
  },
  setPath (state, path) {
    state.file = path
    localStorage.setItem('path', JSON.stringify(path))
  },
  setRefreshFolder (state, date) {
    state.refreshFolder = date
  },
  setPathName (state, pathName) {
    state.pathName = pathName
  }
}

export const getters = {
  getFile (state) {
    return state.file
  },
  getPath (state) {
    return state.path
  }
}
