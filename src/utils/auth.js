//
const localStorage = window.localStorage

export function getStorageByKey(key) {
  return localStorage.getItem(key)
}

export function setStorageByKey(key, data) {
  return localStorage.setItem(key, data)
}
