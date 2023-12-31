import React from 'react'
import { useCookies } from 'react-cookie'
import {
  Keys,
  GPTModel,
} from '../openai/index.js'

export const OpenAISetup = ({
  className = '',
}): React.JSX.Element => {
  return (
    <div className={`QuestChatBody ${className}`}>
      <p>Setup your OpenAI keys (cookies)</p>
      <p>⏺ <KeySetup keyName={Keys.OPENAI_API_KEY} prefix='sk-' /></p>
      <p>⏺ <KeySetup keyName={Keys.OPENAI_ORG_ID} prefix='org-' /></p>
      <p>GPT model compatible with your keys (GPT-4 recommended!)</p>
      <p>⏺ <ModelSetup /></p>
    </div>
  )
}

type KeySetupProps = {
  keyName: Keys
  prefix: string
}

const KeySetup = ({
  keyName,
  prefix,
}: KeySetupProps): React.JSX.Element => {
  const [cookies, setCookie] = useCookies(Object.values(Keys))

  const isValid = cookies[keyName] && cookies[keyName].startsWith(prefix)

  const _setupCookie = () => {
    const value = window.prompt(`Enter your ${keyName}`, cookies[keyName])
    setCookie(keyName, value, { path: '/' })
  }

  return (
    <span>
      {keyName}:&nbsp;
      {isValid
        ? <>
          <span className='QuestChatValidKey'>OK</span>
          {' '}
          (<span className='QuestChatInvalidKey QuestChatClickable' onClick={() => _setupCookie()}>edit</span>)
        </>
        : <>
          <span className='invalidKeyStyle'>NOT SET</span>
          {' '}
          (<span className='QuestChatInvalidKey QuestChatClickable' onClick={() => _setupCookie()}>edit</span>)
        </>
      }
    </span>
  )
}

const ModelSetup = (): React.JSX.Element => {
  const [cookies, setCookie] = useCookies([Keys.GPT_MODEL])

  const isGPT3 = cookies[Keys.GPT_MODEL] == GPTModel.GPT3
  const isGPT4 = cookies[Keys.GPT_MODEL] == GPTModel.GPT4

  const _setupCookie = (value: string) => {
    setCookie(Keys.GPT_MODEL, value, { path: '/' })
  }

  return (
    <span>
      {Keys.GPT_MODEL}:&nbsp;
      {isGPT3 ? <span className='QuestChatValidKey QuestChatClickable'>GPT3</span> : <span className='QuestChatClickable' onClick={() => _setupCookie(GPTModel.GPT3)}>GPT3</span>}
      {' / '}
      {isGPT4 ? <span className='QuestChatValidKey QuestChatClickable'>GPT4</span> : <span className='QuestChatClickable' onClick={() => _setupCookie(GPTModel.GPT4)}>GPT4</span>}
    </span>
  )
}
