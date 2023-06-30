import React, { useEffect, useMemo } from 'react'
import {
  Keys, getKey,
  ChatHistory,
  PromptAgentOptions,
} from '../openai/index.js'
import {
  usePromptChat,
} from '../hooks/index.js'


interface ChatRequestProps {
  prompt: string | null,
  previousHistory: ChatHistory,
  agentMetadata: string | null,
  onDone: (h: ChatHistory, m: string | null) => any,
}

export const ChatRequest = ({
  prompt,
  previousHistory,
  agentMetadata,
  onDone,
}: ChatRequestProps): React.JSX.Element => {

  const gptModel = getKey(Keys.GPT_MODEL)

  const options: PromptAgentOptions = {
    gptModel,
    history: previousHistory,
    prompt: prompt ? prompt : 'Hello',
    agentMetadata : agentMetadata ?? '{}',
  }

  const { isWaiting, message, error, history: newHistory } = usePromptChat(options)
  console.log(`+++++ META PROMPT OPTIONS isWaiting, message, error`, options, isWaiting, message, error)

  useEffect(() => {
    if (!isWaiting) {
      if (error) {
        onDone([], error ?? message ?? 'ERROR' )
      } else {
        onDone(newHistory, null)
      }
    }
  }, [isWaiting, message, error,  newHistory])

  const meta = useMemo(() => JSON.parse(agentMetadata ?? '{}'), [agentMetadata])
  const agentName = meta.name ?? '[agent not found]'

  return (
    <div>
      <div>
        {isWaiting ?
          (previousHistory.length == 0 ?
            <span>Starting chat with <span className='QuestChatTitle'>{agentName}</span>...</span>
            : <span className='QuestChatInfo'>Waiting for {agentName}...</span>)
          : 'got it'}
      </div>
      {error &&
        <div>{error}</div>
      }
    </div>
  )
}
