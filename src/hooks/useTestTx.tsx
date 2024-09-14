import { Binary, Transaction } from 'polkadot-api'
import { sr25519CreateDerive } from '@polkadot-labs/hdkd'
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers'
import { getPolkadotSigner } from 'polkadot-api/signer'
import { useNetwork } from '@/contexts/NetworkContext'
import { useCallback } from 'react'

export const useTestTx = () => {
  const { api } = useNetwork()
  const derive = sr25519CreateDerive(
    entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE)),
  )
  const aliceKeyPair = derive('//Alice')
  const aliceSigner = getPolkadotSigner(
    aliceKeyPair.publicKey,
    'Sr25519',
    aliceKeyPair.sign,
  )

  const isExhaustsResources = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (tx: Transaction<any, any, any, undefined>) => {
      if (!api) return null

      // create the signed extrinsic
      const signedTx = await tx.sign(aliceSigner)
      // see what the result of this extrinsic would be against the current best-block
      const dryRunResult = await api.apis.BlockBuilder.apply_extrinsic(
        Binary.fromOpaqueHex(signedTx),
        { at: 'best' },
      )
      // `dryRunResult` is a strongly typed object, so if `success` is false, then
      // the value will have a strongly typed enum with the reason why it didn't succeed
      console.log('dryRunResult', dryRunResult)
      // In your case it would print:
      // {
      //  success: false,
      //  value: {
      //    type: "Invalid",
      //    value: {
      //      type: "ExhaustsResources",
      //      value: undefined,
      //    },
      //  },
      // }

      // Therefore, you could first check whether the dryRun worked before
      // broadcasting the transaction
      if (
        !dryRunResult.success &&
        dryRunResult.value.type === 'Invalid' &&
        dryRunResult.value.value.type === 'ExhaustsResources'
      ) {
        return true
      }

      return false
    },
    [api, aliceSigner],
  )

  return { isExhaustsResources }
}
