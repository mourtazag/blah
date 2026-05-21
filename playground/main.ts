import Blah from '../src/index'

const isDev = import.meta.env.DEV

const logger = new Blah({
  namespace: {
    name: 'Blah',
    style: {
      color: 'white',
      bgColor: 'orange',
    },
  },
  argStyles: [
    {
      color: 'white',
      bgColor: 'blue',
    },
    {
      color: 'white',
      bgColor: 'yellow',
    },
  ],
  logging: {
    enabled: true,
    warn: false,
  },
  debug: isDev,
})

if (isDev) {
  logger.log('dev mode: debug overrides logging (warn is on)')
} else {
  logger.warn('production build: this warn is muted unless debug is set')
}

const btn = document.querySelector<HTMLButtonElement>('#btn-primary')
const clickOutput = document.querySelector<HTMLOutputElement>('#click-output')
const messageInput = document.querySelector<HTMLInputElement>('#message-input')
const messageOutput =
  document.querySelector<HTMLParagraphElement>('#message-output')

let clicks = 0

btn?.addEventListener('click', () => {
  logger.log('Clicked', 'worked awesome', 'another one')
  clicks += 1
  if (clickOutput) {
    clickOutput.textContent = `Clicked ${clicks} time${clicks === 1 ? '' : 's'}.`
  }
})

function updateMessage() {
  if (!messageOutput || !messageInput) return
  messageOutput.textContent = messageInput.value.trim() || '(empty)'
}

messageInput?.addEventListener('input', updateMessage)
updateMessage()
