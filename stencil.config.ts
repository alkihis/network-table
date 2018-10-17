import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'network-table',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};