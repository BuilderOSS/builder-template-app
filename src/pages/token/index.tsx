import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { OrderDirection, SubgraphSDK, Token_OrderBy } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { GetServerSideProps } from 'next'

import { getDaoConfig, RequiredDaoContractAddresses } from '@/config'

interface TokenIndexPageProps {
  addresses: RequiredDaoContractAddresses
  chainId: CHAIN_ID
}

export default function TokenIndex({
  addresses: _addresses,
  chainId: _chainId,
}: TokenIndexPageProps) {
  // This should not render as getServerSideProps handles redirection
  return null
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { maxAge, swr } = CACHE_TIMES.DAO_INFO
  res.setHeader(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${swr}`
  )

  try {
    const daoConfig = getDaoConfig()
    const { chain, addresses } = daoConfig

    // Get the latest token ID
    const latestTokenId = await SubgraphSDK.connect(chain.id)
      .tokens({
        where: {
          dao: addresses.token.toLowerCase(),
        },
        orderBy: Token_OrderBy.TokenId,
        orderDirection: OrderDirection.Desc,
        first: 1,
      })
      .then((x) => (x.tokens.length > 0 ? x.tokens[0].tokenId : undefined))

    if (!latestTokenId) {
      // If no tokens exist yet, redirect to home (PreAuction page)
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      }
    }

    // Redirect to the latest token page
    return {
      redirect: {
        destination: `/token/${latestTokenId}`,
        permanent: false,
      },
    }
  } catch (e) {
    console.error('Error fetching latest token:', e)
    return {
      notFound: true,
    }
  }
}
