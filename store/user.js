const user = localStorage.getItem('user')
export const state = () => ({
  user
})

export const mutations = {
  setUser (state, user) {
    state.user = user
    localStorage.setItem('user', user)
  }
}

export const getters = {
  getUser (state) {
    return state.user
  }
}
