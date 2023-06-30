import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { ChatCompletionRequestMessageRoleEnum } from 'openai'
import { useDocument, QuestEncounterDoc } from 'hyperbox-sdk'
import { ChatHistory } from '../openai/index.js'
import { ChatRequest } from '../components/index.js'

export const ChatMessages = ({
  // @ts-ignore
  history,
  timestamp = 0,
  agentName = '',
  playerName = '',
  isHalted = false,
}): React.JSX.Element => {

  const _makeTopic = (key: string, role: ChatCompletionRequestMessageRoleEnum, content: string) => {
    const isAgent = (role == ChatCompletionRequestMessageRoleEnum.Assistant)
    const className = isAgent ? 'QuestChatAgentTopic' : 'QuestChatUserTopic'
    return (
      <div key={key} className={className}>
        <div className='QuestChatTitle'>{isAgent ? agentName : playerName}</div>
        <div>{content}</div>
      </div>
    )
  }

  const topics = useMemo(() => {
    let result = []
    for (let i = isHalted ? 0 : 4; i < history.length; ++i) {
      const h = history[i]
      if (h.content) {
        // const isAgent = (h.role == ChatCompletionRequestMessageRoleEnum.Assistant)
        // const className = isAgent ? 'QuestChatAgentTopic' : 'QuestChatUserTopic'
        result.push(_makeTopic(`t_${i}`, h.role, h.content))
      }
    }
    return result
  }, [history])

  return (
    <>
      {topics.length > 0 &&
        <p className='QuestChatSmaller'>chat id: {timestamp}</p>
      }
      {topics}
    </>
  )
}

export const ChatDialog = ({
  // @ts-ignore
  store,
  realmCoord = 1n,    // real coord, always 1n until we implement multiple Realms
  chamberSlug = '',   // chamber coord
  playerName = 'Player',
  isChatting = false,
  onStopChatting = () => { },
}): React.JSX.Element => {
  const [history, setHistory] = useState<ChatHistory>([])
  const [prompt, setPrompt] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)
  const [isHalted, setIsHalted] = useState(false)
  const [timestamp, setTimestamp] = useState(0)

  useEffect(() => {
    if (isChatting) {
      setHistory([])
      setIsRequesting(true)
      setIsHalted(false)
      setTimestamp(Date.now())
    }
  }, [isChatting])

  const metadata = useDocument('questAgent', chamberSlug, store)
  // console.log(`------ GOT METADATA`, chamberSlug, metadata)

  const agentName = useMemo(() => (metadata?.name ?? '[no agent metadata]'), [metadata])
  const agentMetadata = useMemo(() => (metadata?.metadata ?? null), [metadata])

  const _makeTopic = (key: string, role: ChatCompletionRequestMessageRoleEnum, content: string) => {
    const isAgent = (role == ChatCompletionRequestMessageRoleEnum.Assistant)
    const className = isAgent ? 'QuestChatAgentTopic' : 'QuestChatUserTopic'
    return (
      <div key={key} className={className}>
        <div className='QuestChatTitle'>{isAgent ? agentName : playerName}</div>
        <div>{content}</div>
      </div>
    )
  }

  const topics = useMemo(() => {
    let result = []
    for (let i = isHalted ? 0 : 4; i < history.length; ++i) {
      const h = history[i]
      if (h.content) {
        // const isAgent = (h.role == ChatCompletionRequestMessageRoleEnum.Assistant)
        // const className = isAgent ? 'QuestChatAgentTopic' : 'QuestChatUserTopic'
        result.push(_makeTopic(`t_${i}`, h.role, h.content))
      }
    }
    return result
  }, [history])

  const _submit = () => {
    setIsRequesting(true)
  }

  const _onDone = (newHistory: ChatHistory, error: string | null) => {
    setIsRequesting(false)
    setPrompt('')
    if (error) {
      setHistory([
        { role: ChatCompletionRequestMessageRoleEnum.Assistant, content: error },
      ])
      setIsHalted(true)
    } else {
      setHistory(newHistory)
      // save encounter only if user has interacted
      if (newHistory.length > 5) {
        QuestEncounterDoc.updateEncounter(store, timestamp, realmCoord, chamberSlug, playerName, agentName, newHistory)
      }
    }
  }

  const waitingToSubmit = (!isRequesting && !isHalted)
  const canSubmit = (waitingToSubmit && prompt.length > 0)

  if (!isChatting) return <></>

  return (
    <div className='QuestChatBody QuestChatDialog'>

      <div className='QuestChatContent'>
        <ChatMessages
          timestamp={timestamp}
          history={history}
          agentName={agentName}
          playerName={playerName}
          isHalted={isHalted}
        />
        {isRequesting &&
          <div>
            {history.length > 0 && _makeTopic('prompt', ChatCompletionRequestMessageRoleEnum.User, prompt)}
            <ChatRequest prompt={prompt} previousHistory={history} onDone={_onDone} agentMetadata={agentMetadata} />
          </div>
        }
        {waitingToSubmit &&
          <div className='QuestChatInfo'>{agentName} is waiting for your answer...</div>
        }
      </div>

      <div className='QuestChatInputRow'>
        <input disabled={isRequesting} className='QuestChatReset QuestChatInputField' value={prompt} onChange={(e) => setPrompt(e.target.value)}></input>
        <button disabled={!canSubmit} className='QuestChatReset QuestChatSubmitButton' onClick={() => _submit()}>Answer</button>
      </div>

    </div>
  )
}
