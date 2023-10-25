import { api } from '@/api'
import { BridgeChain } from '@/types'

export const fetchChains = async () => {
  const { data } = await api.get<BridgeChain[]>('/v1/chains', {
    include: ['token'],
  })
  return data
}
