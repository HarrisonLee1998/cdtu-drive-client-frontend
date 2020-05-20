let user = localStorage.getItem('user')
if (user) {
  user = JSON.parse(user)
}
export const state = () => ({
  user
})

export const mutations = {
  setUser (state, user) {
    state.user = user
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export const getters = {
  getUser (state) {
    return state.user
  }
}
