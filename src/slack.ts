import { EventEmitter } from 'events'
import { WebClient, RtmClient, RTM_EVENTS, CLIENT_EVENTS } from '@slack/client'

export type SlackClientOptions = {
  user: string | undefined
  token: string | undefined
  channel: string | undefined
}

export class SlackMessage {
  public readonly channel: string
  public readonly content: string

  private client: RtmClient

  constructor (client: RtmClient, message: any) {
    this.client = client
    this.content = message.text
    this.channel = message.channel
  }

  public reply (message: string): Promise<void> {
    return this.client.sendMessage(message, this.channel)
  }
}

export class SlackClient extends EventEmitter {
  public static MESSAGE: string = 'message'

  private id: string
  private options: SlackClientOptions

  private webClient: WebClient
  private rtmClient: RtmClient

  constructor (options: SlackClientOptions) {
    super()
    this.options = options
    this.webClient = new WebClient(this.options.token)
    this.rtmClient = new RtmClient(this.options.token)
  }

  public initialize (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.rtmClient.start()
      this.rtmClient.on(RTM_EVENTS.MESSAGE, (message) => {
        if (this.shouldReplyToMessage(message)) {
          this.emit(SlackClient.MESSAGE, new SlackMessage(this.rtmClient, message))
        }
      })
      this.rtmClient.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (auth) => {
        this.id = auth.self.id
        resolve()
      })
      this.rtmClient.on(CLIENT_EVENTS.RTM.UNABLE_TO_RTM_START, err => reject(err))
    })
  }

  public post (message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const options = {
        as_user: this.options.user
      }
      this.webClient.chat.postMessage(this.options.channel, message, options, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }

  private shouldReplyToMessage (message): boolean {
    return (
      message.text &&
      message.user !== this.id &&
      message.text.includes(`<@${this.id.toUpperCase()}>`))
  }
}
