import urls from "../config/urlsConfig"
import { api } from "./api"

const endpoints =  {
    getStock: async () => {
        return api.get(urls.stock)
    },

    getProducts: async () => {
        return api.get(urls.products)
    },

    getStockById: async (id: string) => {
        return api.get(urls.stock + `/${id}`)
    },

    getProductById: async (id: string) => {
        return api.get(urls.products + `/${id}`)
    },
}

export default endpoints;