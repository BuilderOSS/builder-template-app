#!/usr/bin/env npx tsx
/* eslint-disable no-console */

import { PUBLIC_ALL_CHAINS, TESTNET_CHAINS } from '@buildeross/constants/chains'
import { getFetchableUrls } from '@buildeross/ipfs-service/gateway'
import { getDAOAddresses, metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils'
import { config } from 'dotenv'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import sharp from 'sharp'
// Load environment variables from .env.local and .env files
config({ path: ['.env.local', '.env'] })

async function generateFavicon(imageUrl: string): Promise<boolean> {
  if (!imageUrl) {
    console.warn('⚠️  No image URL provided, skipping favicon generation')
    return false
  }

  try {
    console.log(`🔄 Generating favicon from image: ${imageUrl}`)

    // Get fetchable URLs for the IPFS image
    const imageUrls = await getFetchableUrls(imageUrl)
    if (!imageUrls || imageUrls.length === 0) {
      console.warn(
        '⚠️  Could not get fetchable URLs for image, skipping favicon generation'
      )
      return false
    }

    // Fetch the image
    const response = await fetch(imageUrls[0])
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer())

    // Detect content type from response headers for logging
    const contentType = response.headers.get('content-type') || ''
    console.log(`📋 Detected image type: ${contentType}`)

    // Save as icon.png in public folder
    const publicDir = join(process.cwd(), 'public')
    const faviconPath = join(publicDir, 'icon.png')

    // Convert to PNG format with optimal settings
    const faviconBuffer = await sharp(imageBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
        kernel: sharp.kernel.lanczos3,
      })
      .png({
        compressionLevel: 6,
        quality: 100,
        palette: false,
      })
      .toBuffer()

    writeFileSync(faviconPath, faviconBuffer)
    console.log(`✅ Favicon generated and saved to ${faviconPath}`)

    return true
  } catch (error) {
    console.warn('⚠️  Failed to generate favicon:', error)
    console.warn('   Continuing without favicon generation...')
    return false
  }
}

async function fetchDaoAddresses() {
  // Get environment variables
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID
  const daoTokenAddress = process.env.NEXT_PUBLIC_DAO_TOKEN_ADDRESS
  const networkType = process.env.NEXT_PUBLIC_NETWORK_TYPE

  if (!chainId) {
    console.error('❌ NEXT_PUBLIC_CHAIN_ID environment variable is required')
    process.exit(1)
  }

  if (!daoTokenAddress) {
    console.error('❌ NEXT_PUBLIC_DAO_TOKEN_ADDRESS environment variable is required')
    process.exit(1)
  }

  const parsedChainId = parseInt(chainId) as CHAIN_ID

  if (isNaN(parsedChainId)) {
    console.error('❌ NEXT_PUBLIC_CHAIN_ID must be a valid number')
    process.exit(1)
  }

  // Validate address format (basic check)
  if (!daoTokenAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.error('❌ NEXT_PUBLIC_DAO_TOKEN_ADDRESS must be a valid Ethereum address')
    process.exit(1)
  }

  // Find the chain object
  const daoChain = PUBLIC_ALL_CHAINS.find((chain) => chain.id === parsedChainId)

  if (!daoChain) {
    console.error(`❌ Chain with ID ${parsedChainId} not found in supported chains`)
    console.error(
      '   Supported chains:',
      PUBLIC_ALL_CHAINS.map((c) => `${c.name} (${c.id})`).join(', ')
    )
    process.exit(1)
  }

  if (TESTNET_CHAINS.some((c) => c.id === parsedChainId) && networkType !== 'testnet') {
    console.error(`❌ NEXT_PUBLIC_NETWORK_TYPE must be "testnet" to use testnet chains`)
    process.exit(1)
  }

  console.log(
    `🔄 Fetching DAO addresses for chain ${daoChain.name} (${parsedChainId}) and token ${daoTokenAddress}...`
  )

  try {
    // Fetch DAO addresses using the SDK
    const addresses = await getDAOAddresses(parsedChainId, daoTokenAddress as AddressType)

    if (!addresses || Object.values(addresses).some((address) => !address)) {
      console.error('❌ Could not fetch DAO addresses. This may indicate:')
      console.error('   - The DAO does not exist on this network')
      console.error('   - The token address is incorrect')
      console.error('   - The DAO has not been properly initialized')
      process.exit(1)
    }

    // Fetch DAO name using the token contract
    const provider = getProvider(parsedChainId)
    let daoName = 'DAO' // fallback

    try {
      daoName = (await provider.readContract({
        address: addresses.token,
        abi: tokenAbi,
        functionName: 'name',
      })) as string
      console.log(`✅ Successfully fetched DAO name: ${daoName}`)
    } catch {
      console.warn('⚠️  Could not fetch DAO name, using fallback "DAO"')
    }

    let contractImage = '' // fallback

    try {
      contractImage = (await provider.readContract({
        address: addresses.metadata!,
        abi: metadataAbi,
        functionName: 'contractImage',
      })) as string
      console.log(`✅ Successfully fetched DAO contract image: ${contractImage}`)
    } catch {
      console.warn('⚠️  Could not fetch DAO contract image, using fallback ""')
    }

    console.log('✅ Successfully fetched DAO addresses:')
    console.log(`   Chain: ${daoChain.name} (${daoChain.id})`)
    console.log(`   Name: ${daoName}`)
    console.log(`   Image: ${contractImage}`)
    console.log(`   Token: ${addresses.token}`)
    console.log(`   Auction: ${addresses.auction}`)
    console.log(`   Governor: ${addresses.governor}`)
    console.log(`   Metadata: ${addresses.metadata}`)
    console.log(`   Treasury: ${addresses.treasury}`)

    // Generate favicon from contract image
    await generateFavicon(contractImage)

    // Create the config directory if it doesn't exist
    const configDir = join(process.cwd(), 'src/config')
    mkdirSync(configDir, { recursive: true })

    // Create the configuration object
    const config = {
      chainId: parsedChainId,
      addresses,
      name: daoName,
      image: contractImage,
    }

    // Write to static file
    const configPath = join(configDir, 'dao.json')
    writeFileSync(configPath, JSON.stringify(config, null, 2))

    console.log(`📁 Configuration saved to ${configPath}`)

    // Also create a TypeScript file for easier imports
    const tsConfigContent = `// This file is auto-generated by scripts/fetchDaoAddresses.ts
// Do not edit manually

import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { AddressType, Chain, CHAIN_ID } from '@buildeross/types'
import { RequiredDaoContractAddresses, DaoConfig } from './types'

const DAO_CHAIN_ID: CHAIN_ID = ${parsedChainId}

const DAO_CHAIN: Chain = PUBLIC_DEFAULT_CHAINS.find(
  (chain) => chain.id === DAO_CHAIN_ID
)!

const DAO_ADDRESSES: RequiredDaoContractAddresses = {
  token: '${addresses.token}' as AddressType,
  auction: '${addresses.auction}' as AddressType,
  governor: '${addresses.governor}' as AddressType,
  metadata: '${addresses.metadata}' as AddressType,
  treasury: '${addresses.treasury}' as AddressType,
} as const

export const DAO_CONFIG: DaoConfig = {
  chain: DAO_CHAIN,
  addresses: DAO_ADDRESSES,
  name: '${daoName}',
  image: '${contractImage}',
} as const
`

    const tsConfigPath = join(configDir, 'dao.ts')
    writeFileSync(tsConfigPath, tsConfigContent)

    console.log(`📁 TypeScript configuration saved to ${tsConfigPath}`)
    console.log('🎉 DAO configuration setup complete!')
  } catch (error) {
    console.error('❌ Error fetching DAO addresses:', error)
    process.exit(1)
  }
}

// Run the script
fetchDaoAddresses().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
