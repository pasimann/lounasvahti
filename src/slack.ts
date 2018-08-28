import { EventEmitter } from 'events'
import { WebClient, RTMClient, RTMCallResult, WebAPICallResult } from '@slack/client'

export type SlackClientOptions = {
  user: string
  token: string
  channel: string
}

export class SlackMessage {
  public readonly channel: string
  public readonly content: string
  public readonly ts: string

  private client: RTMClient

  constructor (client: RTMClient, message: any) {
    this.client = client
    this.content = message.text
    this.channel = message.channel
    this.ts = message.ts
  }

  public reply (message: string): Promise<RTMCallResult> {
    return this.client.sendMessage(message, this.channel)
  }
}

export interface IMessage extends WebAPICallResult {
  ts?: string
}

export class SlackClient extends EventEmitter {
  public static MESSAGE: string = 'message'

  private id: string
  private options: SlackClientOptions

  private webClient: WebClient
  private rtmClient: RTMClient

  constructor (options: SlackClientOptions) {
    super()
    this.options = options
    this.webClient = new WebClient(this.options.token)
    this.rtmClient = new RTMClient(this.options.token)
  }

  public initialize (): Promise<void> {
    return new Promise((resolve, reject) => {
      this.rtmClient.start()
      this.rtmClient.on('message', (message) => {
        if (this.shouldReplyToMessage(message)) {
          this.emit(SlackClient.MESSAGE, new SlackMessage(this.rtmClient, message))
        }
      })
      this.rtmClient.on('authenticated', (auth) => {
        this.id = auth.self.id
        resolve()
      })
      this.rtmClient.on('unable_to_rtm_start', err => reject(err))
    })
  }

  public async post (message: string, ts?: string): Promise<IMessage> {
    const options = {
      as_user: this.options.user ? true : false
    }
    return this.webClient.chat.postMessage({ channel: this.options.channel, text: message, thread_ts: ts, ...options })
  }

  private shouldReplyToMessage (message): boolean {
    return (
      message.text &&
      message.user !== this.id &&
      message.channel === this.options.channel &&
      message.text.includes(`<@${this.id.toUpperCase()}>`))
  }
}
