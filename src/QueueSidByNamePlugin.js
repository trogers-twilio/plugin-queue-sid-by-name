import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from 'flex-plugin';

const PLUGIN_NAME = 'QueueSidByNamePlugin';

export default class QueueSidByNamePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    let taskQueues;
    const queueSearch = (await manager.insightsClient.instantQuery('tr-queue')).on(
      'searchResult',
      (items) => {
        console.debug('queuesSearch result:', items);
        taskQueues = items;
      }
    );
    queueSearch.search('');

    const findQueueSidByName = (name) => {
      const queueSids = Object.keys(taskQueues);
      let result;
      for(let i = 0; i < queueSids.length; i++) {
        const sid = queueSids[i];
        const queue = taskQueues[sid];
        if (queue.queue_name === name) {
          result = sid;
          break;
        }
      }
      return result;
    }

    flex.Actions.addListener('beforeStartOutboundCall', (payload) => {
      const queueName = 'Sales_en';
      const queueSid = findQueueSidByName(queueName);
      if (queueSid) {
        console.debug('Changing outbound queue SID to', queueSid);
        payload.queueSid = queueSid;
      }
    })
  }
}
